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
import com.juralio.auth.UserRoleService
import com.juralio.blockers.TaskBlockedByInProgress
import com.juralio.blockers.TaskBlockerException
import com.juralio.common.APIErrorCodes
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.matter.MatterService
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.post.TaskPostsService
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.recency.RecencyService
import com.juralio.task.blockers.TaskBlockerService
import com.juralio.task.datetime.exception.DateBoundaryException
import com.juralio.task.datetime.exception.DateConsistencyException
import com.juralio.task.datetime.exception.DateTypeStatusConflict
import com.juralio.task.datetime.exception.TaskDateTimeException
import com.juralio.task.exception.*
import com.juralio.task.followers.TaskFollowerService
import com.juralio.task.status.TaskStatus
import com.juralio.task.status.exception.*
import com.juralio.task.team.TaskTeamMember
import com.juralio.template.TaskTemplate
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import grails.validation.ValidationException
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

import static org.springframework.http.HttpStatus.*

@Secured(['IS_AUTHENTICATED_FULLY'])
class TaskController {

    static allowedMethods = [show: "GET", showSiblings: "GET",showChildren: "GET", index: "GET", update: "PATCH", save: "POST", updateList: "PATCH", getMinMaxBoundsUpTree: 'GET',getAllMatterTasks:'GET']

    TaskService taskService
    ProjectService projectService
    RecencyService recencyService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService
    TaskHierarchyHelperService taskHierarchyHelperService
    TaskFollowerService taskFollowerService
    TaskPostsService taskPostsService
    TaskTreeHelperService taskTreeHelperService
    MatterService matterService
    TaskBlockerService taskBlockerService

    def show() {
        Task task
        try {
            task = taskService.getTask(params.id as long, params.project_id as long)
        } catch (IllegalArgumentException e) {
            render status: HttpStatus.BAD_REQUEST
            return
        } catch (AccessDeniedException) {
            render status: HttpStatus.FORBIDDEN
            return
        }

        if (task.project.id != params.project_id.toInteger()) {
            render status: HttpStatus.NOT_FOUND, text: "No task with that project and task id"
            return
        }

        if (task.status == TaskStatus.NOT_REQUIRED.value()) {
            AppUser user = springSecurityService.getCurrentUser()
            if (user.externalUserId != null) {
                render status: HttpStatus.BAD_REQUEST
                return
            }
        }

        if (task != null && !params.skipRecency) {
            recencyService.updateTaskRecency(task)
        }
        task.teamMembers.each { ttm ->
            List<Task> descendants = taskTreeHelperService.getFlatTaskList(task)
            List<TaskTeamMember> assignments = descendants.collect { Task t ->
                t.teamMembers.findAll(it -> (it.user && ttm.user && it.user.id == ttm.user.id) || (it.placeholder && ttm.placeholder && it.placeholder.id == ttm.placeholder.id)).findAll { TaskTeamMember tm ->
                    {
                        if (tm.user && ttm.user) {
                            return tm
                        } else if (tm.placeholder && ttm.placeholder) {
                            return tm
                        }
                    }
                }
            }.flatten() as List<TaskTeamMember>

            if (ttm.user) {
                ttm.user.isOnAllSubtasks = descendants.size() == assignments.size()
                ttm.user.isOnSomeSubtasks = assignments.size() > 1
                ttm.isOnAllSubtasks = ttm.user.isOnAllSubtasks
                ttm.isOnSomeSubtasks = ttm.user.isOnSomeSubtasks
            } else if (ttm.placeholder) {
                ttm.placeholder.isOnAllSubtasks = descendants.size() == assignments.size()
                ttm.placeholder.isOnSomeSubtasks = assignments.size() > 1
                ttm.isOnAllSubtasks = ttm.placeholder.isOnAllSubtasks
                ttm.isOnSomeSubtasks = ttm.placeholder.isOnSomeSubtasks
            }

            if (ttm.user && matterService.isTeamMember(task.project.matterId, ttm.user.id)) {
                ttm.user.isActiveOnMatter = true
            } else if (ttm.user && matterService.isViewer(task.project.matterId, ttm.user.id)) {
                ttm.user.isViewerOnMatter = true
                ttm.user.isActiveOnMatter = true
            }

        }
        respond task, [status: OK, view: '/task/_task']
    }

