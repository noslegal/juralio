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

package com.juralio.usernotification.resolvers

import com.juralio.auth.AppUser
import com.juralio.auth.UserService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAdmin
import com.juralio.matterevent.payload.AffectedMemberPayload
import com.juralio.matterevent.payload.MatterEventPayload
import com.juralio.usernotification.MatterEventRecipientResolver
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic

@CompileStatic
class MatterAdminAndAffectedMemberRecipientResolverService implements MatterEventRecipientResolver {

    UserService userService

    @CompileDynamic
    Set<AppUser> resolveRecipients(MatterEventPayload payload, AppUser performedBy, Matter matter) {
        Set<AppUser> recipients = [] as Set
        matter.matterAdmins?.each { MatterAdmin admin -> if (admin.user) recipients.add(admin.user) }
        AffectedMemberPayload p = payload as AffectedMemberPayload
        if (p.affectedMemberId) {
            AppUser affected = userService.getUserById(p.affectedMemberId)
            if (affected) recipients.add(affected)
        }
        if (!(payload.eventType in ['DeletedMatter', 'RestoredMatter'])) {
            recipients.removeAll { AppUser u -> u.id == performedBy.id }
        }
        return recipients
    }
}
