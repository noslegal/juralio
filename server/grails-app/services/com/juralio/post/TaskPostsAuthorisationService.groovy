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

package com.juralio.post

import com.juralio.auth.AppUser
import com.juralio.auth.BaseAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.post.dao.TaskPostsDAOService
import com.juralio.project.ProjectService
import com.juralio.task.Task
import com.juralio.task.TaskAuthorisationService
import com.juralio.task.TaskService
import com.juralio.task.dao.TaskDAOService
import grails.gorm.transactions.Transactional
import groovy.transform.CompileStatic

@Transactional
@CompileStatic
class TaskPostsAuthorisationService extends BaseAuthorisationService {

    TaskAuthorisationService taskAuthorisationService
    TaskPostsDAOService taskPostsDAOService
    TaskDAOService taskDAOService
    MatterService matterService
    TaskService taskService
    ProjectService projectService

    boolean hasWriteAccess(long taskId, Post post, long projectId) {
        taskAuthorisationService.hasWriteAccess(taskId, projectId) && hasPostAccess(post)
    }

    boolean isValidTaskParent(long taskId, long postId) {
        Task task = taskDAOService.get(taskId)
        if (!task) {
            return false
        }
        for (Post aPost in task.getPosts()) {
            if (aPost.id == postId) {
                return true
            }
        }
        return false
    }

    boolean hasWriteAccess(long taskId, long postId, long projectId) {
        if (!isValidTaskParent(taskId, postId)) return false
        Post post = taskPostsDAOService.getPost(postId)
        if (!post) return false
        taskAuthorisationService.hasWriteAccess(taskId, projectId) && hasPostAccess(post)
    }

    boolean hasReadAccess(long taskId, long postId, long projectId) {
        if (!isValidTaskParent(taskId, postId)) return false

        Post post = taskPostsDAOService.getPost(postId)
        if (!post) return false
        taskAuthorisationService.hasReadAccess(taskId, projectId) && hasPostAccess(post)
    }

    private boolean hasPostAccess(Post post) {
        hasUserPostAccess(post, getUser() as AppUser)
    }

    // NOTE: this method assumes User's access to task has already been verified.
    boolean hasUserPostAccess(Post post, AppUser user) {
        (post.finalised && !post.privatePost || post.authors == null || post.authors.size() == 0 || post.authors.find { it.user == user })
    }

    boolean hasArchiveAccess(long taskId, long postId) {
        AppUser user = getUser()
        if (user.externalUserId != null) {
            return false
        }
        if (!isValidTaskParent(taskId, postId)) return false
        Task task = Task.get(taskId)
        if (!projectService.canAccessPrivateWorkstream(task.project)) {
            return false
        }
        Post post = taskPostsDAOService.getPost(postId)
        boolean isTeamMember = matterService.isTeamMemberOnActiveMatter(task.project.matter.id, getUserId())
        return isTeamMember && hasPostAccess(post)
    }

    boolean hasMoveAccess(Task oldTask, Task newTask, Post post) {
        AppUser user = getUser()
        if (user.externalUserId != null) {
            return false
        }
        if (!projectService.canAccessPrivateWorkstream(oldTask.project)) {
            return false
        }
        if (!projectService.canAccessPrivateWorkstream(newTask.project)) {
            return false
        }

        boolean isOldTeamMember = matterService.isTeamMemberOnActiveMatter(oldTask.project.matter.id, getUserId())

        boolean isNewTeamMember = matterService.isTeamMemberOnActiveMatter(newTask.project.matter.id, getUserId())

        return isOldTeamMember && isNewTeamMember && hasPostAccess(post) && (newTask.project.matterId == oldTask.project.matterId)
    }
}
