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

package com.juralio.matter.exception

class MatterAdminException extends Exception {
    @Override
    public synchronized Throwable fillInStackTrace() {
        return this;
    }
    MatterAdminException(String message) {
        super(message)
    }
}

class CannotAddInvalidMatterAdminException extends MatterAdminException {
    CannotAddInvalidMatterAdminException() {
        super("Cannot add matter admin due to invalid matter or user")
    }
}

class CannotAddInvalidMatterCostsException extends MatterAdminException {
    CannotAddInvalidMatterCostsException() {
        super("Cannot add matter costs due to invalid matter or user")
    }
}

class CannotAddSysAdminAsMatterAdmin extends MatterAdminException {
    CannotAddSysAdminAsMatterAdmin() {
        super("Cannot add a system administrator as a matter admin")
    }
}

class CannotAddSysAdminAsMatterCosts extends MatterAdminException {
    CannotAddSysAdminAsMatterCosts() {
        super("Cannot add a system administrator as a matter costs")
    }
}

class CannotAddInactiveUserException extends MatterAdminException {
    CannotAddInactiveUserException() {
        super("Cannot add an inactive user")
    }
}

class CannotAddUserNotInOrganisationException extends MatterAdminException {
    CannotAddUserNotInOrganisationException() {
        super("Cannot add user not in the organisation")
    }
}

class CannotRemoveLastMatterAdminException extends MatterAdminException {
    CannotRemoveLastMatterAdminException() {
        super("Cannot remove the last matter admin from a matter")
    }
}

class CannotRemoveCurrentlyLoggedInUserException extends MatterAdminException {
    CannotRemoveCurrentlyLoggedInUserException() {
        super("Cannot remove the currently logged in user")
    }
}

class CannotRemoveTeamMemberException extends MatterAdminException {
    CannotRemoveTeamMemberException(String message) {
        super(message)
    }
}

class CannotRemoveMatterViewerException extends MatterAdminException {
    CannotRemoveMatterViewerException(String message) {
        super(message)
    }
}

class CannotChangeNameException extends MatterAdminException {
    CannotChangeNameException(String message) {
        super(message)
    }
}
