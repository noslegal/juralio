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

package com.juralio.project.exception

import com.juralio.matter.exception.CannotAddUserNotInOrganisationException
import org.springframework.security.access.AccessDeniedException

class PrivateWorkstreamMemberException extends Exception {
    @Override
    public synchronized Throwable fillInStackTrace() {
        return this;
    }
    PrivateWorkstreamMemberException(String message) {
        super(message)
    }
}

class CannotAddInactiveUserException extends PrivateWorkstreamMemberException {
    CannotAddInactiveUserException() {
        super("Cannot add an inactive user")
    }
}

class CannotAddMemberException extends PrivateWorkstreamMemberException {
    CannotAddMemberException(String message) {
        super(message)
    }
}

class InvalidUserException extends PrivateWorkstreamMemberException {
    InvalidUserException(String message) {
        super(message)
    }
}

class CannotAddUserNotInOrganisationException extends PrivateWorkstreamMemberException {
    CannotAddUserNotInOrganisationException(String message) {
        super(message)
    }
}

