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

package com.juralio.usernotification

import com.juralio.auth.AppUser
import com.juralio.matterevent.MatterEvent

class UserNotification {

    AppUser user
    MatterEvent matterEvent
    boolean read = false
    boolean dismissed = false
    Date dateCreated

    static belongsTo = [user: AppUser, matterEvent: MatterEvent]

    static constraints = {
        user nullable: false
        matterEvent nullable: false, unique: 'user'
    }

    static mapping = {
        matterEvent lazy: false
    }
}
