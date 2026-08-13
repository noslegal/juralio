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

package com.juralio.post.author

import com.juralio.auth.AppUser
import com.juralio.auth.UserService
import com.juralio.common.UserDecoratorService
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.post.Post
import com.juralio.post.TaskPostsAuthorisationService
import com.juralio.post.authors.PostAuthor
import com.juralio.post.dao.PostAuthorDAOService
import com.juralio.post.dao.TaskPostsDAOService
import com.juralio.post.exception.DuplicateAuthorException
import com.juralio.post.exception.SoleAuthorDeletionAttemptException
import com.juralio.task.Task
import com.juralio.task.TaskService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic
import org.springframework.security.access.AccessDeniedException

@CompileStatic
@Transactional
class PostAuthorService {

    TaskService taskService
    MatterService matterService
    UserService userService
    TaskPostsDAOService taskPostsDAOService
    PostAuthorDAOService postAuthorDAOService
    UserDecoratorService userDecoratorService
    SpringSecurityService springSecurityService
    TaskPostsAuthorisationService taskPostsAuthorisationService

    PostAuthor addPostAuthor(long userId, long taskId, long postId, long projectId, boolean fromTemplateAdd = false) throws DuplicateAuthorException {
        if(!taskPostsAuthorisationService.hasWriteAccess(taskId,postId,projectId)){
            throw new Exception()
        }
        Task task = taskService.getTaskOnly(taskId, projectId)
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        Matter matter = task.project.matter
        AppUser user = userService.getUserById(userId)
        Post post = taskPostsDAOService.getPost(postId)

        if (!matterService.isTeamMember(matter.id, user.id) && !matterService.isViewer(matter.id, user.id, true)) {
            throw new AccessDeniedException("""user $user.id cannot be added as an author to post $post.id
                                               as user is not a matter team member of $matter.id""")
        }

        if(post.finalised && !matterService.isMatterAdmin(matter.id,currentUser.id,true) && !isPostAuthor(currentUser,post) && !fromTemplateAdd){
            throw new AccessDeniedException("""user $user.id cannot be added as an author to post $post.id
                                               as the post is finalised""")
        }

        if (isPostAuthor(user, post)) {
            throw new DuplicateAuthorException()
        }

        userDecoratorService.decorateActiveUsersOnMatter([user], matter)
        return postAuthorDAOService.addAuthorToPost(post, user)
    }

    @CompileDynamic
    def removePostAuthor(long userId, long taskId, long postId, long project_id) throws SoleAuthorDeletionAttemptException {
        if(!taskPostsAuthorisationService.hasWriteAccess(taskId,postId,project_id)){
            throw new Exception()
        }
        AppUser user = userService.getUserById(userId)
        Post post = taskPostsDAOService.getPost(postId)

        List<PostAuthor> authors = PostAuthor.findAllByPost(post)

        if (authors.size() == 1 && authors[0].user.id == user.id) {
            throw new SoleAuthorDeletionAttemptException()
        }

        return postAuthorDAOService.removeAuthorFromPost(post, user)
    }

    @CompileDynamic
    boolean isPostAuthor(AppUser user, Post post) {
        return PostAuthor.findByUserAndPost(user, post) != null
    }
}
