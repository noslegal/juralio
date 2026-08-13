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
import com.juralio.blockers.TaskBlockerException
import com.juralio.common.APIErrorCodes
import com.juralio.common.UserDecoratorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.costs.CostsService
import com.juralio.matterevent.payload.TaskDateUpdatedPayload
import com.juralio.label.LabelService
import com.juralio.matter.CostsAuthorisationService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.matter.referencenumber.MatterContentReferenceNumberService
import com.juralio.matterevent.MatterEventService
import com.juralio.matterevent.payload.TaskCreatedPayload
import com.juralio.matterevent.payload.TaskStatusChangedPayload
import com.juralio.project.Project
import com.juralio.project.ProjectAuthorisationService
import com.juralio.project.ProjectService
import com.juralio.project.ProjectWithPostsService
import com.juralio.project.dao.ProjectDAOService
import com.juralio.task.blockers.TaskBlockerService
import com.juralio.task.dao.TaskDAOService
import com.juralio.task.datetime.TaskDateTimeService
import com.juralio.task.datetime.exception.DateBoundaryException
import com.juralio.task.datetime.exception.DateConsistencyException
import com.juralio.task.datetime.exception.DateTypeStatusConflict
import com.juralio.task.datetime.exception.TaskDateTimeException
import com.juralio.task.exception.*
import com.juralio.task.followers.TaskFollowerService
import com.juralio.task.labels.TaskLabelsService
import com.juralio.task.status.TaskStatus
import com.juralio.task.status.TaskStatusService
import com.juralio.task.status.exception.ExternalUserCannotSetTaskToNotRequired
import com.juralio.task.status.exception.TaskStatusException
import com.juralio.template.*
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import org.apache.commons.lang.time.DateUtils
import org.grails.web.json.JSONObject
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

import java.text.Format
import java.text.SimpleDateFormat
import java.time.Instant

@Transactional
class TaskService {

    MatterService matterService
    ProjectService projectService
    MatterContentReferenceNumberService matterContentReferenceNumberService
    TaskDateTimeService taskDateTimeService
    TaskParentHelperService taskParentHelperService
    TaskStatusService taskStatusService
    TaskDatesService taskDatesService
    TaskActivityService taskActivityService
    TaskHierarchyHelperService taskHierarchyHelperService
    TaskTemplateService taskTemplateService
    UserDecoratorService userDecoratorService
    TaskLevelChangeService taskLevelChangeService
    ProjectTemplateService projectTemplateService
    TaskDAOService taskDAOService
    TemplateTreeHelperService templateTreeHelperService
    TaskNotRequiredUpdateService taskNotRequiredUpdateService
    TaskAuthorisationService taskAuthorisationService
    ProjectAuthorisationService projectAuthorisationService
    TaskConsistencyService taskConsistencyService
    ProjectDAOService projectDAOService
    SpringSecurityService springSecurityService
    TaskFollowerService taskFollowerService
    TaskSiblingsService taskSiblingsService
    TaskUpdateService taskUpdateService
    TaskLabelsService taskLabelsService
    LabelService labelService
    TaskBlockerService taskBlockerService
    MatterAuthorisationService matterAuthorisationService
    CostsAuthorisationService costsAuthorisationService
    CostsService costsService
    ProjectWithPostsService projectWithPostsService
    MatterEventService matterEventService

    def getErrorCodeForTaskDateTimeException(TaskDateTimeException exception) {
        if (exception instanceof DateConsistencyException) {
            return APIErrorCodes.DATE_CONSISTENCY_EXCEPTION.code()
        } else if (exception instanceof DateTypeStatusConflict) {
            return HttpStatus.BAD_REQUEST
        } else if (exception instanceof DateBoundaryException) {
            return HttpStatus.BAD_REQUEST
        }

        throw new IllegalArgumentException("Unrecognised TaskDateTimeException type")
    }

    Task getTaskOnly(long taskId, long projectId) {
        if(!taskAuthorisationService.hasReadAccess(taskId,projectId)){
            throw new Exception()
        }
        Task task = taskDAOService.get(taskId)
        if (task == null) {
            throw new TaskNotFoundException("task with ID ${taskId} could not be found")
        }
        return task
    }

    Task getTask(long taskId, Long projectId) {
        if (!taskAuthorisationService.hasReadAccess(taskId, projectId)) {
            throw new Exception()
        }
        Task task = taskDAOService.get(taskId)
        AppUser user = springSecurityService.getCurrentUser() as AppUser

        if (task == null) {
            throw new TaskNotFoundException("task with ID ${taskId} could not be found")
        }
        task.parent = taskHierarchyHelperService.getAncestor(task, task.project)
        taskActivityService.populateActivities(task, projectId)
        decorateTaskMembership(task)

        task.blockers = taskBlockerService.getTaskBlockersByBlocked(task) + taskBlockerService.getTaskBlockersByBlocker(task)

        // Add inactive field to labels
        if (task.labels) {
            def listOfLabels = task.labels.toList()
            listOfLabels = listOfLabels.each { labelService.decorateLabel(it.label, user.organisation.id, task.project.matter.id) }
            task.labels = listOfLabels.toSet()
        }

        return task
    }

    List<Task> getAllMatterTasks(long matter_id) {
        if (!matterAuthorisationService.hasReadAccess(matter_id)) {
            throw new Exception()
        }
        Matter matter = matterService.getMatter(matter_id)
        def taskList = []
        matter.projects.forEach { project ->
            {
                if (project.active == true && !project.isPrivate || project.active == true && project.isPrivate && project.isPrivateMember) {
                    def tasks = getLevelATasks(project)
                    tasks.forEach { task ->
                        {
                            def x = task
                            taskList.push(x)
                        }
                    }
                }
            }
        }
        return taskList
    }

    List<Task> getLevelATasks(Project project) {
        if(!projectAuthorisationService.hasReadAccess(project.id)){
            throw new Exception()
        }
        taskDAOService.findAllByProjectAndLevel(project, 1 as short)
    }

