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

package com.juralio.label

import com.juralio.auth.AppUser
import com.juralio.matter.Matter
import com.juralio.organisation.Organisation
import grails.plugins.orm.auditable.Auditable

// if a label has neither an orgId or a matterId, its a system wide one
// if it has an orgId its an org level one
// if it has an orgId and a matterId, its a matter level Id
class Label implements Auditable {
    String name
    Matter matter
    Organisation organisation
    AppUser creator
    String type
    Date dateCreated
    Date lastUpdated


    static transients = ['inactive', 'usageCount', 'inactiveBy', 'inactiveSince']
    Boolean inactive
    int usageCount
    String inactiveBy
    Date inactiveSince

    static belongsTo = [matter: Matter, organisation: Organisation]


    static constraints = {
        name nullable: false, blank: false, size: 1..20//todo check its 20chars
        organisation nullable: true
        matter nullable: true
        creator nullable: true
        dateCreated bindable: false
        lastUpdated bindable: false


        type validator: { type, label ->
            if (type == LabelTypes.USER_DEFINED.value()) {
                return label.matterId != null
            }
            return LabelTypes.getAllValues().contains(type)
        }
    }
}
