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
import grails.gorm.transactions.Transactional
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic
import org.springframework.security.access.AccessDeniedException

@CompileStatic
@Transactional
class UserNotificationService {

    @CompileDynamic
    void markRead(long id, AppUser currentUser) {
        UserNotification n = UserNotification.findByIdAndUser(id, currentUser)
        if (!n) {
            throw new AccessDeniedException('Unauthorised for UserNotification.')
        }
        n.read = true
        n.save(failOnError: true)
    }

    @CompileDynamic
    void markAllRead(AppUser currentUser) {
        UserNotification.executeUpdate(
            'update UserNotification n set n.read = true where n.user = :user and n.read = false and n.dismissed = false',
            [user: currentUser]
        )
    }

    @CompileDynamic
    void dismiss(long id, AppUser currentUser) {
        UserNotification n = UserNotification.findByIdAndUser(id, currentUser)
        if (!n) {
            throw new AccessDeniedException('Unauthorised for UserNotification.')
        }
        n.dismissed = true
        n.save(failOnError: true)
    }

    @CompileDynamic
    void deleteAllForUser(AppUser user) {
        UserNotification.executeUpdate(
            'delete from UserNotification n where n.user = :user',
            [user: user]
        )
    }
}
