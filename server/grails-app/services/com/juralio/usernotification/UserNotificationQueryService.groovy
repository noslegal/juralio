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

@CompileStatic
@Transactional(readOnly = true)
class UserNotificationQueryService {

    static final int MAX_PAGE_SIZE = 50
    static final int DEFAULT_PAGE_SIZE = 20

    @CompileDynamic
    Map search(AppUser currentUser, UserNotificationSearchFilter filter) {
        int pageSize = Math.min(filter.pageSize ?: DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)

        List<UserNotification> rows = UserNotification.withCriteria {
            eq('user', currentUser)
            eq('dismissed', false)
            if (filter.unreadOnly) {
                eq('read', false)
            }
            createAlias('matterEvent', 'me')
            if (filter.matterId) {
                eq('me.matter.id', filter.matterId)
            }
            if (filter.eventType) {
                eq('me.eventType', filter.eventType)
            }
            if (filter.cursor) {
                or {
                    lt('dateCreated', filter.cursor.dateCreated)
                    and {
                        eq('dateCreated', filter.cursor.dateCreated)
                        lt('id', filter.cursor.id)
                    }
                }
            }
            order('dateCreated', 'desc')
            order('id', 'desc')
            maxResults(pageSize + 1)
            fetchMode('matterEvent', org.hibernate.FetchMode.JOIN)
        }

        boolean hasMore = rows.size() > pageSize
        if (hasMore) {
            rows = rows.take(pageSize)
        }
        String nextCursor = hasMore && rows ? encodeCursor(rows.last().dateCreated, rows.last().id) : null
        return [items: rows, nextCursor: nextCursor]
    }

    @CompileDynamic
    int countUnread(AppUser currentUser) {
        return UserNotification.createCriteria().count {
            eq('user', currentUser)
            eq('read', false)
            eq('dismissed', false)
        } as int
    }

    static String encodeCursor(Date d, Long id) {
        return "${d.time}_${id}"
    }

    static UserNotificationSearchFilter.Cursor decodeCursor(String s) {
        if (!s) return null
        String[] parts = s.split('_')
        if (parts.length != 2) return null
        try {
            return new UserNotificationSearchFilter.Cursor(
                dateCreated: new Date(parts[0] as long),
                id: parts[1] as long
            )
        } catch (NumberFormatException ignored) {
            return null
        }
    }
}