    List<TaskTemplate> getLevelATasks(ProjectTemplate template) {
        template.tasks.findAll { TaskTemplate it -> it.level == 1 } as List<TaskTemplate>
    }

    List<Task> getSiblingTasks(long taskId, long projectId) {
        if(!taskAuthorisationService.hasReadAccess(taskId,projectId)){
            throw new Exception()
        }
        Task task = taskDAOService.get(taskId)
        if (task.level == 1 as short) {
            return getLevelATasks(projectService.getProjectOnly(projectId)).findAll { Task it -> it.id != taskId }
        }

        Task parentTask = taskParentHelperService.getParentTask(taskId)
        List<Task> tasks = parentTask.tasks.findAll { Task it -> it.id != taskId }
        AppUser currentUser = springSecurityService.getCurrentUser()
        if (currentUser.externalUserId != null) {
            tasks = tasks.findAll { it.status != TaskStatus.NOT_REQUIRED.value() }
        }
        return tasks
    }

    List<Task> getChildrenTasks(long taskId, long projectId) {
        if(!taskAuthorisationService.hasReadAccess(taskId,projectId)){
            throw new Exception()
        }
        Task task = getTask(taskId,projectId)
        List<Task> tasks = task.tasks
        AppUser currentUser = springSecurityService.getCurrentUser()
        if (currentUser.externalUserId != null) {
            tasks = tasks.findAll { it.status != TaskStatus.NOT_REQUIRED.value() }
        }
        return tasks
    }


    boolean hasWipedDates(Task task, ValidatedParameterMap params, Date originalPlannedStartDate, Date originalPlannedEndDate) {
        if (params.get('dateCleared')) {
            if (params.get('dateCleared') == true) {
                return false
            }
        }
        if (params.get('plannedStartDate')) {

            if (task.plannedStartDate != Date.from(Instant.parse(params.get('plannedStartDate')))) {
                return true
            }
        }
        if (params.get('plannedEndDate')) {
            if (task.plannedEndDate != Date.from(Instant.parse(params.get('plannedEndDate')))) {
                return true
            }
        }
        if (params.get('actualStartDate')) {
            if (task.actualStartDate != Date.from(Instant.parse(params.get('actualStartDate')))) {
                return true
            }
        }
        if (params.get('actualEndDate')) {
            if (task.actualEndDate != Date.from(Instant.parse(params.get('actualEndDate')))) {
                return true
            }
        }
        if (task.plannedStartDate != originalPlannedStartDate && task.plannedStartDate == null) {
            return true
        }
        if (task.plannedEndDate != originalPlannedEndDate && task.plannedEndDate == null) {
            return true
        }

        return false
    }

