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

package com.juralio.auth.password

import com.juralio.auth.AppUser
import com.juralio.auth.UserService
import com.juralio.common.APIErrorCodes
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import grails.converters.JSON
import grails.plugin.springsecurity.SpringSecurityService
import org.grails.web.json.JSONObject
import org.springframework.http.HttpStatus

class MagicLinkController {
    static allowedMethods = [decodeMagicLink: "POST"]

    MagicLinkService magicLinkService
    UserService userService

    def decodeMagicLink() {
        JSONObject magicLinkObject
        try {
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON as Map, ['magicLink'], [])
            String decodedMagicLink = magicLinkService.decryptMagicLink(validatedBody.getProperty('magicLink').replaceAll(' ', '+'))
            magicLinkObject = JSON.parse(decodedMagicLink) as JSONObject
        }
        catch (Exception ignored) {
            magicLinkObject = request.JSON as JSONObject
        }
        if (magicLinkService.magicLinkAlreadyUsed(magicLinkObject)) {
            render status: APIErrorCodes.MAGIC_LINK_ALREADY_USED, text: ''
            return
        }
        try {
            if (magicLinkObject.get('expiry') < new Date().getTime()) {
                render status: APIErrorCodes.MAGIC_LINK_EXPIRED, text: magicLinkObject.get('context')
            } else {
                userService.magicLinkUnlockUser(magicLinkObject.get('username') as String)

                respond magicLinkObject, status: HttpStatus.OK
            }
        } catch (Exception ignored) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }

    }
}
