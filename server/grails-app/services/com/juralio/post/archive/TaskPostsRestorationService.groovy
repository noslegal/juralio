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

package com.juralio.post.archive

import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.post.Post
import com.juralio.post.dao.TaskPostsDAOService
import com.juralio.post.exception.PostNotArchivedException
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.task.Task
import com.juralio.task.TaskService
import grails.gorm.transactions.Transactional
import groovy.transform.CompileStatic

@CompileStatic
@Transactional
class TaskPostsRestorationService {

    MatterService matterService
    TaskPostsDAOService taskPostsDAOService
    TaskService taskService
    ProjectService projectService

    Post restorePost(long matterId, long postId, Map postDestinationMap) throws PostNotArchivedException {
        Matter matter = matterService.getMatterOnly(matterId)
        Task task = taskService.getTaskOnly(postDestinationMap.taskId as long, postDestinationMap.projectId as long)
        Post post = taskPostsDAOService.getPost(postId) // No auth - so source Matter checked next.
        if (post.matterWhenArchived == null) {
            throw new PostNotArchivedException("")
        }
        Matter sourceMatter = matterService.getMatterOnly(post.matterWhenArchived.id as long)

        // Validate destination for return to original position.
        if (post.matterWhenArchived.id == postDestinationMap.matterId &&
                post.taskWhenArchivedId == postDestinationMap.taskId &&
                post.projectWhenArchived.id == postDestinationMap.projectId &&
                postDestinationMap.type == 'prevLocation') {
            post.archivedBy = null
            post.matterWhenArchived = null
            post.projectWhenArchived = null
            post.taskWhenArchivedId = null
            post.archivedDate = null
            task.posts.add(post)
            post.save()
            task.save()
        } else if (postDestinationMap.type == 'newLocation') {
            Project p = projectService.getProject(postDestinationMap.projectId as Long)
            if (!projectService.canAccessPrivateWorkstream(p)) {
                throw new Exception('Unarchive Location is invalid')
            } else {
                post.archivedBy = null
                post.matterWhenArchived = null
                post.projectWhenArchived = null
                post.taskWhenArchivedId = null
                post.archivedDate = null
                task.posts.add(post)
                post.save()
                task.save()
            }
        } else {
            post = null
        }

        return post
    }
}
