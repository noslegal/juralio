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

package com.juralio.user

import com.juralio.auth.AppUser
import com.juralio.auth.UserService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import grails.plugin.springsecurity.SpringSecurityService
import org.grails.web.json.JSONObject
import org.springframework.http.HttpStatus

class ThirdPartyUserController {
    static allowedMethods = [update: "PATCH"]
    UserService userService
    SpringSecurityService springSecurityService

    def update() {
        AppUser currentUser = springSecurityService.getCurrentUser()


        JSONObject mungedJson = new JSONObject()
        mungedJson.put('firstname', firstname)
        mungedJson.put('lastname', lastname)
        mungedJson.put('username', username)
        mungedJson.put('enabled', true)
        mungedJson.put('thirdPartyUserId', userId)
        mungedJson.put('password', "thirdPartyUser")
        mungedJson.put('isThirdPartyUser', true)

        def validatedBody = ParameterValidatorService.validate(mungedJson,
                ['firstname', 'lastname', 'username', 'thirdPartyUserId', 'isThirdPartyUser'], [])
        ValidatedParameterMap properties = new ValidatedParameterMap(mungedJson, [])
        respond userService.update(currentUser.id), [status: HttpStatus.OK]

    }
}
