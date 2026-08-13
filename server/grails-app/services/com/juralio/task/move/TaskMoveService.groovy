/*
 * Copyright 2026 Graeme and Joanna Johnston
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.juralio.task.move

import com.juralio.auth.AppUser
import com.juralio.costs.CostsService
import com.juralio.matterevent.MatterEventService
import com.juralio.matterevent.payload.TaskMovedLevelAPayload
import com.juralio.matterevent.payload.TaskMovedNewParentPayload
import com.juralio.matterevent.payload.TaskMovedNewProjectPayload
import com.juralio.matter.CostsAuthorisationService
import com.juralio.matter.MatterAuthorisationService
import com.juralio.project.Project
import com.juralio.project.ProjectOverviewService
import com.juralio.project.ProjectService
import com.juralio.task.*
import com.juralio.task.blockers.TaskBlockerService
import com.juralio.task.datetime.TaskDateTimeHelperService
import com.juralio.task.exception.InvalidDestinationParent
import com.juralio.task.exception.MaximumTasksExceededException
import com.juralio.task.status.TaskStatus
import com.juralio.task.status.TaskStatusService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory

@Transactional
class TaskMoveService {

    protected final Log logger = LogFactory.getLog(getClass())

    TaskParentHelperService taskParentHelperService
    TaskMoveValidationHelperService taskMoveValidationHelperService
    TaskLevelChangeService taskLevelChangeService
    TaskService taskService
    TaskLinkService taskLinkService
    ProjectService projectService
    ProjectTaskMoveService projectTaskMoveService
    TaskDateTimeHelperService taskDateTimeHelperService
    TaskTreeHelperService taskTreeHelperService
    MatterEventService matterEventService
    TaskStatusService taskStatusService
    TaskConsistencyService taskConsistencyService
    TaskSiblingsService taskSiblingsService
    TaskBlockerService taskBlockerService
    TaskHierarchyHelperService taskHierarchyHelperService
    SpringSecurityService springSecurityService
    MatterAuthorisationService matterAuthorisationService
    CostsAuthorisationService costsAuthorisationService
    CostsService costsService
    TaskAuthorisationService taskAuthorisationService
    ProjectOverviewService projectOverviewService

    static final Integer LEVEL_A = 0

    private void publishTaskMove(Task task, Project project, Project oldProject, Task oldParent, Task newParent) {
        def payload
        if (oldProject) {
            payload = new TaskMovedNewProjectPayload(
                taskId: task.id, taskName: task.name, taskLevel: task.level,
                taskReferenceNumber: task.referenceNumber, taskStatus: task.status,
                projectId: project.id, projectName: project.name,
                oldProjectName: oldProject?.name)
        } else if (!newParent) {
            payload = new TaskMovedLevelAPayload(
                taskId: task.id, taskName: task.name, taskLevel: task.level,
                taskReferenceNumber: task.referenceNumber, taskStatus: task.status,
                projectId: project.id, projectName: project.name,
                oldParentName: oldParent?.name)
        } else {
            payload = new TaskMovedNewParentPayload(
                taskId: task.id, taskName: task.name, taskLevel: task.level,
                taskReferenceNumber: task.referenceNumber, taskStatus: task.status,
                projectId: project.id, projectName: project.name,
                oldParentName: oldParent?.name, newParentTaskName: newParent?.name)
        }
        matterEventService.publish(payload, springSecurityService.getCurrentUser() as AppUser, project.matter)
    }

    private static String getNewStatus(String movedStatus, String parentStatus) {
        if (movedStatus == parentStatus) {
            return parentStatus
        }
        if (movedStatus == 'not-started') {
            return 'in-progress'
        }
        if (movedStatus == 'in-progress') {
            return 'in-progress'
        }
        if (movedStatus == 'done') {
            return 'in-progress'
        }
    }

    private static boolean isSameDate(Date date1, Date date2){
        Calendar cal1 = Calendar.getInstance();
        Calendar cal2 = Calendar.getInstance();
        cal1.setTime(date1);
        cal2.setTime(date2);
        boolean sameDay = cal1.get(Calendar.DAY_OF_YEAR) == cal2.get(Calendar.DAY_OF_YEAR) &&
                cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR);
        return sameDay
    }

    private static def getDateTypeUpdate(String dateType, Task movedTask, Task updatedTask) {
        if (dateType == 'plannedStartDate') {
            if (!isSameDate(new Date(movedTask.plannedStartDate.getTime()),new Date(updatedTask.plannedStartDate.getTime())) && new Date(movedTask.plannedStartDate.getTime()) < new Date(updatedTask.plannedStartDate.getTime())) {
                return movedTask.plannedStartDate
            }
        }
        if (dateType == 'plannedEndDate') {
            if (!isSameDate(new Date(movedTask.plannedEndDate.getTime()),new Date(updatedTask.plannedEndDate.getTime())) &&new Date(movedTask.plannedEndDate.getTime()) > new Date(updatedTask.plannedEndDate.getTime())) {
                return movedTask.plannedEndDate
            }
        }
        if (dateType == 'actualStartDate') {
            if (!isSameDate(new Date(movedTask.actualStartDate.getTime()),new Date(updatedTask.actualStartDate.getTime())) &&new Date(movedTask.actualStartDate.getTime()) < new Date(updatedTask.actualStartDate.getTime())) {
                return movedTask.actualStartDate
            }
        }
        if (dateType == 'actualEndDate') {
            if (movedTask.actualEndDate && updatedTask.actualEndDate && !isSameDate(new Date(movedTask.actualEndDate.getTime()),new Date(updatedTask.actualEndDate.getTime())) &&new Date(movedTask.actualEndDate.getTime()) > new Date(updatedTask.actualEndDate.getTime())) {
                return movedTask.actualEndDate
            }
            else if(updatedTask.actualEndDate && !movedTask.actualEndDate){
                return null
            }
        }
        return null
    }

    private convertStatusChangeItems(Task movedTask, List<Task> affectedTasks) {
        def movedTaskStatus = movedTask.status
        def convertedAffectedTasks = []
        affectedTasks.each { affectedTask ->
            def newStatus = getNewStatus(movedTaskStatus, affectedTask.status)
            def updatesForAffectedTask = [id: affectedTask.id, newStatus: newStatus]
            ['plannedStartDate', 'plannedEndDate', 'actualStartDate', 'actualEndDate'].each { dateType ->
                if (affectedTask.getProperty(dateType) && movedTask.getProperty(dateType)) {
                    def newDate = getDateTypeUpdate(dateType, movedTask, affectedTask)
                    if (newDate) {
                        updatesForAffectedTask[dateType] = newDate
                    }
                } else if(affectedTask.status == TaskStatus.DONE.value() && newStatus != TaskStatus.DONE.value() && dateType == 'actualEndDate'){
                    //will remove AED
                    def newDate = getDateTypeUpdate(dateType, movedTask, affectedTask)
                    updatesForAffectedTask[dateType] = newDate
                }
            }
            convertedAffectedTasks = (convertedAffectedTasks << updatesForAffectedTask)
        }
        return convertedAffectedTasks
    }

    def moveTask(Task taskToMove, TaskMoveType type, Long parentId, Project sourceProject, Project destinationProject, boolean maintainTaskConsistency = false) throws InvalidDestinationParent {
        if(!taskAuthorisationService.hasMoveAccess(taskToMove.id,sourceProject.id)){
            throw new Exception()
        }
        def realTaskParent = taskToMove.parent
        def realTaskLevel = taskToMove.level
        if (!projectService.canAccessPrivateWorkstream(destinationProject)) {
            throw new InvalidDestinationParent('Invalid destinations')
        }


        if (parentId != null && parentId != 0 && !maintainTaskConsistency) { //check if it's a project
            taskToMove.parent = taskService.getTask(parentId, destinationProject.id)
            taskToMove.level = taskToMove.parent.level + 1
            taskToMove.tasks.size() //forces the collection to load incase of lazyloading being too slow
            def blockLinkChanges = taskConsistencyService.findBlockerConsistencyIssues(taskToMove, maintainTaskConsistency, false)
            def statusChanges = taskStatusService.findStatusConsistencyIssues(taskToMove, false, true)
            def dateChanges = []
            ['plannedStartDate', 'plannedEndDate', 'actualStartDate', 'actualEndDate'].each { dateType ->
                if (taskToMove.getProperty(dateType) != null) {
                    def m = [:]
                    m[dateType.toString()] = taskToMove.getProperty(dateType).format("yyyy-MM-dd'T'HH:MM:ss.SSS").toString() + 'Z'
                    List<Task> affectedTasks = taskConsistencyService.findStatusConsistencyIssues(taskToMove, m, [taskToMove], true, true)
                    if (affectedTasks.size() > 0) {
                        dateChanges = (dateChanges << affectedTasks).flatten()
                    }
                }
            }

            if (!maintainTaskConsistency && (statusChanges.size() > 0 || dateChanges.size() > 0 || blockLinkChanges.size() > 0)) {
                def convertedAffectedStatuses = convertStatusChangeItems(taskToMove, statusChanges)
                taskToMove.parent = realTaskParent
                taskToMove.level = realTaskLevel
                return dateChanges + convertedAffectedStatuses + blockLinkChanges
            }
            taskToMove.parent = realTaskParent
            taskToMove.level = realTaskLevel
        }
        taskToMove.save(flush: true)
        if (type == TaskMoveType.CROSS_PROJECT || type == TaskMoveType.CROSS_PROJECT_DIFFERENT_PARENT) {
            def blockLinkChanges = taskBlockerService.generateBlockedDataObject(taskToMove)
            if (blockLinkChanges.size() > 0 && !maintainTaskConsistency) {
                return blockLinkChanges
            } else if (blockLinkChanges.size() > 0 && maintainTaskConsistency) {
                blockLinkChanges.forEach(block -> {
                    taskBlockerService.deleteTaskBlocker(block)
                })
            }
        }

        List<Task> siblings = taskSiblingsService.getTaskSiblings(taskToMove)
        if (siblings.findAll { it.datesLinkedToSiblings == true }.size() == 1) {
            taskLinkService.unlink(siblings[0].id, sourceProject.id)
        }
        taskLinkService.unlink(taskToMove.id, sourceProject.id)
        def taskCount = taskTreeHelperService.getFlatTaskList(taskToMove).size()
        if ((destinationProject.tasks.size() + taskCount) >= Task.MAXIMUM_PROJECT_TASKS && sourceProject != destinationProject) {
            throw new MaximumTasksExceededException()
        }


        if (parentId != 0 && parentId != null) {
            Boolean isMarkedAsNotRequired = taskService.isMarkedAsNotRequired(parentId as long, destinationProject.id)
            if (isMarkedAsNotRequired) {
                throw new InvalidDestinationParent("Cannot move a task to be a child of a not-required task")
            }
        }


        if (type == TaskMoveType.PROJECT) {
            if (moveToTopLevel(taskToMove, destinationProject)) {
                publishTaskMove(taskToMove, destinationProject, null, taskParentHelperService.getParentTask(taskToMove.id), null)
                logger.debug("moved task with ID ${taskToMove.id} to top level")
            }
        } else if (type == TaskMoveType.TASK) {
            if (taskToMove.id != parentId) {
                Task newParentTask = taskService.getTaskOnly(parentId, destinationProject.id)
                AppUser currentUser = springSecurityService.getCurrentUser()
                if (costsAuthorisationService.organisationCostsEnabled(currentUser.organisation) && matterAuthorisationService.hasCostsAccess(destinationProject.matterId) && taskToMove.level==1 as short) {
                    costsService.removeTaskFromCosts(taskToMove)
                }
                if (moveToNewTaskParent(taskToMove, newParentTask)) {
                    List<TaskBlocker> toDelete = taskConsistencyService.findBlockerConsistencyIssues(taskToMove, maintainTaskConsistency, false)
                    publishTaskMove(taskToMove, destinationProject, null, taskParentHelperService.getParentTask(taskToMove.id), newParentTask)
                    logger.debug("moved task with ID ${taskToMove.id} to task ${newParentTask.id}")
                }
            }
        } else if (type == TaskMoveType.CROSS_PROJECT) {
            def counter = 0
            counter = taskService.postsInTaskTree(taskToMove,counter)
            if(counter +projectOverviewService.getPostCount(destinationProject) > Project.MAXIMUM_POSTS){
                throw new Exception()
            }
            Project destination = projectService.getProjectOnly(parentId)
            if (taskMoveValidationHelperService.isValidProjectMove(taskToMove, destination)) {
                projectTaskMoveService.moveTaskHierarchyToAnotherProject(taskToMove, destination)
                publishTaskMove(taskToMove, destination, destinationProject, null, null)
                logger.debug("moved task with ID ${taskToMove.id} to project ${destinationProject.id}")
            }
        } else if (type == TaskMoveType.CROSS_PROJECT_DIFFERENT_PARENT) {
            def counter = 0
            counter = taskService.postsInTaskTree(taskToMove,counter)
            if(counter + projectOverviewService.getPostCount(destinationProject)> Project.MAXIMUM_POSTS){
                throw new Exception()
            }
            if (parentId == LEVEL_A) {
                moveToTopLevel(taskToMove, destinationProject)
                projectTaskMoveService.moveTaskHierarchyToAnotherProject(taskToMove, destinationProject)
                publishTaskMove(taskToMove, destinationProject, sourceProject, null, null)
            } else {
                Task newParentTask = taskService.getTaskOnly(parentId, destinationProject.id)
                AppUser currentUser = springSecurityService.getCurrentUser()
                if (costsAuthorisationService.organisationCostsEnabled(currentUser.organisation) && matterAuthorisationService.hasCostsAccess(destinationProject.matterId) && taskToMove.level==1 as short) {
                    costsService.removeTaskFromCosts(taskToMove)
                }
                if (taskMoveValidationHelperService.isValidMove(taskToMove, newParentTask)) {
                    projectTaskMoveService.moveTaskHierarchyToAnotherProject(taskToMove, destinationProject)
                    moveToNewTaskParent(taskToMove, newParentTask)
                    publishTaskMove(taskToMove, destinationProject, sourceProject, null, null)
                }
            }

        }
        taskToMove.parent = taskHierarchyHelperService.getAncestor(taskToMove, taskToMove.project)
        return taskToMove
    }

    def unarchiveTask(Task taskToMove, TaskMoveType type, Integer parentId, Project project, boolean maintainTaskConsistency) {
        if(!taskAuthorisationService.hasUnarchiveAccess(taskToMove.id,project.id)){
            throw new Exception()
        }
        def counter = 0
        counter = taskService.postsInTaskTree(taskToMove,counter)
        if(counter +  projectOverviewService.getPostCount(project)> Project.MAXIMUM_POSTS){
            throw new Exception()
        }
        def realTaskParent = taskToMove.parent
        def realTaskLevel = taskToMove.level
        if (parentId != null && parentId != 0 && !maintainTaskConsistency) { //check if it's a project
            taskToMove.parent = taskService.getTaskOnly(parentId, project.id)
            taskToMove.level = taskToMove.parent.level + 1
            def statusChanges = taskStatusService.findStatusConsistencyIssues(taskToMove, false, true)
            def dateChanges = []
            ['plannedStartDate', 'plannedEndDate', 'actualStartDate', 'actualEndDate'].each { dateType ->
                try {
                    if (taskToMove.getProperty(dateType) != null) {
                        def m = [:]
                        m[dateType.toString()] = taskToMove.getProperty(dateType).format("yyyy-MM-dd'T'HH:MM:ss.SSS").toString() + 'Z'
                        def affectedTasks = taskConsistencyService.findStatusConsistencyIssues(taskToMove, m, [taskToMove], true)
                        if (affectedTasks.size() > 0) {
                            dateChanges = (dateChanges << affectedTasks).flatten()
                        }
                    }
                } catch (Exception ignored) {
                }
            }
            if (!maintainTaskConsistency && (statusChanges.size() > 0 || dateChanges.size() > 0)) {
                def convertedAffectedStatuses = convertStatusChangeItems(taskToMove, statusChanges)
                taskToMove.parent = realTaskParent
                taskToMove.level = realTaskLevel
                return dateChanges + convertedAffectedStatuses
            }
            taskToMove.parent = realTaskParent
            taskToMove.level = realTaskLevel
        }
        taskToMove.save()
        if (type == TaskMoveType.PROJECT) {
            if (moveToTopLevel(taskToMove, project)) {
                publishTaskMove(taskToMove, project, null, taskParentHelperService.getParentTask(taskToMove.id), null)
                logger.debug("moved task with ID ${taskToMove.id} to top level")
            }
        } else if (type == TaskMoveType.TASK) {
            if (taskToMove.id != parentId) {
                Task newParentTask = taskService.getTaskOnly(parentId, project.id)
                if (moveToNewTaskParent(taskToMove, newParentTask)) {
                    publishTaskMove(taskToMove, project, null, taskParentHelperService.getParentTask(taskToMove.id), newParentTask)
                    logger.debug("moved task with ID ${taskToMove.id} to task ${newParentTask.id}")
                }
            }
        } else if (type == TaskMoveType.CROSS_PROJECT) {
            Project destinationProject = projectService.getProjectOnly(parentId)
            if (taskMoveValidationHelperService.isValidProjectMove(taskToMove, destinationProject)) {
                projectTaskMoveService.moveTaskHierarchyToAnotherProject(taskToMove, destinationProject)
                publishTaskMove(taskToMove, destinationProject, project, null, null)
                logger.debug("moved task with ID ${taskToMove.id} to project ${destinationProject.id}")
            }
        } else if (type == TaskMoveType.CROSS_PROJECT_DIFFERENT_PARENT) {
            if (parentId == LEVEL_A) {
                moveToTopLevel(taskToMove, project)
                projectTaskMoveService.moveTaskHierarchyToAnotherProject(taskToMove, project)
            } else {
                Task newParentTask = taskService.getTaskOnly(parentId, project.id)
                if (taskMoveValidationHelperService.isValidMove(taskToMove, newParentTask)) {
                    projectTaskMoveService.moveTaskHierarchyToAnotherProject(taskToMove, project)
                    moveToNewTaskParent(taskToMove, newParentTask)
                }
            }
        }
        return taskToMove
    }

    private def moveToTopLevel(Task taskToMove, project) {
        def isValid = taskMoveValidationHelperService.isValidProjectMove(taskToMove, project)
        if (isValid) {
            removeFromOldParent(taskToMove)
            if(taskToMove.isMilestone){
                taskToMove.isMilestone = false
                taskToMove.save(flush: true)
            }else if(taskToMove.isDeliverable){
                taskToMove.isDeliverable = false
                taskToMove.save(flush: true)
            }
            taskLevelChangeService.updateLevel(taskToMove, Task.LEVEL_A)
        }
        return isValid
    }

    private def updateParentStatus(Task taskToUpdate, String childStatus, Task child) {
        if (childStatus == TaskStatus.DONE.value()) {
            if (taskToUpdate.getStatus() != TaskStatus.DONE.value()) {
                taskToUpdate.setStatus(TaskStatus.IN_PROGRESS.value())
                taskToUpdate.save()
            }
        }
        if (childStatus == TaskStatus.IN_PROGRESS.value()) {
            if (taskToUpdate.getStatus() != TaskStatus.IN_PROGRESS.value()) {
                taskToUpdate.setStatus(TaskStatus.IN_PROGRESS.value())
                taskToUpdate.actualStartDate = child.actualStartDate ? child.actualStartDate : taskToUpdate.actualStartDate
                taskToUpdate.actualEndDate = null
                taskToUpdate.save()

            }
        }
        if (taskToUpdate.getLevel() > 1) {
            if (!taskToUpdate.parent) {
                taskToUpdate = taskService.getTask(taskToUpdate.id, taskToUpdate.project.id)
            }
            Task taskParent = taskService.getTaskOnly(taskToUpdate.parent.id as long, taskToUpdate.project.id as long)

            updateParentStatus(taskParent, taskToUpdate.getStatus(), child)
        }
    }

    private def moveToNewTaskParent(Task taskToMove, Task newParentTask) {
        boolean isValid = taskMoveValidationHelperService.isValidMove(taskToMove, newParentTask)
        if (isValid) {
            Date currentDate = new Date()
            removeFromOldParent(taskToMove)
            taskLevelChangeService.updateLevel(taskToMove, newParentTask.getLevel() + 1)
            taskToMove.parent = newParentTask
            Date parentsPED = null
            Date parentsPSD = null
            Date parentsAED = null
            Date parentsASD = null
            getParents(taskToMove, true).forEach { Task t ->
                {
                    if (t.plannedEndDate && parentsPED != null) {
                        if (parentsPED.after(t.plannedEndDate)) {
                            parentsPED = t.plannedEndDate
                        }
                    } else if (t.plannedEndDate && parentsPED == null) {
                        parentsPED = t.plannedEndDate
                    }
                }
            }
            getParents(taskToMove, true).forEach { Task t ->
                {
                    if (t.actualEndDate && parentsAED != null) {
                        if (parentsAED.after(t.actualEndDate)) {
                            parentsAED = t.actualEndDate
                        }
                    } else if (t.actualEndDate && parentsAED == null) {
                        parentsAED = t.actualEndDate
                    }
                }
            }
            getParents(taskToMove, true).forEach { Task t ->
                {
                    if (t.plannedStartDate && parentsPSD != null) {
                        if (parentsPSD.after(t.plannedStartDate)) {
                            parentsPSD = t.plannedStartDate
                        }
                    } else if (t.plannedStartDate && parentsPSD == null) {
                        parentsPSD = t.plannedStartDate
                    }
                }
            }
            getParents(taskToMove, true).forEach { Task t ->
                {
                    if (t.actualStartDate && parentsASD != null) {
                        if (parentsASD.after(t.actualStartDate)) {
                            parentsASD = t.actualStartDate
                        }
                    } else if (t.actualStartDate && parentsASD == null) {
                        parentsASD = t.actualStartDate
                    }
                }
            }


            Date childAED = taskToMove.actualEndDate
            Date childASD = taskToMove.actualStartDate
            Date childPED = taskToMove.plannedEndDate
            Date childPSD = taskToMove.plannedStartDate

            if (newParentTask.status == TaskStatus.IN_PROGRESS.value() || newParentTask.status == TaskStatus.DONE.value()) {
                if (newParentTask.status == TaskStatus.DONE.value()) {
                    if (taskToMove.status == TaskStatus.IN_PROGRESS.value() || taskToMove.status == TaskStatus.NOT_STARTED.value()) {
                        newParentTask.status = TaskStatus.IN_PROGRESS.value()
                        if (taskToMove.actualStartDate && taskToMove.actualStartDate.before(newParentTask.actualStartDate)) {
                            newParentTask.actualStartDate = taskToMove.actualStartDate
                        }
                        newParentTask.actualEndDate = childAED
                    }
                    if (taskToMove.status == TaskStatus.IN_PROGRESS.value() && taskToMove.plannedEndDate == null && newParentTask.plannedEndDate && taskToMove.actualStartDate.after(newParentTask.plannedEndDate)) {
                        newParentTask.plannedEndDate = null
                    }

                    if (!parentsASD) {
                        newParentTask.actualStartDate = currentDate
                    }
                }
                if (parentsAED && childAED && parentsAED.getTime() < childAED.getTime()) {
                    newParentTask.actualEndDate = taskToMove.actualEndDate
                    List<Task> parentsByAED =   getParents(taskToMove, true).findAll{Task parent -> parent.actualEndDate && parent.actualEndDate.before(taskToMove.actualEndDate)}
                    //taskDateTimeHelperService.getMovedTasksParentsByDateBefore("actualEndDate", newParentTask, taskToMove)
                    if (parentsByAED.size() > 0) {
                        parentsByAED.each { Task parent ->
                            Date parentDate = parent.actualEndDate
                            if (parentDate) {
                                parent.actualEndDate = taskToMove.actualEndDate
                                parent.save(flush: true, failOnError: true)
                            }
                        }
                    }
                }
                if (parentsASD && childASD && parentsASD.getTime() > childASD.getTime()) {
                    newParentTask.actualStartDate = taskToMove.actualStartDate
                    List<Task> parentsByASD =  getParents(taskToMove, true).findAll{Task parent -> parent.actualStartDate && parent.actualStartDate.after(taskToMove.actualStartDate)}
                    //taskDateTimeHelperService.getMovedTasksParentsByDateAfter("actualStartDate", newParentTask, taskToMove)
                    if (parentsByASD.size() > 0) {
                        parentsByASD.each { Task parent ->
                            Date parentDate = parent.actualStartDate
                            if (parentDate) {
                                parent.actualStartDate = taskToMove.actualStartDate
                                parent.save(flush: true, failOnError: true)
                            }
                        }
                    }
                }

                if (parentsPED && childPED && taskToMove.status!=TaskStatus.DONE.value() && parentsPED.getTime() < childPED.getTime()) {
                    if(newParentTask.plannedEndDate!=null){
                        newParentTask.plannedEndDate = taskToMove.plannedEndDate
                    }
                    List<Task> parentsByPED =  getParents(taskToMove, true).findAll{Task parent -> parent.plannedEndDate && parent.plannedEndDate.before(taskToMove.plannedEndDate)}
                    //taskDateTimeHelperService.getMovedTasksParentsByDateBefore("plannedEndDate", newParentTask, taskToMove)

                    if (parentsByPED.size() > 0) {
                        parentsByPED.each { Task parent ->
                            Date parentDate = parent.plannedEndDate
                            if (parentDate) {
                                parent.plannedEndDate = taskToMove.plannedEndDate
                                parent.save(flush: true, failOnError: true)
                            }
                        }
                    }
                }
                if(parentsPED && childPSD && parentsPED.getTime()<childPSD.getTime()){
                    getParents(taskToMove,true).forEach {Task t->
                        if(t.plannedEndDate &&taskToMove.plannedStartDate.getTime() > t.plannedEndDate.getTime()){
                            t.plannedEndDate =taskToMove.plannedEndDate ? taskToMove.plannedEndDate : taskToMove.plannedStartDate
                            t.save(flush: true, failOnError: true)
                        }}
                }
                if(parentsPED && childASD && parentsPED.before(childASD)){
                    getParents(taskToMove,true).forEach {Task t->
                        if(t.plannedEndDate &&taskToMove.actualStartDate.getTime() > t.plannedEndDate.getTime()){
                            t.plannedEndDate =taskToMove.plannedEndDate ? taskToMove.plannedEndDate :null
                            t.save(flush: true, failOnError: true)
                        }}
                }
            }


            if (newParentTask.status == TaskStatus.NOT_STARTED.value()) {
                if (taskToMove.status == TaskStatus.IN_PROGRESS.value() || taskToMove.status == TaskStatus.DONE.value()) {
                    newParentTask.status = TaskStatus.IN_PROGRESS.value()
                    taskBlockerService.deleteBlockByParents(taskToMove, true)
                    newParentTask.actualStartDate = currentDate
                }
                if (parentsPSD && childPSD && parentsPSD.getTime() > childPSD.getTime()) {
                    getParents(taskToMove,true).forEach {Task t-> if(t.plannedStartDate &&taskToMove.plannedStartDate.getTime() < t.plannedStartDate.getTime()){
                        t.plannedStartDate = taskToMove.plannedStartDate
                        t.save(flush: true, failOnError: true)
                    }}
                }
//                if(parentsASD && childPSD && parentsASD.getTime() > childPSD.getTime() ){
//                    getParents(taskToMove,true).forEach {Task t-> if(t.actualStartDate &&taskToMove.plannedStartDate.getTime() < t.actualStartDate.getTime()){
//                        t.actualStartDate = taskToMove.plannedStartDate
//                        t.save(flush: true, failOnError: true)
//                    }}
//                }
//                if(parentsPED && childPSD && parentsPED.before(childPSD)){
//                    taskToMove.plannedStartDate = parentsPED
//                    taskTreeHelperService.getFlatTaskList(taskToMove).each { Task t ->
//                        if (t.plannedStartDate) {
//                            t.plannedStartDate = parentsPED
//                        }
//                    }
//                }
//                List<Task> parentsByPSD = taskDateTimeHelperService.getMovedTasksParentsByDateAfter("plannedStartDate", newParentTask, taskToMove)
//
//                if (parentsByPSD.size() > 0) {
//                    parentsByPSD.each { Task parent ->
//                        Date parentDate = parent.plannedStartDate
//                        if (parentDate && parentDate > taskToMove.plannedStartDate) {
//                            taskToMove.plannedStartDate = parentDate
//                            taskTreeHelperService.getFlatTaskList(taskToMove).each { Task t ->
//                                if (t.plannedStartDate) {
//                                    t.plannedStartDate = parentDate
//                                }
//                            }
//                        }
//                    }
//                }

                if (parentsPED && childPED && parentsPED.getTime() < childPED.getTime()) {
                    getParents(taskToMove,true).forEach {Task t-> if(t.plannedEndDate &&taskToMove.plannedEndDate.getTime() > t.plannedEndDate.getTime()){
                        t.plannedEndDate = taskToMove.plannedEndDate
                        t.save(flush: true, failOnError: true)
                    }}
                }
                if (parentsPED && childASD && parentsPED.getTime() < childASD.getTime()) {
                    getParents(taskToMove,true).forEach {Task t-> if(t.plannedEndDate &&taskToMove.actualStartDate.getTime() > t.plannedEndDate.getTime()){
                        t.plannedEndDate = null
                        t.save(flush: true, failOnError: true)
                    }}
                }
                if(parentsPSD && childPED && parentsPSD.getTime()>childPED.getTime()){
                    getParents(taskToMove,true).forEach {Task t->
                        if(t.plannedStartDate &&taskToMove.plannedEndDate.getTime() < t.plannedStartDate.getTime()){
                            t.plannedStartDate =taskToMove.plannedStartDate ? taskToMove.plannedStartDate : taskToMove.plannedEndDate
                            t.save(flush: true, failOnError: true)
                        }}
                }
                if(parentsPED && childPSD && parentsPED.getTime()<childPSD.getTime()){
                    getParents(taskToMove,true).forEach {Task t->
                        if(t.plannedEndDate &&taskToMove.plannedStartDate.getTime() > t.plannedEndDate.getTime()){
                            t.plannedEndDate =taskToMove.plannedEndDate ? taskToMove.plannedEndDate : taskToMove.plannedStartDate
                            t.save(flush: true, failOnError: true)
                        }}
                }
            }
            if (newParentTask.getLevel() > 1) {
                updateParentStatus(newParentTask, newParentTask.getStatus(), taskToMove)
            }
            newParentTask.addToTasks(taskToMove)

            def actual =getParents(taskToMove, true).findAll{Task parent -> parent.actualStartDate && taskToMove.actualStartDate && parent.actualStartDate.after(taskToMove.actualStartDate)}
            //taskDateTimeHelperService.getMovedTasksParentsByDateAfter('actualStartDate', newParentTask, taskToMove)
            def planned = getParents(taskToMove, true).findAll{Task parent -> parent.plannedStartDate && taskToMove.plannedStartDate && parent.plannedStartDate.after(taskToMove.plannedStartDate)}
            //taskDateTimeHelperService.getMovedTasksParentsByDateAfter('plannedStartDate', newParentTask, taskToMove)
            if (actual.size() > 0) {
                actual.forEach { t ->
                    t.actualStartDate = taskToMove.actualStartDate
                    t.save(flush: true, failOnError: true)
                }

            }
            if (planned.size() > 0) {
                planned.forEach { t ->
                    t.actualStartDate = taskToMove.actualStartDate
                    t.save(flush: true, failOnError: true)
                }

            }

            newParentTask.save()

        }
        isValid
    }

    def getChildren(Task t, Boolean add) {
        List<Task> tasks = []
        if (add) {
            tasks.push(t)
        }
        t.tasks?.each { tasks = (tasks << getChildren(it as Task, true)).flatten() }
        return tasks.flatten()
    }

    def getParents(Task t, isMove = false) {
        List<Task> tasks = []

        if (isMove) {
            if (t.parent && t.parent in Task) {
                tasks.push(t.parent)
                tasks = (tasks << getParents(t.parent)).flatten()
            }
        } else {
            def parentTask = taskParentHelperService.getParentTask(t.id)
            if (parentTask) {
                tasks.push(parentTask)
                tasks = (tasks << getParents(parentTask)).flatten()
            }
        }
        return tasks.flatten()
    }

    private def removeFromOldParent(Task taskToMove) {
        if (taskToMove.level > Task.LEVEL_A) {
            Task parentTask = taskParentHelperService.getParentTask(taskToMove.id)
            parentTask.removeFromTasks(taskToMove)
            parentTask.save()
        }
    }
}