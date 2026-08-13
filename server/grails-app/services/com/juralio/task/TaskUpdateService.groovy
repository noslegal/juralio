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

package com.juralio.task

import com.juralio.auth.AppUser
import com.juralio.matterevent.MatterEventService
import com.juralio.matterevent.payload.MarkedAsNotRequiredPayload
import com.juralio.project.ProjectService
import com.juralio.task.blockers.TaskBlockerService
import com.juralio.task.dao.TaskDAOService
import com.juralio.task.datetime.TaskDateTimeService
import com.juralio.task.exception.LinkedTaskWouldEndAfterParentException
import com.juralio.task.exception.LinkedTaskWouldEndBeforeItStarted
import com.juralio.task.exception.LinkedTaskWouldStartAfterItFinished
import com.juralio.task.exception.LinkedTaskWouldStartBeforeParentException
import com.juralio.task.move.TaskLinkService
import com.juralio.task.status.TaskStatus
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import org.apache.commons.lang.time.DateUtils

@Transactional
class TaskUpdateService {
    ProjectService projectService
    TaskSiblingsService taskSiblingsService
    MatterEventService matterEventService
    SpringSecurityService springSecurityService
    TaskNotRequiredUpdateService taskNotRequiredUpdateService
    TaskParentHelperService taskParentHelperService
    TaskLinkService taskLinkService
    TaskDateTimeService taskDateTimeService
    TaskDAOService taskDAOService
    TaskBlockerService taskBlockerService
    TaskConsistencyService taskConsistencyService


    Task handleStatusChangeToNotRequired(Task updatedTask) {
        Long performerId = (springSecurityService.currentUser as AppUser).id
        List<Long> notifyMemberIds = []
        updatedTask.teamMembers?.each { if (it.user && it.user.id != performerId) notifyMemberIds.add(it.user.id) }
        updatedTask.followers?.each { if (it.user && it.user.id != performerId) notifyMemberIds.add(it.user.id) }

        matterEventService.publish(new MarkedAsNotRequiredPayload(
            taskId: updatedTask.id, taskName: updatedTask.name, taskLevel: updatedTask.level,
            taskReferenceNumber: updatedTask.referenceNumber, taskStatus: updatedTask.status,
            projectId: updatedTask.project.id, projectName: updatedTask.project.name,
            notifyMemberIds: notifyMemberIds.unique()
        ), springSecurityService.currentUser as AppUser, updatedTask.project.matter)
        updatedTask.setDatesLinkedToSiblings(false)
        taskSiblingsService.clearSiblingDateLinking(updatedTask)
        updatedTask.updateMeta.subtasksUpdated = taskNotRequiredUpdateService.updateDetailsAndChildren(updatedTask)
        return updatedTask
    }

    void handleTaskStatusChange(Task updatedTask, String originalStatusName) {
        def parent
        if (updatedTask.level == 1) {
            parent = projectService.getProjectOnly(updatedTask.projectId)
        } else {
            parent = taskParentHelperService.getParentTask(updatedTask.id)
        }

        List<TaskBlocker> blockerList = taskBlockerService.getTaskBlockersByBlocker(updatedTask)
        List<TaskBlocker> blockedByList = taskBlockerService.getTaskBlockersByBlocked(updatedTask)

        def siblings = taskSiblingsService.getTaskSiblings(updatedTask)
        def tasks = parent.tasks.collect { it -> if (siblings.collect { s -> s.id }.contains(it.id)) { return it } }.findAll { it -> it != null }

        if (originalStatusName == TaskStatus.NOT_REQUIRED.value()) {
            tasks.add(updatedTask)
        }
        if (originalStatusName == TaskStatus.NOT_STARTED.value() && updatedTask.status != TaskStatus.NOT_REQUIRED.value()) {
            if(updatedTask.status == TaskStatus.IN_PROGRESS.value()){
                taskBlockerService.deleteBlockByParents(updatedTask,false)
            }
            if(updatedTask.status == TaskStatus.DONE.value()){
                taskBlockerService.deleteChildrenBlocksInTree(updatedTask)
                if(updatedTask.level>1){
                    taskBlockerService.deleteBlockByParents(updatedTask,false)
                }
            }
            tasks.add(updatedTask)
        } else if (originalStatusName == TaskStatus.DONE.value() && updatedTask.status != TaskStatus.NOT_REQUIRED.value()) {
            tasks.add(0, updatedTask)
        } else if (originalStatusName == TaskStatus.IN_PROGRESS.value() && updatedTask.status == TaskStatus.NOT_STARTED.value()) {
            tasks.add(0, updatedTask)
        } else if (originalStatusName == TaskStatus.IN_PROGRESS.value() && updatedTask.status == TaskStatus.DONE.value()) {
            taskBlockerService.deleteChildrenBlocksInTree(updatedTask)
            if(updatedTask.level>1){
                taskBlockerService.deleteBlockByParents(updatedTask,false)
            }
            tasks.add(updatedTask)
        }

        def tasksAsInDatabase = parent.tasks.collect()
        parent.tasks.clear()
        parent.updateMeta.subtasksUpdated = 0
        for (int i = 0; i < tasks.size(); i++) {
            Task childTask = tasks[i]
            parent.addToTasks(childTask)
        }
        def newTasks = parent.tasks
        def tasksNotAdded = tasksAsInDatabase - newTasks
        tasksNotAdded.each { parent.addToTasks(it) }
        parent.save(flush: true, failOnError: true)
    }

