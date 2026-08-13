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

package com.juralio.post.dao

import com.juralio.auth.AppUser
import com.juralio.post.Post
import com.juralio.template.TaskTemplate
import com.juralio.template.dao.TaskTemplateDAOService
import com.juralio.template.post.referencenumber.TemplatePostsReferenceNumberService
import grails.gorm.transactions.Transactional

@Transactional
class TemplateTaskPostsDAOService {

    TaskTemplateDAOService taskTemplateDAOService
    TemplatePostsReferenceNumberService templatePostsReferenceNumberService

    Post createTemplateTaskPost(TaskTemplate templateTask, String name, String description, AppUser creator,
                                boolean privatePost = false, String type = null, String url = null, long templateId, Date startTime = null, Date endTime = null) {
        Post post = new Post(
                name: name,
                description: description,
                privatePost: privatePost,
                type: type,
                url: url,
                startTime: startTime,
                endTime: endTime
        )
        post.creator = creator
        post.referenceNumber = templatePostsReferenceNumberService.getNextReferenceNumber(templateId)

        templateTask.addToPosts(post)
        taskTemplateDAOService.save(templateTask)
        post.save()
        return post
    }

    Post getPost(long postId) {
        return Post.get(postId)
    }
}