    def updateTask(long projectId, long taskId, def newProperties, boolean maintainTaskConsistencyUpdate, boolean updateSubtaskDates)
            throws TaskStatusException, TaskDateTimeException, LinkedTaskWouldEndAfterParentException, LinkedTaskWouldStartBeforeParentException, LinkedTaskWouldEndBeforeItStarted, LinkedTaskWouldStartAfterItFinished, TaskBlockerException, DateTypeStatusConflict {
        if(!taskAuthorisationService.hasWriteAccess(taskId,projectId)){
            throw new Exception()
        }
        Task task = Task.lock(taskId)
        String originalParentStatus
        Date originalParentPSD
        Date originalParentPED
        Task parentTask
        AppUser currentUser = springSecurityService.getCurrentUser()
        if (currentUser.externalUserId != null && newProperties.status && newProperties.status == TaskStatus.NOT_REQUIRED.value()) {
            throw new ExternalUserCannotSetTaskToNotRequired()
        }

        if (task.isMilestone && newProperties.actualEndDate) {
            newProperties.actualStartDate = newProperties.actualEndDate
        }
        if (newProperties.isMilestone) {
            task.isDeliverable = false
            task.plannedStartDate = null
        }
        if(newProperties.isDeliverable) {
            task.isMilestone = false
        }

        if (task.level > 1) {
            parentTask = taskParentHelperService.getParentTask(taskId)
            originalParentStatus = parentTask.status
            originalParentPSD = parentTask.plannedStartDate
            originalParentPED = parentTask.plannedEndDate
        }

        boolean updatingStatus = newProperties.status

        if (newProperties.status) {
            taskConsistencyService.findBlockerConsistencyIssuesBeforeChange(task, maintainTaskConsistencyUpdate, true, newProperties.status)
            if(task.status ==TaskStatus.DONE.value() && newProperties.status ==TaskStatus.NOT_STARTED.value()){
                task.plannedStartDate = null
                task.plannedEndDate = null
            }
            if(task.status ==TaskStatus.DONE.value() && newProperties.status ==TaskStatus.IN_PROGRESS.value()){
                task.plannedEndDate = null
            }
            if(task.status ==TaskStatus.IN_PROGRESS.value() && newProperties.status ==TaskStatus.NOT_STARTED.value()){
                task.plannedStartDate = null
            }
        }
        // The original status id needs extracted prior to the properties being bound, otherwise the previous status
        // and the current status appear to be the same.  Currently, getting the persisted value always returns the
        // cached version for a task although it *should* be the version in the database.
        String originalStatusName = task.status
        Date originalActualEndDate = task.actualEndDate
        Date originalPlannedEndDate = task.plannedEndDate
        Date originalActualStartDate = task.actualStartDate
        Date originalPlannedStartDate = task.plannedStartDate
        task.properties = newProperties
        Date updatedActualEndDate = task.actualEndDate
        Date updatedPlannedEndDate = task.plannedEndDate
        Date updatedActualStartDate = task.actualStartDate
        Date updatedPlannedStartDate = task.plannedStartDate
        def isDateChange = newProperties.actualEndDate != null || newProperties.actualStartDate != null || newProperties.plannedEndDate != null || newProperties.plannedStartDate != null

        if (costsAuthorisationService.organisationCostsEnabled(currentUser.organisation)  && task.level == 1 as short && isDateChange) {
            costsService.isValidRemoveFromProjectionPeriods(task)
        }

        //Catch not started tasks can't have actual dates
        if ((newProperties.actualEndDate != null || newProperties.actualStartDate != null) && task.status == TaskStatus.NOT_STARTED.value() && (newProperties.status != null && newProperties.status != TaskStatus.NOT_STARTED)) {
            throw new DateTypeStatusConflict()
        }
        //Catch in progress tasks can't have actual end
        if (newProperties.actualEndDate != null && task.status == TaskStatus.IN_PROGRESS.value()) {
            throw new DateTypeStatusConflict()
        }

        //cant set PSD of non not-started tasks
        if (newProperties.plannedStartDate != null && task.status != TaskStatus.NOT_STARTED.value()) {
            throw new DateTypeStatusConflict()
        }
        //cant set PED of non not-started tasks
        if (newProperties.plannedEndDate != null && (task.status != TaskStatus.NOT_STARTED.value() && task.status != TaskStatus.IN_PROGRESS.value())) {
            if (newProperties.status != 'not-started' && newProperties.status != 'in-progress') {
                throw new DateTypeStatusConflict()
            }
        }


        if (!updatingStatus) {
            taskDateTimeService.checkInProgressASDIsNotLaterThanDoneAED(task, maintainTaskConsistencyUpdate)
        }

        int otherAEDUpdateCount = taskDateTimeService.maintainAEDConsistency(task, originalActualEndDate, maintainTaskConsistencyUpdate)

        if (originalActualEndDate != updatedActualEndDate) {
            publishTaskDateChange(task, 'AED', originalActualEndDate, updatedActualEndDate, otherAEDUpdateCount)
        }

        int otherPEDUpdateCount = 0
        if (!updatingStatus) {
            otherPEDUpdateCount = taskDateTimeService.maintainPEDConsistency(task, originalPlannedEndDate, maintainTaskConsistencyUpdate)
        }


        if (originalPlannedEndDate != updatedPlannedEndDate) {
            publishTaskDateChange(task, 'PED', originalPlannedEndDate, updatedPlannedEndDate, otherPEDUpdateCount)
        }

        int otherASDUpdateCount = taskDateTimeService.maintainASDConsistency(task, originalActualStartDate, maintainTaskConsistencyUpdate)


        if (originalActualStartDate != updatedActualStartDate) {
            publishTaskDateChange(task, 'ASD', originalActualStartDate, updatedActualStartDate, otherASDUpdateCount)

        }


        int otherPSDUpdateCount = taskDateTimeService.maintainPSDConsistency(task, originalPlannedStartDate, maintainTaskConsistencyUpdate)

        if (originalPlannedStartDate != updatedPlannedStartDate) {
            publishTaskDateChange(task, 'PSD', originalPlannedStartDate, updatedPlannedStartDate, otherPSDUpdateCount)
        }

        if (!task.validate()) {
            return task
        }
        if (task.status == TaskStatus.DONE.value()) {
            taskLabelsService.removeLabelsOnStatusChange(task as Task)
        }
        if (task.status == TaskStatus.NOT_REQUIRED.value()) {
            List<TaskBlocker> blocked = taskBlockerService.getTaskBlockersByBlocked(task)
            if (blocked.size() > 0) {
                blocked.forEach(block -> {
                    taskBlockerService.deleteTaskBlocker(block)
                })
            }
            List<TaskBlocker> blocker = taskBlockerService.getTaskBlockersByBlocker(task)
            if (blocker.size() > 0) {
                blocker.forEach(block -> {
                    taskBlockerService.deleteTaskBlocker(block)
                })
            }
            taskLabelsService.removeLabelsOnStatusChange(task as Task)

            if (costsAuthorisationService.organisationCostsEnabled(currentUser.organisation) && matterAuthorisationService.hasCostsAccess(task.project.matterId) && task.level == 1 as short) {
                costsService.removeTaskFromCosts(task)
            }

            return taskUpdateService.handleStatusChangeToNotRequired(task)
        } else {
            setPreviousStatus(task, originalStatusName, maintainTaskConsistencyUpdate)
            int dateDifference = 0
            String dateChangeType = null
            if (originalPlannedEndDate != updatedPlannedEndDate) {
                dateChangeType = 'plannedEndDate'
                try {
                    dateDifference = updatedPlannedEndDate - originalPlannedEndDate
                } catch (Exception ignored) {
                    dateDifference = 0
                }
            } else if (originalPlannedStartDate != updatedPlannedStartDate) {
                dateChangeType = 'plannedStartDate'
                try {
                    dateDifference = updatedPlannedStartDate - originalPlannedStartDate
                } catch (Exception ignored) {
                    dateDifference = 0
                }

            }
            if (task.datesLinkedToSiblings) {
                dateChangeType = taskUpdateService.handleLinkedSiblingsDates(task,
                        originalPlannedStartDate,
                        updatedPlannedStartDate,
                        maintainTaskConsistencyUpdate,
                        originalPlannedEndDate,
                        updatedPlannedEndDate,
                        dateChangeType,
                        dateDifference)
            }

            if (task.level > 1) {
                updateTaskWithTaskParent(task, parentTask.id, dateChangeType, originalParentPSD, originalParentPED)
                if (task.previousStatus == TaskStatus.NOT_REQUIRED.value() && originalParentStatus != parentTask.status) {
                    task.updateMeta.updatedParentStatus = parentTask.status
                }
            } else {
                updateTaskWithProjectParent(task, task.project.id)
            }
        }
        decorateTaskWithDetails(task, projectId)
        if (originalStatusName != task.status) {
            taskUpdateService.handleTaskStatusChange(task, originalStatusName)
        }

        if (updateSubtaskDates) {
            updateTaskSubtaskDates(task, newProperties.dateKey as String, newProperties.offset as Integer)
        }
        task.blockers = taskBlockerService.generateBlockedDataObject(task)

        //this needs to be the last thing we do as it will update tasks regardless of maintainTaskconsistency
        boolean isStatusChange = task.status != originalStatusName

        if (isStatusChange) {
            taskDateTimeService.wipeInconsistentDatesWhenChangingStatus(task)
        }
        return task
    }

