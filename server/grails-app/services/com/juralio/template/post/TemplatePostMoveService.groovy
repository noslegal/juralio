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

package com.juralio.template.post

import com.juralio.post.Post
import com.juralio.post.dao.TemplateTaskPostsDAOService
import com.juralio.template.*
import com.juralio.template.dao.TaskTemplateDAOService
import grails.gorm.transactions.Transactional
import groovy.transform.CompileStatic
import org.springframework.security.access.AccessDeniedException

@CompileStatic
@Transactional
class TemplatePostMoveService {

    ProjectTemplateService projectTemplateService
    TaskTemplateService taskTemplateService
    TemplateTaskPostsDAOService templateTaskPostsDAOService
    TaskTemplateAuthorisationService taskTemplateAuthorisationService
    TaskTemplateDAOService taskTemplateDAOService

    Post movePost(long templateId, long templateTaskId, long destinationTaskId, long templatePostId) {
        if (!taskTemplateAuthorisationService.hasWriteAccess(templateTaskId,templatePostId,templateId)) {
            throw new Exception()
        }
        if (taskTemplateAuthorisationService.isValidTaskParent(templateTaskId, templatePostId, templateId)) {
            TaskTemplate newTask = taskTemplateDAOService.get(destinationTaskId)
            if (taskTemplateAuthorisationService.hasWriteAccess(newTask.id, newTask.projectTemplate.id)) {
                Post postToMove = templateTaskPostsDAOService.getPost(templatePostId)
                newTask.posts.add(postToMove)
                newTask.save()

                TaskTemplate oldTask = taskTemplateService.getTaskTemplateOnly(templateTaskId, templateId)
                removeFromCurrentTask(postToMove, oldTask)
                oldTask.save()
                return postToMove
            }
        }

        throw new AccessDeniedException('Access to Template Task post denied.')
    }

    private TaskTemplate removeFromCurrentTask(Post post, TaskTemplate task) {
        task.removeFromPosts(post)
        task.save()
    }
}