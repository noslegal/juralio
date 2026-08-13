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
import com.juralio.auth.UserRoleService
import com.juralio.auth.UserService
import com.juralio.auth.exception.CannotResetPasswordMoreThanOnceInMinute
import com.juralio.auth.password.TemporaryPasswordService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.instance.InstanceSettings
import com.juralio.instance.InstanceSettingsService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['permitAll'])
class ForgotPasswordController {
    static allowedMethods = [forgotPassword: "POST"]
    UserService userService
    InstanceSettingsService instanceSettingsService
    TemporaryPasswordService temporaryPasswordService
    UserRoleService userRoleService

    def forgotPassword() {
        try {
            ValidatedParameterMap validatedParams = ParameterValidatorService.validate(request.JSON, ['username'], [])
            InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
            if (instanceSettings.enableForgotMyPassword) {
                String username = request.JSON.get('username')
                AppUser foundUser = userService.findByUsername(username, [:])
                if (foundUser && !foundUser.isThirdPartyUser && !userRoleService.hasSysadminRole(foundUser)) {
                    temporaryPasswordService.resetPasswordTimer(foundUser.id)
                    userService.forgotPasswordReset(foundUser)
                }
            }
            respond [:], status: HttpStatus.OK
        } catch (CannotResetPasswordMoreThanOnceInMinute e) {
            respond [:], status: HttpStatus.OK
        }

    }
}
