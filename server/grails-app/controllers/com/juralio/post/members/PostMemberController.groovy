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

package com.juralio.post.members

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.common.UserDecoratorService
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.post.Post
import com.juralio.post.dao.TaskPostsDAOService
import com.juralio.post.exception.DuplicateTeamMemberException
import com.juralio.post.exception.NoValidUserException
import com.juralio.post.member.PostMemberService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic
import org.springframework.http.HttpStatus

@CompileStatic
@Secured(['ROLE_USER'])
class PostMemberController {
    static allowedMethods = [save: "POST"]
    PostMemberService postMemberService
    TaskPostsDAOService taskPostsDAOService
    UserDecoratorService userDecoratorService
    MatterService matterService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    @CompileDynamic
    def save(long matter_id, long task_id, long post_id) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            if (request.JSON.user.id == 0) {
                throw new NoValidUserException()
            } else {
                Matter matter = matterService.getMatterOnly(matter_id)
                Post post = taskPostsDAOService.getPost(post_id)
                PostMember postMember
                if (request.JSON.user?.isPlaceholder==true) {
                    postMember = postMemberService.addPostMemberPlaceholder(matter, request.JSON.user.id as long, task_id, post_id, params.project_id as long)
                } else {
                    postMember = postMemberService.addPostMember(matter, request.JSON.user.id as long, task_id, post_id, params.project_id as long)
                }

                List<PostMember> list = post.members as List<PostMember>
                userDecoratorService.decorateActiveUsersOnMatter(list.findAll { pm -> pm.user }.user, matter)
                respond list, [status: HttpStatus.OK, view: '/postMember/_postMemberList']
            }

        } catch (DuplicateTeamMemberException exception) {
            log.debug(exception.message)
            respond exception.message, [status: HttpStatus.BAD_REQUEST]
        } catch (NoValidUserException exception) {
            log.debug(exception.message)
            respond exception.message, [status: HttpStatus.BAD_REQUEST]
        } catch (NullPointerException exception) {
            log.debug(exception.message)
            respond exception.message, [status: HttpStatus.BAD_REQUEST]
        }
    }
}