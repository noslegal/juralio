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
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.matter.referencenumber.MatterPostsReferenceNumberService
import com.juralio.post.Post
import com.juralio.task.Task
import com.juralio.task.dao.TaskDAOService
import grails.gorm.transactions.Transactional

@Transactional
class TaskPostsDAOService {

    TaskDAOService taskDAOService
    MatterPostsReferenceNumberService matterPostsReferenceNumberService
    MatterService matterService

    Post createTaskPost(Task task,
                        String name,
                        String description,
                        AppUser creator,
                        boolean privatePost = false,
                        String type = null,
                        String url = null,
                        long matterId,
                        Date startTime = null,
                        Date endTime = null,
                        boolean finalised = false
    ) {
        Post post = new Post(
                name: name,
                description: description,
                privatePost: privatePost,
                type: type,
                url: url,
                startTime: startTime,
                endTime: endTime,
                finalised: finalised,
        )
        post.creator = creator
        post.referenceNumber = matterPostsReferenceNumberService.getNextReferenceNumber(matterId)
        task.addToPosts(post)

        post.save()

        if (task.id) {
            taskDAOService.save(task)
        }
        return post
    }

    Post getPost(long postId) {
        return Post.get(postId)
    }

    List<Post> getArchivedPosts(long matterId) {
        Matter matter = matterService.getMatterOnly(matterId)
        return Post.findAllByMatterWhenArchived(matter)
    }
}