    private void decorateTaskWithDetails(Task updatedTask, Long projectId) {
        taskActivityService.populateActivities(updatedTask, projectId)
        decorateTaskMembership(updatedTask)
        updatedTask.parent = taskHierarchyHelperService.getAncestor(updatedTask, updatedTask.project)
    }

    def saveTaskWithProjectParent(Task newTask, long projectId) throws MaximumNumberOfLevelATasksExceededException, MaximumTasksExceededException {
        if(!projectAuthorisationService.hasWriteAccess(projectId)){
            throw new Exception()
        }
        Project project = Project.lock(projectId)
        if (getLevelATasks(project).size() == Task.MAXIMUM_PHASE_COUNT) {
            throw new MaximumNumberOfLevelATasksExceededException()
        } else if (project.tasks.size() >= Task.MAXIMUM_PROJECT_TASKS) {
            throw new MaximumTasksExceededException()
        }

        if (newTask.status == TaskStatus.IN_PROGRESS.value()) {
            // Task is IP so current time is valid for new tasks ASD.
            newTask.actualStartDate = new Date()
        } else if (newTask.status == TaskStatus.DONE.value()) {
            newTask.actualStartDate = new Date()
            newTask.actualEndDate = new Date()
        }

        newTask.project = project
        if (!newTask.validate()) {
            return newTask
        }

        newTask.level = 1
        newTask.referenceNumber = matterContentReferenceNumberService.getNextReferenceNumber(project.matter.id)
        newTask.listIdx = 0
        addToProject(newTask, project)
        newTask.save(flush: true, failOnError: true)
        matterEventService.publish(new TaskCreatedPayload(
            taskId: newTask.id,
            taskName: newTask.name,
            taskLevel: newTask.level,
            taskReferenceNumber: newTask.referenceNumber,
            taskStatus: newTask.status,
            projectId: project.id,
            projectName: project.name
        ), springSecurityService.currentUser, project.matter)
        Task t = getTask(newTask.id, projectId)
        return t
    }

    def createFromTemplateTaskAsLevelA(long templateTaskId, long projectId, boolean includePosts, long templateId, boolean includeDescriptions = false) throws MaximumNumberOfLevelATasksExceededException, MaximumTasksExceededException {
        if(!projectAuthorisationService.hasWriteAccess(projectId)){
            throw new Exception()
        }
        Project project = Project.lock(projectId)

        def counter =0
        counter = postsInTaskTree(TaskTemplate.get(templateTaskId), counter)
        if(counter + projectWithPostsService.getPostCount(project)> Project.MAXIMUM_POSTS){
            throw new Exception()
        }
        if (getLevelATasks(project).size() == Task.MAXIMUM_PHASE_COUNT) {
            throw new MaximumNumberOfLevelATasksExceededException()
        }

        TaskTemplate taskTemplate = taskTemplateService.getTaskTemplateOnly(templateTaskId, templateId)
        int taskCounter = templateTreeHelperService.getFlatTaskTemplateList(taskTemplate).size()
        if (project.tasks.size() + taskCounter > Task.MAXIMUM_PROJECT_TASKS) {
            throw new MaximumTasksExceededException()
        }
        long originalLevel = taskTemplate.level
        taskLevelChangeService.updateLevel(taskTemplate, TaskTemplate.NUMBER_TOP_LEVEL_TASK)
        Task createdTask = taskTemplateService.generateTasksFromTaskTemplates([taskTemplate], project, false,null, TaskStatus.NOT_STARTED, includePosts, templateId, includeDescriptions)[0]
        createdTask.listIdx = 0
        taskLevelChangeService.updateLevel(taskTemplate, originalLevel)
        taskCreation(createdTask, taskTemplate, projectTemplateService.getProjectTemplateOnly(templateId), null, Creation_type.FROM_TEMPLATE.value())
        return createdTask
    }

    def createFromTemplateProjectAsLevelA(def templateProjectId, long projectId, boolean includePosts, boolean includeDescriptions = false) throws MaximumNumberOfLevelATasksExceededException, MaximumTasksExceededException {
        if(!projectAuthorisationService.hasWriteAccess(projectId)){
            throw new Exception()
        }
        Project project = Project.lock(projectId)
        List<Task> createdTasks = []
        ProjectTemplate projectTemplate = projectTemplateService.getProjectTemplateOnly(templateProjectId as Long)
        List<TaskTemplate> levelATemplateTasks = projectTemplate.tasks.findAll { it -> it.level == 1 }

        if (getLevelATasks(project).size() + levelATemplateTasks?.size() > Task.MAXIMUM_PHASE_COUNT) {
            throw new MaximumNumberOfSubTasksExceededException()
        }

        if (project.tasks.size() + projectTemplate.tasks.size() > Task.MAXIMUM_PROJECT_TASKS) {
            throw new MaximumTasksExceededException()
        }

        if( projectTemplate.postCount + projectWithPostsService.getPostCount(project)> Project.MAXIMUM_POSTS){
            throw new Exception()
        }

        for (TaskTemplate levelATemplateTask : levelATemplateTasks) {
            Task createdTask = createFromTemplateTaskAsLevelA(levelATemplateTask.id as long, projectId, includePosts, templateProjectId as long, includeDescriptions)
            createdTasks.push(createdTask)
        }

        return createdTasks
    }

