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

package com.juralio.auth.provider

import com.juralio.auth.AppUser
import com.juralio.auth.exception.CannotLoginLapsedAccountException
import com.juralio.auth.token.UserAuthenticationToken
import com.juralio.organisation.Organisation
import com.juralio.organisation.dao.OrganisationDAOService
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.userdetails.UserDetails
import grails.gorm.transactions.Transactional
import  org.hibernate.Hibernate
import org.hibernate.proxy.HibernateProxy


@Transactional
class UserAuthenticationProvider implements AuthenticationProvider {
    def userDetailsService, userService, mfaAuthenticationService, daoAuthenticationProvider, userOrganisationAuthenticationService, userSessionEventService, errorResponseHelperService, organisationDAOService, organisationAdminMessageService
    @Override
    Authentication authenticate(Authentication authentication) throws AuthenticationException {
        def authenticationResult = daoAuthenticationProvider.authenticate(authentication)
        UserDetails userDetails = userDetailsService.loadUserByUsername(authentication.principal, false)
        AppUser authenticatedUser = userService.findByUsername(userDetails.getUsername(), [:])
        AppUser  fullUser = userService.getUserById(userDetails.id)
        if(authenticatedUser.isThirdPartyUser){
            return null
        }else if(authenticatedUser.confirmationStatus == 'lapsed') {
            Organisation userOrg = organisationDAOService.getOrganisation(fullUser.getOrganisationId())
            throw new CannotLoginLapsedAccountException(userOrg.lapsedLoginMessage)
            return null
        }

        userOrganisationAuthenticationService.authenticate(authenticatedUser)

        UserAuthenticationToken authToken = authentication as UserAuthenticationToken
        mfaAuthenticationService.authenticate(authenticatedUser, authToken)


        if (authenticationResult?.authenticated) {
            organisationAdminMessageService.sendFreeTrialReminderEmail(fullUser)
            if(authenticatedUser.oneTimePasswordReset != null){
                authenticatedUser.oneTimePasswordReset = null
                authenticatedUser.save(flush:true)
            }
            userSessionEventService.recordLoginSuccess(authenticatedUser.id, authenticationResult.details.getRemoteAddress())
        }

        return authenticationResult
    }

    @Override
    boolean supports(Class<?> aClass) {
        return aClass.isAssignableFrom(UserAuthenticationToken.class)
    }
}