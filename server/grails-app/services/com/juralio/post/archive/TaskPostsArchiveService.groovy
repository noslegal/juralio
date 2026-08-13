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

import com.juralio.auth.AppUser
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.matter.MatterStatus
import com.juralio.post.Post
import com.juralio.post.dao.TaskPostsDAOService
import com.juralio.post.exception.PostNotArchivedException
import com.juralio.post.exception.PostRestoreDestinationException
import grails.gorm.transactions.Transactional

@Transactional
class TaskPostsArchiveService {
    MatterService matterService
    TaskPostsDAOService taskPostsDAOService
    TaskPostsRestorationService taskPostsRestorationService
    MatterAuthorisationService matterAuthorisationService

    def restorePost(long matterId, long postId, def postDestinationMap) throws PostRestoreDestinationException, PostNotArchivedException {
        if(!matterAuthorisationService.hasReadAccessAndIsMatterAdmin(matterId)){
            throw new Exception()
        }
        Post post = taskPostsRestorationService.restorePost(matterId, postId, postDestinationMap)
        if (post == null)
            throw new PostRestoreDestinationException('')
        return post
    }

    List<TaskPostArchiveDTO> getArchivedPosts(long matterId) {
        if(!matterAuthorisationService.hasReadAccessAndIsMatterAdmin(matterId)){
            throw new Exception()
        }
        if (matterService.getMatterOnly(matterId).matterStatus != MatterStatus.ACTIVE.value()) {
            return []
        }
        List<Post> posts = taskPostsDAOService.getArchivedPosts(matterId)
        List<TaskPostArchiveDTO> summary = []
        for (int i = 0; i < posts.size(); i++) {
            summary.push(new TaskPostArchiveDTO(posts[i]))
        }
        return summary
    }
}

class TaskPostArchiveDTO {
    AppUser archivedBy
    String name
    String type
    Long id
    Long matterWhenArchivedId
    Long projectWhenArchivedId
    Long taskWhenArchivedId
    Date archivedDate

    TaskPostArchiveDTO(Post aPost) {
        this.id = aPost.id
        this.archivedBy = aPost.archivedBy
        this.name = aPost.name
        this.matterWhenArchivedId = aPost.matterWhenArchived.id
        this.projectWhenArchivedId = aPost.projectWhenArchived.id
        this.taskWhenArchivedId = aPost.taskWhenArchivedId
        this.archivedDate = aPost.archivedDate
        this.type = aPost.type
    }
}