    def showSiblings() {
        List<Task> tasks = taskService.getSiblingTasks(params.id as long, params.project_id as long)
        respond tasks, [status: OK, view: '/task/_siblingTasks']
    }

    def showChildren() {
        List<Task> tasks = taskService.getChildrenTasks(params.id as long, params.project_id as long)
        respond tasks, [status: OK, view: '/task/_childrenTasks']
    }

    def index() {
        boolean isStructure = params.reduceData && params.reduceData == 'true'
        List<Task> tasks = taskService.listTasks(params)
        if (params.taskmapFlatTasks && params.taskmapFlatTasks == 'true') {
            tasks = tasks.collect { Task t ->
                taskBlockerService.sortBlockersForTaskmap(t)

                t.parent = taskHierarchyHelperService.getAncestor(t, t.project, !isStructure)
                t.isCurrentUserFollower = taskFollowerService.isTaskFollower(t, springSecurityService.getCurrentUser())
                if (params.includePosts == 'true') {
                    t.posts = taskPostsService.getPostsByTaskId(t.id, t.project.id)
                }
                return t
            }
            respond tasks, [status: OK, view: '/task/_taskmapFlatTaskList']
        } else {
            respond tasks, [status: OK]
        }
    }


    private def getErrorCodeForTaskStatusException(TaskStatusException exception) {
        if (exception instanceof HasNotStartedParents) {
            return APIErrorCodes.HAS_NOT_STARTED_PARENTS.code()
        } else if (exception instanceof HasDoneParents) {
            return APIErrorCodes.HAS_DONE_PARENTS.code()
        } else if (exception instanceof HasNotDoneChildren) {
            return APIErrorCodes.HAS_NOT_DONE_CHILDREN.code()
        } else if (exception instanceof HasActiveAndDoneChildren) {
            return APIErrorCodes.HAS_ACTIVE_AND_DONE_CHILDREN.code()
        } else if (exception instanceof HasNotStartedParentsAndNotDoneChildren) {
            return APIErrorCodes.HAS_NOT_STARTED_PARENTS_AND_NOT_DONE_CHILDREN.code()
        } else if (exception instanceof HasDoneParentsAndDoneChildren) {
            return APIErrorCodes.HAS_DONE_PARENTS_AND_DONE_CHILDREN.code()
        } else if (exception instanceof HasNotRequiredParents) {
            return APIErrorCodes.HAS_NOT_REQUIRED_PARENTS.code()
        } else if (exception instanceof HasNotRequiredChildren) {
            return APIErrorCodes.HAS_NOT_REQUIRED_CHILDREN.code()
        } else if (exception instanceof HasNotRequiredParentsAndChildren) {
            return APIErrorCodes.HAS_NOT_REQUIRED_PARENTS_AND_CHILDREN.code()
        } else if (exception instanceof ExternalUserCannotSetTaskToNotRequired) {
            return APIErrorCodes.EXTERNAL_USER_CANNOT_SET_TASK_TO_NOT_REQUIRED.code()
        }
        throw new IllegalArgumentException("Unrecognised TaskStatusException type")
    }

    private def getErrorCodeForTaskBlockerException(TaskBlockerException exception) {
        if (exception instanceof TaskBlockedByInProgress) {
            return APIErrorCodes.TASK_BLOCKED_BY_IN_PROGRESS.code()
        }
    }