    def createFromTemplateTaskAsSubtask(long templateTaskId, long parentTaskId, long projectId, boolean includePosts, long templateProjectId, boolean includeDescriptions = false) throws MaximumNumberOfSubTasksExceededException, MaximumTasksExceededException, InvalidDestinationParent {
        if(!taskAuthorisationService.hasWriteAccess(parentTaskId,projectId)){
            throw new Exception()
        }
        Project project = Project.lock(projectId)
        def counter =0
        counter = postsInTaskTree(TaskTemplate.get(templateTaskId), counter)
        if(counter + projectWithPostsService.getPostCount(project)> Project.MAXIMUM_POSTS){
            throw new Exception()
        }
        Task parentTask = Task.lock(parentTaskId)
        Boolean destinationParentIsNotRequired = isMarkedAsNotRequired(parentTask.id, project.id)
        if (destinationParentIsNotRequired) {
            throw new InvalidDestinationParent("Cannot create children of a not required task")
        }
        TaskTemplate taskTemplate = taskTemplateService.getTaskTemplateOnly(templateTaskId, templateProjectId)
        def subtaskCounter = templateTreeHelperService.getFlatTaskTemplateList(taskTemplate).size()
        if (parentTask.tasks?.size() == Task.MAXIMUM_SUBTASK_COUNT) {
            throw new MaximumNumberOfSubTasksExceededException()
        }
        if (project.tasks.size() + subtaskCounter >= Task.MAXIMUM_PROJECT_TASKS) {
            throw new MaximumTasksExceededException()
        }


        long originalLevel = taskTemplate.level
        taskLevelChangeService.updateLevel(taskTemplate, parentTask.level + 1)
        TaskStatus targetStatus = parentTask.status == TaskStatus.DONE.value() ? TaskStatus.DONE : TaskStatus.NOT_STARTED
        Task createdTask = taskTemplateService.generateTasksFromTaskTemplates([taskTemplate], project, true, parentTask, targetStatus, includePosts, templateProjectId, includeDescriptions)[0]
        taskLevelChangeService.updateLevel(taskTemplate, originalLevel)
        taskCreation(createdTask, taskTemplate, projectTemplateService.getProjectTemplateOnly(templateProjectId), null, Creation_type.FROM_TEMPLATE.value())
        if(parentTask.level > 1){
            reorderListIndexesUnderParent(parentTask, createdTask, project)
        }

        return createdTask
    }

    def createFromTemplateProjectAsSubtask(def templateProjectId, long parentTaskId, long projectId, boolean includePosts, boolean includeDescriptions = false) throws MaximumNumberOfSubTasksExceededException, MaximumTasksExceededException, InvalidDestinationParent {
        if(!taskAuthorisationService.hasWriteAccess(parentTaskId,projectId)){
            throw new Exception()
        }
        Task parentTask = Task.lock(parentTaskId)
        Boolean destinationParentIsNotRequired = isMarkedAsNotRequired(parentTaskId, projectId)
        if (destinationParentIsNotRequired) {
            throw new InvalidDestinationParent("Cannot create children of a not required task")
        }
        List<Task> createdTasks = []

        ProjectTemplate projectTemplate = projectTemplateService.getProjectTemplate(templateProjectId as long)
        List<TaskTemplate> levelATemplateTasks = projectTemplate.tasks.findAll { it -> it.level == 1 }

        if (parentTask.tasks?.size() + levelATemplateTasks?.size() > Task.MAXIMUM_SUBTASK_COUNT) {
            throw new MaximumNumberOfSubTasksExceededException()
        }
        if (projectService.getProjectOnly(projectId).tasks.size() + projectTemplate.tasks.size() > Task.MAXIMUM_PROJECT_TASKS) {
            throw new MaximumTasksExceededException()
        }

        if(projectTemplate.postCount + projectWithPostsService.getPostCount(projectService.getProject(projectId))> Project.MAXIMUM_POSTS){
            throw new Exception()
        }

        for (TaskTemplate levelATemplateTask : levelATemplateTasks) {
            Task createdTask = createFromTemplateTaskAsSubtask(levelATemplateTask.id as long, parentTaskId as long, projectId as long, includePosts, templateProjectId as long, includeDescriptions)
            createdTasks.push(createdTask)
        }

        return createdTasks
    }

    def saveTaskWithTaskParent(Task newTask, long parentTaskId, long projectId) throws MaximumNumberOfSubTasksExceededException, MaximumTasksExceededException {
        if(!taskAuthorisationService.hasWriteAccess(parentTaskId,projectId)){
            throw new Exception()
        }
        Project project = Project.lock(projectId)
        newTask.project = project
        Task parentTask = Task.lock(parentTaskId)
        newTask.level = parentTask.level + 1
        if(newTask.level > 2){
            newTask.listIdx = parentTask.listIdx
            project.tasks.stream().filter( {task -> task.level > 1}).collect().toList().forEach { Task task ->
                if(task.listIdx >= newTask.listIdx){
                    task.listIdx = task.listIdx + 1
                    task.save()
                }
            }
        }else{
            newTask.listIdx = project.tasks.stream().filter( {task -> task.level > 1}).collect().toList().size()
        }

        if (parentTask.status == TaskStatus.DONE.value()) {
            newTask.status = parentTask.status
            newTask.actualStartDate = new Date()
            newTask.actualEndDate = new Date()
        } else if (newTask.status == TaskStatus.IN_PROGRESS.value()) {
            // Parent is IP so current time is valid for new tasks ASD.
            newTask.actualStartDate = new Date()
        } else if (newTask.status == TaskStatus.DONE.value()) {
            // Parent must be IP or DONE so use its ASD.
            newTask.actualStartDate = parentTask.actualStartDate
            // If parent is DONE then use that date, otherwise use current date for new tasks AED.
            newTask.actualEndDate = parentTask.actualEndDate ? parentTask.actualEndDate : new Date()
        }

        newTask.isParked = parentTask.isParked

        if (parentTask.tasks != null && parentTask.tasks.size() == Task.MAXIMUM_SUBTASK_COUNT) {
            throw new MaximumNumberOfSubTasksExceededException()
        } else if (parentTask.level >= Task.MAXIMUM_TASK_LEVEL) {
            throw new MaximumLevelsExceededException()
        } else if (project.tasks.size() >= Task.MAXIMUM_PROJECT_TASKS) {
            throw new MaximumTasksExceededException()
        } else if (!newTask.validate()) {
            return newTask
        }

        newTask.referenceNumber = matterContentReferenceNumberService.getNextReferenceNumber(project.matter.id)

        addToProject(newTask, project)
        addToTask(newTask, parentTask)

        // Flush so the insert runs and newTask.id is assigned before it is read
        // by the event payload and the returned task (previously the inbox-notification
        // call flushed as a side effect).
        newTask.save(flush: true, failOnError: true)
        matterEventService.publish(new TaskCreatedPayload(
            taskId: newTask.id,
            taskName: newTask.name,
            taskLevel: newTask.level,
            taskReferenceNumber: newTask.referenceNumber,
            taskStatus: newTask.status,
            projectId: project.id,
            projectName: project.name
        ), springSecurityService.currentUser, project.matter)
        return newTask
    }

