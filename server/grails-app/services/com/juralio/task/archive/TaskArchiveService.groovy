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

package com.juralio.task.archive

import com.juralio.auth.AppUser
import com.juralio.costs.CostsService
import com.juralio.matter.CostsAuthorisationService
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.matter.MatterStatus
import com.juralio.post.Post
import com.juralio.post.TaskPostsService
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.recency.RecencyService
import com.juralio.task.*
import com.juralio.task.blockers.TaskBlockerService
import com.juralio.task.exception.MaximumTasksExceededException
import com.juralio.task.exception.TaskCannotBeUnarchivedException
import com.juralio.task.move.ProjectTaskMoveService
import com.juralio.task.move.TaskLinkService
import com.juralio.task.move.TaskMoveService
import com.juralio.task.move.TaskMoveValidationHelperService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.springframework.security.access.AccessDeniedException

@Transactional
class TaskArchiveService {

    static final long LEVEL_A = 0
    static final long UNRECORDED = -1
    static final long UNSET = -2

    protected final Log logger = LogFactory.getLog(getClass())

    TaskService taskService
    ProjectTaskMoveService projectTaskMoveService
    ProjectService projectService
    TaskArchiveHelperService taskArchiveHelperService
    RecencyService recencyService
    TaskMoveService taskMoveService
    TaskLinkService taskLinkService
    TaskMoveValidationHelperService taskMoveValidationHelperService
    MatterService matterService
    TaskTreeHelperService taskTreeHelperService
    TaskSiblingsService taskSiblingsService
    TaskBlockerService taskBlockerService
    SpringSecurityService springSecurityService
    CostsAuthorisationService costsAuthorisationService
    MatterAuthorisationService matterAuthorisationService
    CostsService costsService
    TaskAuthorisationService taskAuthorisationService
    TaskPostsService taskPostsService

    void archive(long projectId, long taskId) {
        if(!taskAuthorisationService.hasArchiveAccess(taskId)){
            throw new Exception()
        }
        Project parentProject = projectService.lockProject(projectId)

        Task rootTask = taskService.getTaskOnly(taskId, projectId)
        Project deletedMirrorProject = parentProject.deletedMirror

        AppUser currentUser = springSecurityService.getCurrentUser()
        if (costsAuthorisationService.organisationCostsEnabled(currentUser.organisation) && matterAuthorisationService.hasCostsAccess(parentProject.matterId)) {
            costsService.removeTaskFromCosts(rootTask)
        }

        List<Task> siblings = taskSiblingsService.getTaskSiblings(rootTask)
        if (siblings.findAll { it.datesLinkedToSiblings == true }.size() == 1) {
            taskLinkService.unlink(siblings[0].id, projectId)
        }
        taskLinkService.unlink(rootTask.id, projectId)

        List<TaskBlocker> blocked =  taskBlockerService.getTaskBlockersByBlocked(rootTask)
        if(blocked.size()>0){
            blocked.forEach(block->{
                taskBlockerService.deleteTaskBlocker(rootTask.id,block.blocker.id,projectId)
            })
        }
        List<TaskBlocker> blocker =  taskBlockerService.getTaskBlockersByBlocker(rootTask)
        if(blocker.size()>0){
            blocker.forEach(block->{
                taskBlockerService.deleteTaskBlocker(rootTask.id,block.blocked.id,projectId)
            })
        }


        rootTask = taskArchiveHelperService.recordArchiveDetails(rootTask)


        List<Task> tasks = projectTaskMoveService.moveTaskHierarchyToAnotherProject(rootTask, deletedMirrorProject)

        tasks.each { task ->
            recencyService.deleteRecentTaskRecords(task)
            task.listIdx += 1000
            task.save(flush: true)
        }

        taskService.squishListIndexes(projectId)

            recencyService.deleteRecentTaskRecords(rootTask)
    }

