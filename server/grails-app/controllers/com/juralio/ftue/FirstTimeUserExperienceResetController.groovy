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

package com.juralio.ftue

import com.juralio.auth.AppUser
import com.juralio.auth.UserAuthorisationService
import com.juralio.auth.UserService
import com.juralio.auth.exception.UserDoesNotExistException
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['ROLE_USER'])
class FirstTimeUserExperienceResetController {
    static allowedMethods = [reset: "POST"]

    FirstTimeUserExperienceService firstTimeUserExperienceService
    UserAuthorisationService userAuthorisationService
    UserService userService

    @Secured("hasRole('ROLE_SYSADMIN') or hasRole('ROLE_ORG_ADMIN') or hasRole('ROLE_USER')")
    def reset(long userId) {
        try {
            AppUser user = userService.getUserById(userId)
            firstTimeUserExperienceService.resetTutorialProgress(user)
            respond [:], status: HttpStatus.OK
        } catch (UserDoesNotExistException exception) {
            return  response.setStatus(HttpStatus.FORBIDDEN.value())
        }
    }
}
