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

package com.juralio.organisationgroup

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.image.ImageService
import com.juralio.organisation.dao.OrganisationDAOService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.multipart.MultipartHttpServletRequest

@Secured('IS_AUTHENTICATED_FULLY')
class GroupLogoController {
    static allowedMethods = [getLogo: 'GET', setLogo: 'POST', deleteLogo: 'DELETE']

    OrganisationGroupService organisationGroupService
    OrganisationDAOService organisationDAOService
    UserRoleService userRoleService
    SpringSecurityService springSecurityService
    ImageService imageService

    private boolean isAuthorised(AppUser user, long org_id) {
        if (userRoleService.hasSysadminRole(user)) return true
        if (user.organisation.id != org_id) return false
        return userRoleService.hasOrgAdminRole(user) || userRoleService.hasOrgOwnerRole(user)
    }

    private boolean canViewLogo(AppUser user, long org_id) {
        if (userRoleService.hasSysadminRole(user)) return true
        return user.organisation.id == org_id
    }

    def getLogo(long org_id, long group_id) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        if (!canViewLogo(currentUser, org_id)) {
            render status: HttpStatus.FORBIDDEN
            return
        }

        OrganisationGroup group = organisationGroupService.getGroup(group_id)

        if (group == null || group.organisation.id != org_id) {
            render status: HttpStatus.BAD_REQUEST, text: "Bad Group"
            return
        }

        if (!group.logo) {
            render status: HttpStatus.BAD_REQUEST, text: "No Logo Set"
        } else {
            response.setContentType(group.logoMimeType ?: 'application/octet-stream')
            response.setContentLength(group.logo.length)
            response.setHeader('X-Content-Type-Options', 'nosniff')
            OutputStream out = response.getOutputStream()
            out.write(group.logo)
            out.close()
        }
    }

    def setLogo(long org_id, long group_id) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        if (!isAuthorised(currentUser, org_id)) {
            render status: HttpStatus.FORBIDDEN
            return
        }

        MultipartFile logo = request instanceof MultipartHttpServletRequest ? request.getFile("logo") : null
        if (logo == null || logo.empty) {
            render status: HttpStatus.BAD_REQUEST, text: "No file uploaded"
            return
        }

        String mimeType = imageService.validateImageAndGetMimeType(logo)
        if (!mimeType) {
            render status: HttpStatus.BAD_REQUEST, text: "Bad image type or file exceeds 200KB limit"
            return
        }

        OrganisationGroup group = organisationGroupService.getGroup(group_id)
        if (group == null || group.organisation.id != org_id) {
            render status: HttpStatus.BAD_REQUEST, text: "Bad Group"
            return
        }

        organisationGroupService.saveLogo(group_id, logo.bytes, mimeType)

        render status: HttpStatus.OK, text: "Successfully added logo"
    }

    def deleteLogo(long org_id, long group_id) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        if (!isAuthorised(currentUser, org_id)) {
            render status: HttpStatus.FORBIDDEN
            return
        }

        OrganisationGroup group = organisationGroupService.getGroup(group_id)
        if (group == null || group.organisation.id != org_id) {
            render status: HttpStatus.BAD_REQUEST, text: "Bad Group"
            return
        }

        organisationGroupService.removeLogo(group_id)
        render status: HttpStatus.OK, text: "Successfully deleted logo"
    }
}