    private boolean checkListValid(def tasks, int expectedLength) {
        ArrayList idList = []
        for (subtask in tasks) {
            idList.add(subtask.id)
        }
        idList.unique()

        if (!idList || idList.size() != tasks.size() || tasks.size() > expectedLength) {
            return false
        }
        return true
    }

    private void checkSubtasksValidForReorder(Task task, def tasks) throws AccessDeniedException {
        if (!checkListValid(tasks, task.tasks.size())) {
            throw new AccessDeniedException("Unexpected task length")
        }

        for (subtask in tasks) {
            Task parentTask = taskParentHelperService.getParentTask(subtask.id)
            if (parentTask == null || parentTask.id != task.id) {
                throw new AccessDeniedException("Unexpected task id")
            }
        }
    }

    private void checkLevelAValidForReorder(int levelATaskCount, long projectId, def tasks) throws AccessDeniedException {
        if (!checkListValid(tasks, levelATaskCount)) {
            throw new AccessDeniedException("Unexpected task length")
        }
        for (task in tasks) {
            Task levelA = Task.get(task.id)
            if (levelA.level != 1 || !taskAuthorisationService.hasWriteAccess(task.id, projectId)) {
                throw new AccessDeniedException("Unexpected task id")
            }
        }
    }

    def updateTasksForProject(long projectId, def tasks, boolean maintainTaskConsistencyUpdate) throws TaskStatusException, AccessDeniedException {
        if(!projectAuthorisationService.hasWriteAccess(projectId)){
            throw new Exception()
        }
        Project project = Project.lock(projectId)
        int levelATaskCount = taskDAOService.findAllByProjectAndLevel(project, 1 as short).size()
        checkLevelAValidForReorder(levelATaskCount, projectId, tasks)
        return updateTasksForParent(project, tasks, maintainTaskConsistencyUpdate)
    }

    def updateTasksForTask(long taskId, def tasks, boolean maintainTaskConsistencyUpdate, long projectId) throws TaskStatusException, AccessDeniedException {
        if(!taskAuthorisationService.hasWriteAccess(taskId,projectId)){
            throw new Exception()
        }
        Task task = Task.lock(taskId)
        checkSubtasksValidForReorder(task, tasks)
        task = updateTasksForParent(task, tasks, maintainTaskConsistencyUpdate)
        decorateTaskWithDetails(task, projectId)
        return task
    }

    private def updateTasksForParent(def parent, List<Task> tasks, boolean maintainTaskConsistencyUpdate) {
        Collection<Task> tasksAsInDatabase = parent.tasks.collect()
        parent.tasks.clear()
        parent.updateMeta.subtasksUpdated = 0

        for (int i = 0; i < tasks.size(); i++) {
            Task childTask = Task.lock(tasks[i].id)
            String originalStatus = childTask.status
            childTask.properties = tasks[i]
            setPreviousStatus(childTask, originalStatus, maintainTaskConsistencyUpdate)
            if (originalStatus != TaskStatus.NOT_REQUIRED.value() && childTask.status == TaskStatus.NOT_REQUIRED.value()) {
                parent.updateMeta.subtasksUpdated += taskNotRequiredUpdateService.updateDetailsAndChildren(childTask)
            }
            parent.addToTasks(childTask)
        }

        List<Task> newTasks = parent.tasks
        List<Task> tasksNotAdded = tasksAsInDatabase - newTasks

        tasksNotAdded.each { Task it -> parent.addToTasks(it) }

        return parent.save(flush: true, failOnError: true)
    }

    private def updateTaskWithProjectParent(def task, def projectId) {
        Project project = Project.lock(projectId)

        //Resetting level - prevention of task level being updated erroneously
        task.level = 1

        if (project) {
            task.save(flush: true, failOnError: true)
        }
    }

    private def updateTaskWithTaskParent(Task task, long parentTaskId, String dateChangeType, Date parentPSD, Date parentPED) {
        Task parentTask = Task.lock(parentTaskId)
        parentTask.refresh()

        long parentId = parentTask.id
        int parentLevel = parentTask.level
        def dateDifference = 0
        while (parentId && parentLevel > 0) {
            Task parent = getTask(parentId, task.projectId)
            parentId = parent.parent.id
            parentLevel = parent.level - 1
            Boolean parentWillUpdate = false
            if (dateChangeType == 'plannedStartDate') {
                if (parentPSD && task.getPlannedStartDate() && parentPSD.after(task.getPlannedStartDate())) {
                    parentWillUpdate = true
                    dateDifference = task.getPlannedStartDate() - parentPSD
                }
            }
            if (dateChangeType == 'plannedEndDate') {
                if (parentPED && task.getPlannedEndDate() && parentPED.before(task.getPlannedEndDate())) {
                    parentWillUpdate = true
                    dateDifference = task.getPlannedEndDate() - parentPED

                }
            }
            if (parentWillUpdate && parent.datesLinkedToSiblings) {
                List<Task> siblings = taskSiblingsService.getTaskSiblings(parent)
                siblings.findAll { sibling -> sibling.datesLinkedToSiblings }.each { sibling ->
                    if (dateChangeType == null) {
                        return
                    } else if (dateChangeType != null && sibling.getProperty(dateChangeType) != null) {
                        def newDate = DateUtils.addDays(sibling.getProperty(dateChangeType) as Date, dateDifference) as Date
                        if (dateChangeType == 'plannedStartDate') {
                            sibling.setPlannedStartDate(newDate)
                        } else if (dateChangeType == 'plannedEndDate') {
                            sibling.setPlannedEndDate(newDate)
                        }
                        sibling.save()
                    }
                }

            }
        }

        //Resetting level - prevention of task level being updated erroneously
        task.level = parentTask.level + 1
        if (parentTask) {
            task.save(flush: true, failOnError: true)
        }
    }

