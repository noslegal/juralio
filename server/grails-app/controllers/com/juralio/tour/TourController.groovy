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

package com.juralio.tour

import com.juralio.auth.AppUser
import com.juralio.auth.UserAuthorisationService
import com.juralio.auth.UserRoleService
import com.juralio.auth.UserService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import groovy.transform.CompileStatic
import org.springframework.http.HttpStatus

@CompileStatic
@Secured('IS_AUTHENTICATED_FULLY')
class TourController {
    static allowedMethods = [complete: "POST", index: "GET", reset: "GET"]
    TourService tourService
    SpringSecurityService springSecurityService
    UserService userService
    UserAuthorisationService userAuthorisationService
    UserRoleService userRoleService

    def index() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        Tour userTour = tourService.getTours(currentUser)
        respond userTour, [status: HttpStatus.OK, view: '/tour/_tour']
    }

    def complete() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        String tour = request.JSON['tourName'] as String
        try {
            Tour userTour = tourService.completeTour(currentUser, tour)
            respond userTour, [status: HttpStatus.OK, view: '/tour/_tour']
        } catch (Exception ignored) {
            tour = tourService.getTours(currentUser)
            respond tour, [status: HttpStatus.OK, view: '/tour/_tour']
        }
    }

    @Secured("hasRole('ROLE_SYSADMIN') or hasRole('ROLE_ORG_ADMIN') or hasRole('ROLE_USER')")
    def reset(long userId) {
        if (!userAuthorisationService.hasMutateUserAccess(userId)) {
            throw new Exception()
        }
        AppUser resetUser = userService.getUserById(userId as long)
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        //not a sysadmin, not an org owner and you're not resetting youself
        if(!isSysadmin && !userRoleService.hasOrgAdminRole(currentUser) && currentUser.id !=  resetUser.id) {
            respond( status: HttpStatus.FORBIDDEN)
            return
        }

        if (resetUser != null && (isSysadmin || resetUser.organisation.id == currentUser.organisation.id)) {
            Tour userTour = tourService.getTours(resetUser)
            userTour?.delete()
            userTour = tourService.getTours(resetUser)
            respond userTour, [status: HttpStatus.OK, view: '/tour/_tour']
            return
        }

        respond(status: HttpStatus.FORBIDDEN)
    }
}
