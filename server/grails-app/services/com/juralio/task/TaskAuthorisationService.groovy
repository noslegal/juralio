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
import com.juralio.auth.BaseAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.project.Project
import com.juralio.project.ProjectService
import grails.gorm.transactions.Transactional
import groovy.transform.CompileStatic

@Transactional
@CompileStatic
class TaskAuthorisationService extends BaseAuthorisationService {

    MatterService matterService
    ProjectService projectService

    boolean isValidTaskParent(long taskId, long projectId) {
        Project project = projectService.getProjectOnly(projectId)
        Task task = Task.get(taskId)
        if (!project || !task) {
            return false
        }
        if (task.project.isPrivate && !projectService.canAccessPrivateWorkstream(task.project)) {
            return false
        }
        if (task.project.isPendingDeletion) {
            return false
        }
        return task.project.id == project.id
    }


    boolean hasMoveAccess(Long entityId, Long projectId) {
        AppUser user = getUser()
        if (user.externalUserId != null) {
            return false
        }
        if (!isValidTaskParent(entityId, projectId)) {
            return false
        } else {
            Task task = Task.get(entityId)
            if (task.project.isPrivate && !projectService.canAccessPrivateWorkstream(task.project)) {
                return false
            }
            if (task.project.isPendingDeletion) {
                return false
            }

            boolean isTeamMember = matterService.isTeamMemberOnActiveMatter(task.project.matter.id, getUserId())

            return isTeamMember || hasUnarchiveAccess(entityId)
        }
    }


    boolean hasArchiveAccess(Long entityId) {
        AppUser user = getUser()
        if (user.externalUserId != null) {
            return false
        }
        Task task = Task.get(entityId)
        if (task.project.isPrivate && !projectService.canAccessPrivateWorkstream(task.project)) {
            return false
        }
        if (task.project.isPendingDeletion) {
            return false
        }

        boolean isTeamMember = matterService.isTeamMemberOnActiveMatter(task.project.matter.id, getUserId())

        return isTeamMember
    }

    boolean hasUnarchiveAccess(Long taskId, Long unarchiveToProjectId = null) {
        Task task = Task.get(taskId)
        if (task.project.isPrivate && !projectService.canAccessPrivateWorkstream(task.project)) {
            return false
        }
        if (task.project.isPendingDeletion) {
            return false
        }

        Project projectToUnarchiveTo = unarchiveToProjectId ?
                projectService.getProjectOnly(unarchiveToProjectId as long) :
                projectService.getProjectByDeletedMirror(projectService.getProjectOnly(task.projectId as long))

        if (projectToUnarchiveTo) {
            boolean isTeamMember = matterService.isTeamMemberOnActiveMatter(projectToUnarchiveTo.matter.id, getUserId())
            boolean isMatterAdmin = matterService.isMatterAdmin(projectToUnarchiveTo.matter.id, getUserId())

            return isTeamMember && isMatterAdmin
        }
        return false
    }

    boolean hasReadAccess(Long entityId) {
        return hasReadAccess_(entityId)
    }

    boolean hasReadAccess(Long entityId, Long projectId) {
        if (!isValidTaskParent(entityId, projectId)) {
            return false
        } else {
            return hasReadAccess(entityId)
        }
    }

    boolean hasReadAccess(Task task, Project p) {
        if (!task) return false
        if (task in p.tasks) {
            return isUserTeamMember(task)
        } else {
            return false
        }
    }

    boolean hasWriteAccess(long entityId, long projectId) {
        Task task = Task.get(entityId)
        boolean isMatterViewer = false
        if (task) {
            isMatterViewer = matterService.isViewer(task.project.matter.id as long, getUserId() as long)
        }
        if (isMatterViewer) {
            return false
        }
        return hasReadAccess(entityId as long, projectId as long)
    }


    boolean hasWriteAccess(List<Long> entityIds, Long projectId) {
        return !entityIds.collect { entityId ->
            return hasReadAccess(entityId, projectId)
        }.contains(false)
    }

    boolean hasWriteAccess(Long taskId, Long taskId2, Long projectId){
        return hasWriteAccess(taskId,projectId) && hasWriteAccess(taskId2,projectId)
    }

    boolean hasReadAccess_(long entityId) {
        boolean isTeamMember = false
        boolean isMatterViewer = false

        Task task = Task.get(entityId)
        if (task) {
            if (task.project.isPrivate && !projectService.canAccessPrivateWorkstream(task.project)) {
                return false
            }
            if (task.project.isPendingDeletion) {
                return false
            }
            isTeamMember = matterService.isTeamMemberOnActiveMatter(task.project.matter.id, getUserId())
            isMatterViewer = matterService.isViewer(task.project.matter.id as long, getUserId() as long)
            if (!isMatterViewer && !isTeamMember) {
                Project project = projectService.getProjectByDeletedMirror(task.project)
                isTeamMember = project && matterService.isTeamMemberOnActiveMatter(project.matter.id, getUserId())
            }
        }

        return isTeamMember || isMatterViewer
    }

    private boolean isUserTeamMember(Task task) {
        boolean isTeamMember = false
        if (task) {
            isTeamMember = matterService.isTeamMemberOnActiveMatter(task.project.matter.id, getUserId())
            if (!isTeamMember) {
                Project project = projectService.getProjectByDeletedMirror(task.project)
                isTeamMember = project && matterService.isTeamMemberOnActiveMatter(project.matter.id, getUserId())
            }
        }
        isTeamMember
    }

}