    List<Task> listTasks(Map params) {
        AppUser currentUser = springSecurityService.getCurrentUser()

        List<Task> tasks = Task.createCriteria().list() {
            eq("isParked", false)
            if (!params.includeNotRequired) {
                ne("status", TaskStatus.NOT_REQUIRED.value())
            }
            eq("project", projectService.getProjectOnly(params.project_id as long))
            if (params.not_creator) {
                ne("createdBy", currentUser)
            }
            if (params.name) {
                ilike(Task.NAME, "%$params.name%")
            }
            if (params.date) {
                gt(Task.DATE_CREATED, params.date)
            }
            order("id", "desc")
        }
        tasks = tasks.findAll { Task t ->
            Project p = projectService.getProject(t.project.id)
            return projectService.canAccessPrivateWorkstream(p)
        }
        List<Task> filteredTasks = []
        if (params.filterSeenBy) {
            tasks.each { task ->
                boolean hasSeen = false
                task.seenBy.each {
                    if (it.userId == currentUser.id && it.taskId == task.id) {
                        hasSeen = true
                    }
                }
                if (!hasSeen) {
                    filteredTasks.add(task)
                }
            }
        }

        List<Task> tasksToReturn = params.filterSeenBy ? filteredTasks : tasks

        if (currentUser.externalUserId != null) {
            tasksToReturn = tasksToReturn.findAll { it.status != TaskStatus.NOT_REQUIRED.value() }
        }

        return tasksToReturn
    }

    List<Task> listArchivedTasks(long projectId) {
        if(!projectAuthorisationService.hasReadAccess(projectId)){
            throw new Exception()
        }
        return Task.findAllByArchivedByIsNotNullAndProject(projectDAOService.get(projectId as long), [sort: 'id', order: 'asc'])
    }

    private void publishTaskDateChange(Task task, String dateChangeType, Date oldDate, Date newDate, int knockOnUpdateCount) {
        Project p = task.project
        matterEventService.publish(new TaskDateUpdatedPayload(
            taskId: task.id, taskName: task.name, taskLevel: task.level,
            taskReferenceNumber: task.referenceNumber, taskStatus: task.status,
            projectId: p.id, projectName: p.name,
            dateChangeType: dateChangeType, oldDate: oldDate, newDate: newDate,
            knockOnUpdateCount: knockOnUpdateCount
        ), springSecurityService.currentUser as AppUser, p.matter)
    }

    private def setPreviousStatus(Task taskToUpdate, String originalStatusName, boolean maintainTaskConsistencyUpdate) throws TaskBlockerException {
        if (originalStatusName != taskToUpdate.status) {
            taskToUpdate.previousStatus = originalStatusName
            if (taskToUpdate.status != TaskStatus.NOT_REQUIRED.value()) {
                int affectedTaskCount = taskStatusService.maintainStatusConsistency(taskToUpdate, maintainTaskConsistencyUpdate)
                taskConsistencyService.findBlockerConsistencyIssues(taskToUpdate, maintainTaskConsistencyUpdate, true)
                taskDatesService.updateActualDates(taskToUpdate)
                Project p = projectDAOService.get(taskToUpdate.project.id)
                matterEventService.publish(new TaskStatusChangedPayload(
                    taskId: taskToUpdate.id,
                    taskName: taskToUpdate.name,
                    taskLevel: taskToUpdate.level,
                    taskReferenceNumber: taskToUpdate.referenceNumber,
                    previousTaskStatus: originalStatusName,
                    taskStatus: taskToUpdate.status,
                    projectId: p.id,
                    projectName: p.name,
                    affectedTaskCount: affectedTaskCount
                ), springSecurityService.currentUser, p.matter)
            }
        }
    }

    private void decorateTaskMembership(Task task) {
        if (task.teamMembers && task.teamMembers.user.size() > 0) {
            userDecoratorService.decorateActiveUsersOnMatter(task.teamMembers.findAll { tm -> tm.user }.user, task.project.matter)
        }
        if (task.followers?.size() > 0) {
            task.isCurrentUserFollower = taskFollowerService.isTaskFollower(task, springSecurityService.getCurrentUser())
        }
    }

    private void addToProject(Task newTask, Project parent) {
        parent.addToTasks(newTask)
        parent.save(failOnError: true)
    }

    private void addToTask(Task newTask, Task parent) {
        parent.addToTasks(newTask)
        parent.save(failOnError: true)
    }

    TaskCreationContext taskCreation(Task newTask, TaskTemplate taskTemplate, ProjectTemplate projectTemplate, Task task_copy, Integer creator_type) {

        newTask.save()

        AppUser currentUser = springSecurityService.getCurrentUser()
        TaskCreationContext taskCreation
        switch (creator_type) {
            case 0:
                taskCreation = new TaskCreationContext(task: newTask, creator: currentUser, creation_type: creator_type, version: 1)
                break
            case 1:
                taskCreation = new TaskCreationContext(task: newTask, creator: currentUser, creation_type: creator_type, template: projectTemplate, template_task: taskTemplate, version: 1) //from temp
                break
            case 2:
                taskCreation = new TaskCreationContext(task: newTask, creator: currentUser, creation_type: creator_type, task_copy: task_copy, version: 1) //copy
                break
        }
        taskDAOService.taskCreationSave(taskCreation)
    }


    private def updateTaskDateRecursive(Task task, String dateType, Integer offset) {
        if (task.getProperty(dateType) && (task.status == TaskStatus.NOT_STARTED.value() || task.status == TaskStatus.IN_PROGRESS.value())) {
            Date updatedDate = task.getProperty(dateType) + offset
            task.setProperty(dateType, updatedDate)
            task.save()
        }
        task.tasks.each { t -> updateTaskDateRecursive(t, dateType, offset) }

    }

