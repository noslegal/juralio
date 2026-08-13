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

package com.juralio.post.member

import com.juralio.auth.AppUser
import com.juralio.auth.UserService
import com.juralio.auth.exception.UserDoesNotExistException
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.matter.Placeholders
import com.juralio.matter.PlaceholdersService
import com.juralio.post.Post
import com.juralio.post.TaskPostsAuthorisationService
import com.juralio.post.dao.PostMemberDAOService
import com.juralio.post.dao.TaskPostsDAOService
import com.juralio.post.exception.DuplicateTeamMemberException
import com.juralio.post.exception.NoValidUserException
import com.juralio.post.members.PostMember
import com.juralio.project.Project
import com.juralio.project.ProjectService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import groovy.transform.CompileStatic
import org.springframework.security.access.AccessDeniedException

@CompileStatic
@Transactional
class PostMemberService {

    UserService userService
    TaskPostsDAOService taskPostsDAOService
    PostMemberDAOService postMemberDAOService
    MatterService matterService
    TaskPostsAuthorisationService taskPostsAuthorisationService
    SpringSecurityService springSecurityService
    PlaceholdersService placeholdersService
    ProjectService projectService

    PostMember addPostMember(Matter matter, long user_id, long task_id, long post_id, long project_id) {
        if(!taskPostsAuthorisationService.hasWriteAccess(task_id,post_id,project_id)){
            throw new Exception()
        }
        try {
            AppUser user = userService.getUserById(user_id)
            AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
            Post post = taskPostsDAOService.getPost(post_id)

            if (!taskPostsAuthorisationService.hasUserPostAccess(post, currentUser)) {
                throw new AccessDeniedException("Current user is not an editor of this post.")
            }

            if (!matterService.isTeamMember(matter.id, user.id) && !matterService.isViewer(matter.id, user.id, true)) {
                throw new AccessDeniedException("""user $user.id cannot be added as a member to post $post.id
                                               as user is not a matter team member of $matter.id""")
            }

            return postMemberDAOService.addMemberToPost(post, user)
        }
        catch (UserDoesNotExistException e) {
            log.debug(e.message)
            throw new NoValidUserException()
        }
        catch (DuplicateTeamMemberException exception) {
            log.debug(exception.message)
            throw exception
        }
        catch (NullPointerException e) {
            log.debug(e.message)
            throw new NoValidUserException()
        }
    }

    PostMember addPostMemberPlaceholder(Matter matter, long user_id, long task_id, long post_id, long project_id) {
        if(!taskPostsAuthorisationService.hasWriteAccess(task_id,post_id,project_id)){
            throw new Exception()
        }
        try {
            Placeholders user = placeholdersService.getPlaceholder(user_id, matter.id)
            AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
            Post post = taskPostsDAOService.getPost(post_id)

            if (!taskPostsAuthorisationService.hasUserPostAccess(post, currentUser)) {
                throw new AccessDeniedException("Current user is not an editor of this post.")
            }

            if (user.matter.id!=matter.id) {
                throw new AccessDeniedException("""user $user.id cannot be added as a member to post $post.id
                                               as user is not a matter team member of $matter.id""")
            }

            return postMemberDAOService.addPlaceholderMemberToPost(post, user)
        }
        catch (UserDoesNotExistException e) {
            log.debug(e.message)
            throw new NoValidUserException()
        }
        catch (DuplicateTeamMemberException exception) {
            log.debug(exception.message)
            throw exception
        }
        catch (NullPointerException e) {
            log.debug(e.message)
            throw new NoValidUserException()
        }
    }

    def removePostMember(long user_id, long task_id, long post_id, long project_id) {
        if(!taskPostsAuthorisationService.hasWriteAccess(task_id,post_id,project_id)){
            throw new Exception()
        }
        try {
            AppUser user = userService.getUserById(user_id)
            Post post = taskPostsDAOService.getPost(post_id)
            return postMemberDAOService.removeMemberFromPost(post, user)
        }
        catch (UserDoesNotExistException e) {
            log.debug(e.message)
            throw new NoValidUserException()
        }
    }

    def removePlaceholderPostMember(long user_id, long task_id, long post_id, long project_id) {
        if(!taskPostsAuthorisationService.hasWriteAccess(task_id,post_id,project_id)){
            throw new Exception()
        }
        try {
            Project project = projectService.getProjectOnly(project_id)
            Placeholders user = placeholdersService.getPlaceholder(user_id, project.matter.id)
            Post post = taskPostsDAOService.getPost(post_id)
            return postMemberDAOService.removePlaceholderMemberFromPost(post, user)
        }
        catch (UserDoesNotExistException e) {
            log.debug(e.message)
            throw new NoValidUserException()
        }
    }
}