    def unarchive(long taskId,
                  long sourceProjectId,
                  long destinationProjectId = UNSET,
                  long destinationParentIdRaw = UNSET,
                  boolean maintainTaskConsistency) throws TaskCannotBeUnarchivedException {
        if(!taskAuthorisationService.hasUnarchiveAccess(taskId)){
            throw new Exception()
        }
        logger.debug("beginning unarchive of task with ID ${taskId}")

        Task archivedTask = taskService.getTaskOnly(taskId, sourceProjectId as long)
        Project destinationProject = destinationProjectId != UNSET ?
                projectService.lockProject(destinationProjectId) :
                projectService.lockProject(projectService.getProjectByDeletedMirror(projectService.getProjectOnly(sourceProjectId)).id)
        Long destinationParentId = destinationParentIdRaw != UNSET ?
                destinationParentIdRaw :
                archivedTask.taskParentWhenArchived

        // The original location was not recorded
        if (destinationParentId == UNRECORDED) {
            throw new TaskCannotBeUnarchivedException("Original location was not recorded")
        }
        // The original parent task is now archived
        if (destinationParentId != LEVEL_A) {
            Task parentTask = Task.get(destinationParentId)
            if (taskService.getTaskOnly(destinationParentId, parentTask.projectId as long).archivedBy != null) {
                throw new TaskCannotBeUnarchivedException("the parent task is archived.")
            }
            // The original location has moved to a lower level and can no longer accommodate the
            // archived task and its subtasks (etc) within the 6 level limit
            def destinationTaskParent = taskService.getTaskOnly(destinationParentId, parentTask.projectId as long)
            if (!taskMoveValidationHelperService.isValidMove(archivedTask, destinationTaskParent)) {
                throw new TaskCannotBeUnarchivedException("Destination project has max subtasks")
            }
        }
        // The original parent task is now in a project which is now closed
        if (!destinationProject.active) {
            throw new TaskCannotBeUnarchivedException("Project is closed")
        }
        def subtaskCounter = taskTreeHelperService.getFlatTaskList(archivedTask).size()
        if (destinationProject.tasks.size() + subtaskCounter > Task.MAXIMUM_PROJECT_TASKS) {
            throw new MaximumTasksExceededException()
        }
        projectService.lockProject(sourceProjectId)

        def res = taskMoveService.unarchiveTask(archivedTask,
                TaskMoveType.CROSS_PROJECT_DIFFERENT_PARENT,
                destinationParentId as Integer,
                destinationProject, maintainTaskConsistency)

        taskService.squishListIndexes(destinationProject.id,archivedTask)

        if (res in Task) {
            taskArchiveHelperService.clearArchiveDetails(archivedTask)
            logger.debug("completed unarchiving of task with ID ${taskId}")
        } else {
            return res
        }


    }

    List<Task> listArchivedTasks(long matterId) {
        if(!matterAuthorisationService.hasReadAccessAndIsMatterAdmin(matterId)){
            throw new Exception()
        }
        if (matterService.getMatterOnly(matterId).matterStatus != MatterStatus.ACTIVE.value()) {
            return []
        }
        List<Project> projectList = projectService.getProjectsByMatterId(matterId, true, false)
        def tasks = []
        for (Project project in projectList) {
            def archivedTasks = taskService.listArchivedTasks(project.deletedMirrorId)
            if (archivedTasks.size() > 0) {
                archivedTasks.each {
                    archivedTask ->
                        Project parentTaskProject = projectService.getProjectByDeletedMirror(archivedTask.project)
                        try {
                            if(Task.findById(archivedTask.taskParentWhenArchived) && parentTaskProject ==Task.findById(archivedTask.taskParentWhenArchived).project ){
                                if (archivedTask.taskParentWhenArchived > 0 && taskService.getTaskOnly(archivedTask.taskParentWhenArchived, Task.get(archivedTask.taskParentWhenArchived).projectId).archivedBy == null) {
                                    Project temp = taskService.getTaskOnly(archivedTask.taskParentWhenArchived, parentTaskProject.id as long).project
                                    if (temp) parentTaskProject = temp
                                }
                            }
                            archivedTask.restoreToProjectId = parentTaskProject.id
                            archivedTask.restoreToProjectName = parentTaskProject.name
                        } catch (AccessDeniedException e) {
                        }
                        if (archivedTask.taskParentWhenArchived != UNRECORDED) {
                            if (archivedTask.taskParentWhenArchived == LEVEL_A) {
                                archivedTask.restoreToParentName = LEVEL_A
                            } else {
                                try {
                                    Task parentTask = taskService.getTaskOnly(archivedTask.taskParentWhenArchived, parentTaskProject.id as long)
                                    if (parentTask) archivedTask.restoreToParentName = parentTask.name
                                } catch (Exception e) {

                                }
                            }
                        }
                }
                tasks += archivedTasks
            }
        }
        tasks.forEach {Task it -> hydrateTasks(it)}
        return tasks
    }

    //this is to get around issue with lazy loading yes i know its terrible
    private def hydrateTasks(Task task){
        task.tasks.size()
        task.posts.size()
        task.followers.size()
        task.teamMembers.size()
        task.seenBy.size()
        task.labels.size()
        if(task.posts){
            task.posts.forEach { Post p ->
                p.authors.size()
                p.members.size()}
        }
        task.tasks.forEach {Task x ->
            x.tasks.size()
            x.posts.size()
            x.followers.size()
            x.teamMembers.size()
            x.seenBy.size()
            x.labels.size()
            if(task.tasks){
                hydrateTasks(x)
            }
        }
    }
}
