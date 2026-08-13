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

package com.juralio.organisation

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.image.ImageService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.multipart.MultipartHttpServletRequest
import software.amazon.awssdk.core.exception.SdkException

@Secured('IS_AUTHENTICATED_FULLY')
class OrganisationLogoController {
    static allowedMethods = [getLogo: 'GET', setLogo: 'POST', deleteLogo: 'DELETE']

    SysAdminOrganisationService sysAdminOrganisationService
    UserRoleService userRoleService
    SpringSecurityService springSecurityService
    ImageService imageService

    def getLogo(long organisationId) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        if (!userRoleService.hasSysadminRole(currentUser) && currentUser.organisation.id != organisationId) {
            render status: HttpStatus.BAD_REQUEST, text: "You can only fetch your own organisations logo"
            return
        }

        Organisation organisation = sysAdminOrganisationService.get(organisationId)

        if (organisation == null) {
            render status: HttpStatus.BAD_REQUEST, text: "Bad Org"
            return
        }

        if (!organisation.logo) {
            render status: HttpStatus.BAD_REQUEST, text: "No Logo Set"
        } else {
            response.setContentType(organisation.logoMimeType ?: 'application/octet-stream')
            response.setContentLength(organisation.logo.length)
            response.setHeader('X-Content-Type-Options', 'nosniff')
            OutputStream out = response.getOutputStream()
            out.write(organisation.logo)
            out.close()
        }
    }

    @Secured("hasRole('ROLE_SYSADMIN')")
    def setLogo(long organisationId) {
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

        sysAdminOrganisationService.saveLogo(organisationId, logo.bytes, mimeType)

        render status: HttpStatus.OK, text: "Successfully added logo"
    }

    @Secured("hasRole('ROLE_SYSADMIN')")
    def deleteLogo(long organisationId) {
        sysAdminOrganisationService.removeLogo(organisationId)
        render status: HttpStatus.OK, text: "Successfully deleted logo"
    }
}