    def handleLinkedSiblingsDates(Task updatedTask, Date originalPlannedStartDate, Date updatedPlannedStartDate, boolean maintainTaskConsistencyUpdate, Date originalPlannedEndDate, Date updatedPlannedEndDate, String dateChangeType, int dateDifference) {
        Task t = taskDAOService.get(updatedTask.id)
        boolean isTaskLevelBorAbove = t.level > 1

        if (isTaskLevelBorAbove) {
            t.parent = taskParentHelperService.getParentTask(t.id)
        }

        if (updatedTask.datesLinkedToSiblings && [TaskStatus.DONE.value(), TaskStatus.NOT_REQUIRED.value()].contains(updatedTask.status)) {
            updatedTask.datesLinkedToSiblings = false
            taskSiblingsService.clearSiblingDateLinking(updatedTask)
        }

        if (originalPlannedStartDate != null && originalPlannedStartDate != updatedPlannedStartDate && updatedPlannedStartDate != null) {
            //validate the start dates
            List<Task> siblings = taskSiblingsService.getTaskSiblings(updatedTask).findAll { Task it -> it.datesLinkedToSiblings }
            try {
                dateChangeType = 'plannedStartDate'
                dateDifference = updatedPlannedStartDate - originalPlannedStartDate
            } catch (NullPointerException e) {
                dateDifference = 0
            }

            if (isTaskLevelBorAbove) {
                Task parent = taskDAOService.get(t.parent.id as long)
                Date parentDate = parent.getPlannedStartDate()

                siblings.each { Task it ->
                    if (parentDate != null && it.plannedStartDate != null && (parentDate <=> DateUtils.addDays(it.plannedStartDate, dateDifference) as Date) > 0) {
                        if (!maintainTaskConsistencyUpdate) {
                            throw new LinkedTaskWouldStartBeforeParentException('linked tasks planned start date would be before the parent')
                        }
                    }
                }
            }
            siblings.each { Task it ->
                if (it.plannedEndDate != null && it.plannedStartDate != null && (DateUtils.addDays(it.plannedStartDate, dateDifference) as Date <=> it.plannedEndDate) > 0) {
                    if (!maintainTaskConsistencyUpdate) {
                        throw new LinkedTaskWouldStartAfterItFinished('linked tasks planned start date would be after its planned end date')
                    }
                }
            }
            siblings.each { Task it ->
                if (taskLinkService.isValidTaskToLink(it.id as long) && it.plannedStartDate != null) {
                    it.plannedStartDate = DateUtils.addDays(it.plannedStartDate, dateDifference) as Date
                    if (it.plannedEndDate != null && it.plannedStartDate != null && (DateUtils.addDays(it.plannedStartDate, dateDifference) as Date <=> it.plannedEndDate) > 0) {
                        it.plannedEndDate = it.plannedStartDate
                    }
                    it.save(flush: true)
                    taskDateTimeService.maintainPSDConsistency(it, originalPlannedStartDate, maintainTaskConsistencyUpdate)
                }
            }
        }
        if (originalPlannedEndDate != null && originalPlannedEndDate != updatedPlannedEndDate && updatedPlannedEndDate != null) {
            //validate the end dates
            List<Task> siblings = taskSiblingsService.getTaskSiblings(updatedTask).findAll { it -> it.datesLinkedToSiblings }
            try {
                dateChangeType = 'plannedEndDate'
                dateDifference = updatedPlannedEndDate - originalPlannedEndDate
            } catch (NullPointerException e) {
                dateDifference = 0
            }


            if (isTaskLevelBorAbove) {
                Task parent = taskDAOService.get(t.parent.id as long)
                Date parentDate = parent.getPlannedEndDate()
                siblings.each { Task it ->
                    if (parentDate != null && it.plannedEndDate != null && (DateUtils.addDays(it.plannedEndDate, dateDifference) as Date).after(new Date(parentDate.getTime()))) {
                        if (!maintainTaskConsistencyUpdate) {
                            throw new LinkedTaskWouldEndAfterParentException(('linked dates planned end date wold be after the parents'))
                        }
                    }
                }
            }
            siblings.each { Task it ->
                if (it.plannedStartDate != null && it.plannedEndDate != null && (it.plannedStartDate <=> DateUtils.addDays(it.plannedEndDate, dateDifference) as Date) > 0) {
                    if (!maintainTaskConsistencyUpdate) {
                        throw new LinkedTaskWouldEndBeforeItStarted('linked tasks planned start date would be after its planned end date')
                    }
                }
            }
            siblings.each { Task it ->
                if (taskLinkService.isValidTaskToLink(it.id as long) && it.plannedEndDate != null) {
                    it.plannedEndDate = DateUtils.addDays(it.plannedEndDate, dateDifference) as Date
                    if ((it.plannedStartDate <=> DateUtils.addDays(it.plannedEndDate, dateDifference) as Date) > 0) {
                        it.plannedStartDate = it.plannedEndDate
                    }
                    it.save(flush: true)
                    taskDateTimeService.maintainPEDConsistency(it, originalPlannedEndDate, maintainTaskConsistencyUpdate)
                }
            }
        }

        dateChangeType
    }
}
