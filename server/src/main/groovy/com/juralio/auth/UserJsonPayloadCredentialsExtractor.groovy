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

package com.juralio.auth

import com.juralio.auth.token.UserAuthenticationToken
import grails.plugin.springsecurity.rest.credentials.AbstractJsonPayloadCredentialsExtractor
import groovy.util.logging.Slf4j
import jakarta.servlet.http.HttpServletRequest

@Slf4j

class UserJsonPayloadCredentialsExtractor extends AbstractJsonPayloadCredentialsExtractor {


    UserAuthenticationToken extractCredentials(HttpServletRequest httpServletRequest) {

        def jsonBody = getJsonBody(httpServletRequest)

        if (jsonBody) {

            String username = jsonBody.username

            String password = jsonBody.password

            String microsoftAccessToken = jsonBody.accessToken

            if(microsoftAccessToken){

                //TODO check this is still needed

                username = jsonBody.account.get('username')

                return new UserAuthenticationToken(username, microsoftAccessToken)

            }


            boolean isMfaTokenPropertyPresent = jsonBody.containsKey('mfaToken')

            Integer mfaToken = jsonBody.mfaToken as Integer


            log.debug "Extracted credentials from JSON payload. Username: ${username}, password: ${password?.size() ? '[PROTECTED]' : '[MISSING]'}, isMfaTokenPropertyPresent: ${isMfaTokenPropertyPresent}, mfaToken: ${mfaToken}"


            return new UserAuthenticationToken(username, password, isMfaTokenPropertyPresent, mfaToken)

        } else {

            log.debug "No JSON body sent in the request"

            return null

        }

    }

}