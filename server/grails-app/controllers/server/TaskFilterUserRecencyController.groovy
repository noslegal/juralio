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

package server

import com.juralio.auth.AppUser
import com.juralio.auth.UserService
import server.TaskFilterUserRecencyService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

@Secured('IS_AUTHENTICATED_FULLY')
class TaskFilterUserRecencyController {
    static allowedMethods = [index: "GET", save: "POST"]

    SpringSecurityService springSecurityService
    TaskFilterUserRecencyService taskFilterUserRecencyService
    UserService userService

    def index() {
        try {
            if (params.user_id) {
                render status: HttpStatus.METHOD_NOT_ALLOWED
                return
            }

            AppUser currentUser = springSecurityService.getCurrentUser()
            List<AppUser> filters = taskFilterUserRecencyService.retrieveUserFilterRecency(currentUser, params.matter_id as long)
            respond filters, [status: HttpStatus.OK]
        }
        catch (AccessDeniedException e) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def save() {
        try {
            AppUser user = springSecurityService.getCurrentUser()
            AppUser filterUser = userService.getUserById(params.user_id as long)
            if (user.organisation.id != filterUser.organisation.id) {
                render status: HttpStatus.FORBIDDEN
                return
            }
            taskFilterUserRecencyService.recordUserFilterRecency(user, filterUser, params.matter_id as long)
            render status: HttpStatus.OK
        }
        catch (AccessDeniedException e) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }
}
