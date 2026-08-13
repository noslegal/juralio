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

package com.juralio.matter

import com.juralio.auth.AppUser
import com.juralio.organisation.Organisation

class Placeholders {

    String firstName
    String lastName
    String emailAddress
    Organisation organisation
    Matter matter
    Boolean enabled = true
    boolean isOnAllSubtasks = false
    boolean isOnSomeSubtasks = false

    static transients = ['taskCount','postCount','isOnAllSubtasks','isOnSomeSubtasks']
    int taskCount = 0
    int postCount = 0

    static belongsTo = [matter: Matter,]

    static constraints = {
        firstName length: 35, nullable: true, blank: true
        lastName length: 35, nullable: true, blank: true
        emailAddress nullable: true, blank: true, email: true
        organisation nullable: true
        matter nullable: false, blank: false, unique: false
        enabled nullable: false
    }
}
