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

package com.juralio.auth.exception

import org.springframework.security.core.AuthenticationException

class RoleUnknownException extends AuthenticationException {
    RoleUnknownException() {
        super("Role unknown")
    }
}

class BadSSOCredentialsException extends AuthenticationException {
    BadSSOCredentialsException(){
        super('Bad SSO Credentials')
    }
}

class SSOUserDoesNotExistException extends AuthenticationException {
    SSOUserDoesNotExistException(){
        super('SSO user does not exist')
    }
}


class RoleNotProvidedException extends AuthenticationException {
    RoleNotProvidedException() {
        super("Role not provided")
    }
}

class InvalidRoleRequestException extends AuthenticationException {
    InvalidRoleRequestException() {
        super("Invalid role request")
    }
}

class InsufficientRolePermissionsException extends AuthenticationException {
    InsufficientRolePermissionsException() {
        super("Insufficient role permissions for action")
    }
}

class ExternalUserRolesNotForced extends AuthenticationException {
    ExternalUserRolesNotForced() {
        super("External Users will cause roles to fall off")
    }
}

class OnlyOrganisationOwner extends AuthenticationException {
    OnlyOrganisationOwner() {
        super("User is the only organisation owner")
    }
}
class OrganisationOwnerMustBeAdmin extends AuthenticationException {
    OrganisationOwnerMustBeAdmin() {
        super("Org owner must be an admin")
    }
}

class MaxNumberOfOrganisationOwnersReached extends AuthenticationException {
    MaxNumberOfOrganisationOwnersReached() {
        super("Maximum number of organisation owners has already been reached")
    }
}


class UserHasNoOrganisationException extends AuthenticationException {
    UserHasNoOrganisationException() {
        super("User has no organisation")
    }
}

class UsersOrganisationIsDisabledException extends AuthenticationException {
    UsersOrganisationIsDisabledException() {
        super("User's organisation is disabled")
    }
}

class UsersOrganisationDoesNotAcceptAuthenticationProviderException extends AuthenticationException {
    UsersOrganisationDoesNotAcceptAuthenticationProviderException() {
        super("User's organisation does not accept this authentication type")
    }
}

class CannotDisableOwnAccountException extends AuthenticationException {
    CannotDisableOwnAccountException() {
        super("Cannot disable own account")
    }
}

class CannotLoginLapsedAccountException extends AuthenticationException {
    CannotLoginLapsedAccountException(String msg){
        super(msg)
    }
}