    def update() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }

        Task task
        Date originalPlannedEndDate
        Date originalPlannedStartDate
        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [],
                ['name',
                 'description',
                 'datesLinkedToSiblings',
                 'dateKey',
                 'status',
                 'offset',
                 'actualEndDate',
                 'plannedEndDate',
                 'actualStartDate',
                 'plannedStartDate',
                 'isMilestone',
                 'isDeliverable',
                 'dateCleared',
                 'newListIdx'
                ])
        try {

            if(validatedBody.newListIdx != null){
                def reorderedTasks = taskService.reorderListIndexes(params.id as long, params.project_id as long, validatedBody)
                respond reorderedTasks,  [status: OK, view: '/task/_taskmapFlatTaskList']
                return
            }
            originalPlannedEndDate = taskService.getTaskOnly(params.id as long, params.project_id as long).plannedEndDate
            originalPlannedStartDate = taskService.getTaskOnly(params.id as long, params.project_id as long).plannedStartDate


            task = taskService.updateTask(params.project_id as long,
                    params.id as long,
                    validatedBody,
                    params.maintainTaskConsistencyUpdate == 'true',
                    params.updateSubtaskDates == 'true')
        } catch (TaskStatusException e) {
            render status: getErrorCodeForTaskStatusException(e), text: e.message
        } catch (TaskBlockerException e) {
            render status: getErrorCodeForTaskBlockerException(e), text: e.message
        }
        catch (TaskDateTimeException e) {
            render(status: taskService.getErrorCodeForTaskDateTimeException(e), text: e.message)
        } catch (AccessDeniedException e) {
            render status: BAD_REQUEST
            return
        } catch (LinkedTaskWouldStartBeforeParentException e) {
            render status: 328, text: e.message
        } catch (LinkedTaskWouldEndAfterParentException e) {
            render status: 329, text: e.message
        } catch (LinkedTaskWouldEndBeforeItStarted e) {
            render status: 330, text: e.message
        } catch (LinkedTaskWouldStartAfterItFinished e) {
            render status: 331, text: e.message
        } catch (ValidationException e) {
            render status: BAD_REQUEST
            return
        }
        if (!task) return

        if (task.errors && task.errors.hasErrors()) {
            respond task.errors
        } else {
            if (taskService.hasWipedDates(task, validatedBody, originalPlannedStartDate, originalPlannedEndDate)) {
                response.setStatus(APIErrorCodes.INCONSISTENT_PLANNED_DATES_REMOVED.code() as int)
                respond task
            } else {

                respond task, [status: OK]
            }
        }
    }

    def save() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (params.id != null) {
            response.setStatus(HttpStatus.METHOD_NOT_ALLOWED)
        }


        if (params.templateTaskId) {
            createFromTemplateTask(request)
        } else if (params.templateProjectId) {
            createFromTemplateProject(request)
        } else {
            def validatedBody = ParameterValidatorService.validate(request.JSON, ['name', 'status'], [])
            createTaskInProject(request)
        }
    }

    private createFromTemplateTask(request) {
        Task task
        try {
            TaskTemplate templateTask = TaskTemplate.get(params.long('templateTaskId'))
            if (request.JSON.phase) {
                task = taskService.createFromTemplateTaskAsSubtask(params.templateTaskId as long,
                        request.JSON.phase as long,
                        request.JSON.project as long,
                        request.JSON.includePosts as boolean,
                        templateTask.projectTemplate.id, request.JSON.includeDescriptions as boolean)
            } else {
                task = taskService.createFromTemplateTaskAsLevelA(params.templateTaskId as long,
                        request.JSON.project as long,
                        request.JSON.includePosts as boolean,
                        templateTask.projectTemplate.id, request.JSON.includeDescriptions as boolean)
            }

        } catch (MaximumNumberOfLevelATasksExceededException maximumNumberOfLevelATasksExceededException) {
            return returnErrorResponse(maximumNumberOfLevelATasksExceededException)
        } catch (MaximumNumberOfSubTasksExceededException maximumNumberOfSubTasksExceededException) {
            return returnErrorResponse(maximumNumberOfSubTasksExceededException)
        } catch (MaximumTasksExceededException maximumTasksExceededException) {
            respond(message: maximumTasksExceededException.getMessage(), status: BAD_REQUEST, error_type: 'TASK_LIMIT')
            return
        } catch (InvalidDestinationParent e) {
            return returnErrorResponse(e)
        }

        recencyService.updateTaskRecency(task, true)
        respond task, [status: CREATED]
    }

    private createFromTemplateProject(request) {
        List<Task> tasks

        try {
            if (request.JSON.phase) {
                Integer phase = request.JSON.phase as Integer
                Integer project = request.JSON.project as Integer
                Boolean destinationParentIsNotRequired = taskService.isMarkedAsNotRequired(phase, project)
                if (destinationParentIsNotRequired) {
                    throw new InvalidDestinationParent("Cannot create children of a not required task")
                }
                tasks = taskService.createFromTemplateProjectAsSubtask(params.templateProjectId,
                        request.JSON.phase as long,
                        request.JSON.project as long,
                        request.JSON.includePosts as boolean, request.JSON.includeDescriptions as boolean)
            } else {
                tasks = taskService.createFromTemplateProjectAsLevelA(params.templateProjectId,
                        request.JSON.project as long,
                        request.JSON.includePosts as boolean,
                        request.JSON.includeDescriptions as boolean)
            }

        } catch (MaximumNumberOfLevelATasksExceededException maximumNumberOfLevelATasksExceededException) {
            return returnErrorResponse(maximumNumberOfLevelATasksExceededException)
        } catch (MaximumNumberOfSubTasksExceededException maximumNumberOfSubTasksExceededException) {
            return returnErrorResponse(maximumNumberOfSubTasksExceededException)
        } catch (MaximumTasksExceededException maximumTasksExceededException) {
            respond(message: maximumTasksExceededException.getMessage(), status: BAD_REQUEST, error_type: 'TASK_LIMIT')
            return
        } catch (InvalidDestinationParent e) {
            return returnErrorResponse(e)
        }

        tasks.each { recencyService.updateTaskRecency(it) }
        respond tasks, [status: CREATED]
    }

    private createTaskInProject(request) {
        Task newTask = new Task()
        newTask.name = request.JSON.name
        newTask.status = request.JSON.status
        if(request.JSON.isDeliverable){
            newTask.isDeliverable = request.JSON.isDeliverable
        }else {
            newTask.isDeliverable=false
        }
        newTask.createdBy = springSecurityService.getCurrentUser()
        newTask.datesLinkedToSiblings = false
        if (request.JSON.isMilestone != null) newTask.isMilestone = request.JSON.isMilestone

        if (request.JSON.phase != null) {
            try {
                taskService.saveTaskWithTaskParent(newTask, request.JSON.phase as long, request.JSON.project as long)
            } catch (MaximumNumberOfSubTasksExceededException maximumNumberOfSubTasksExceededException) {
                return returnErrorResponse(maximumNumberOfSubTasksExceededException)
            } catch (MaximumTasksExceededException maximumTasksExceededException) {
                respond(message: maximumTasksExceededException.getMessage(), status: BAD_REQUEST, error_type: 'TASK_LIMIT')
                return
            }
        } else {
            try {
                taskService.saveTaskWithProjectParent(newTask, request.JSON.project as long)
            } catch (MaximumNumberOfLevelATasksExceededException maximumNumberOfLevelATasksExceededException) {
                return returnErrorResponse(maximumNumberOfLevelATasksExceededException)
            } catch (MaximumTasksExceededException maximumTasksExceededException) {
                respond(message: maximumTasksExceededException.getMessage(), status: BAD_REQUEST, error_type: 'TASK_LIMIT')
                return
            }
        }

        if (newTask.errors.hasErrors()) {
            respond newTask.errors
            return
        }
        taskService.taskCreation(newTask, null, null, null, Creation_type.FROM_BLANK.value())
        recencyService.updateTaskRecency(newTask, true)

        respond newTask, [status: CREATED]
    }

    private void returnErrorResponse(TaskException taskException) {
        def errorResponse = [[message: taskException.getMessage()]]
        respond errorResponse, [status: BAD_REQUEST]
        return
    }

    def updateList() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        boolean maintainTaskConsistencyUpdate = params.maintainTaskConsistencyUpdate as boolean

        try {
            if (request.JSON.parentTask != null) {
                Task parent = taskService.updateTasksForTask(request.JSON.parentTask as long,
                        request.JSON.taskOrder, maintainTaskConsistencyUpdate, params.project_id as long)
                respond parent, [status: OK]
            } else {
                Project parent = taskService.updateTasksForProject(params.project_id as long,
                        request.JSON.taskOrder, maintainTaskConsistencyUpdate)

                respond projectService.getProject(parent.id), [status: OK, view: '/project/_projectTree']
            }
        } catch (TaskStatusException e) {
            render status: getErrorCodeForTaskStatusException(e), text: e.message
        } catch (AccessDeniedException e) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def getMinMaxBoundsUpTree() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        def results = taskService.getMinMaxBoundsUpTree(params.id as long, params.workstream_id as long)
        respond results
    }

    def getAllMatterTasks(long matter_id) {
        def results = taskService.getAllMatterTasks(matter_id)
        respond results.reverse().sort { a, b -> a.status <=> b.status }
    }
}