    def updateTaskSubtaskDates(Task task, String dateType, Integer offset) {
        if(!taskAuthorisationService.hasWriteAccess(task.id,task.project.id)){
            throw new Exception()
        }
        if (dateType != 'plannedStartDate' && dateType != 'plannedEndDate') {
            return
        } else if (task.status != TaskStatus.NOT_STARTED.value() && task.status != TaskStatus.IN_PROGRESS.value()) {
            return
        } else {
            task.tasks.each { t -> updateTaskDateRecursive(t, dateType, offset) }
        }
    }

    Boolean isMarkedAsNotRequired(Task task) {
        if(!taskAuthorisationService.hasReadAccess(task.id)){
            throw new Exception()
        }
        return task.status == TaskStatus.NOT_REQUIRED.value()
    }

    Boolean isMarkedAsNotRequired(long taskId, long projectId) {
        if(!taskAuthorisationService.hasReadAccess(taskId)){
            throw new Exception()
        }
        try {
            Task foundTask = getTask(taskId, projectId)
            if (foundTask) {
                return foundTask.status == TaskStatus.NOT_REQUIRED.value()
            } else {
                return false
            }
        } catch (Exception e) {
            return false
        }
    }

    ArrayList getAffectedTasks(Task updatedTask) {
        def taskList = taskStatusService.findStatusConsistencyIssues(updatedTask, false)
        return taskList
    }

    def getMinMaxBoundsUpTree(long taskId, long projectId) {
        if(!taskAuthorisationService.hasReadAccess(taskId,projectId)){
            throw new Exception()
        }
        Task foundTask = getTask(taskId, projectId)
        List<Task> ancestors = []
        Task _task = foundTask
        while (_task.level > 1) {
            Task parentTask = taskParentHelperService.getParentTask(_task.id)
            _task = parentTask
            ancestors.push(parentTask)
        }
        List<Date> minDates = ancestors.collect { Task t -> t.actualStartDate ? t.actualStartDate : t.plannedStartDate }.findAll { t -> t != null }.sort().reverse()
        List<Date> maxDates = ancestors.collect { Task t -> t.actualEndDate ? t.actualEndDate : t.plannedEndDate }.findAll { t -> t != null }.sort()
        Date minDate
        Date maxDate
        if (minDates.size() > 0) {
            minDate = new Date(minDates[0].year, minDates[0].month, minDates[0].date)
        }
        if (maxDates.size() > 0) {
            maxDate = new Date(maxDates[0].year, maxDates[0].month, maxDates[0].date)
        }
        Format formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss:SSS")

        return [minDate: minDate ? formatter.format(minDates[0]) : minDate, maxDate: maxDate ? formatter.format(maxDates[0]) : maxDate]
    }

    def reorderListIndexes(long taskId, long projectId, ValidatedParameterMap validatedBody){
        Project project = Project.lock(projectId)
        Task movedTask = getTask(taskId, projectId)
        def currentTasks = project.tasks.stream().filter( {task -> task.level > 1}).collect().toList()
        def endIndex = validatedBody.newListIdx
        def startIndex = movedTask.listIdx
        currentTasks.forEach {Task task -> {
            def fullParentObj = taskParentHelperService.getParentTask(task.id)
            JSONObject parent = new JSONObject()
            parent.put('id', fullParentObj.id)
            parent.put('level', fullParentObj.level)
            task.parent = parent
            if(task.id != movedTask.id){
                if (task.listIdx < endIndex && task.listIdx > startIndex) {
                    task.listIdx = task.listIdx - 1
                    task.save()
                } else if (task.listIdx < startIndex && task.listIdx > endIndex) {
                    task.listIdx = task.listIdx + 1
                    task.save()
                } else if (task.listIdx == endIndex || task.listIdx == startIndex) {
                    if (endIndex > startIndex) {
                        task.listIdx = task.listIdx - 1
                        task.save()
                    } else {
                        task.listIdx = task.listIdx + 1
                        task.save()
                    }
                }
            }else{
                movedTask.listIdx = endIndex
                movedTask.save()
            }
        }}
        return currentTasks
    }

    def reorderListIndexesUnderParent(Task destinationParent, Task createdTask, Project project){
        createdTask.listIdx = destinationParent.listIdx
        project.tasks.stream().filter( {t -> t.level > 1}).collect().toList().forEach { Task t ->
                    if(t.listIdx >= createdTask.listIdx && t.id != createdTask.id){
                        t.listIdx = t.listIdx + 1
                        t.save()
                    }
                }
        if(createdTask.tasks){
            createdTask.tasks.forEach {Task subtask ->
                reorderListIndexesUnderParent(createdTask, subtask, project)
            }
        }

        return createdTask
    }

    def fixTaskListOrderingForOldWorkstream(List<Task>tasks){
        tasks.forEach {Task task-> {
            if(task.level!=1){
                  task.listIdx = tasks.findAll {it.level!=1}.findIndexOf {task.id ==it.id}
                  task.save()
            }

        }}
    }

    def squishListIndexes(long projectId,Task unarchivedTask = null){
        Project currProject = projectService.getProject(projectId)
        List<Task> allTasksInProject = Task.findAllByProjectAndLevelGreaterThan(currProject, 1)
        int length = allTasksInProject.size()
        if(length==0){
            return allTasksInProject
        }
        Task minListIdx = allTasksInProject.stream().min(Comparator.comparing {Task t -> t.listIdx}).get()
        int min = minListIdx.listIdx
        List<Task> squishedTasks = allTasksInProject.sort {it.listIdx}
        int i = 0
        if(unarchivedTask!=null){
            squishedTasks.add(unarchivedTask)
        }
        squishedTasks.forEach {Task t ->
            t.listIdx = min + i
            i++
            t.save(flush: true)
        }

        return squishedTasks
    }

    def postsInTaskTree(def task,counter){
        if (task.posts.size()>0) {
                counter = counter + task.posts.size()
            }
            if (task.tasks) {
                task.tasks.forEach{def t -> {
                    counter = postsInTaskTree(t, counter)
                }}
            }
            return counter

    }
}