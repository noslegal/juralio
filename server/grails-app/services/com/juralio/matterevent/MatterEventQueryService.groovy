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

package com.juralio.matterevent

import com.juralio.auth.AppUser
import grails.gorm.transactions.Transactional
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic

@CompileStatic
@Transactional(readOnly = true)
class MatterEventQueryService {

    static final int MAX_PAGE_SIZE = 50
    static final int DEFAULT_PAGE_SIZE = 20
    // Hard cap on CSV export so a huge matter can't OOM the request thread.
    static final int MAX_EXPORT_ROWS = 10000

    // Paginated, filtered slice of a matter's events (newest first). Returns
    // [items: List<MatterEvent>, nextCursor: String|null].
    @CompileDynamic
    Map search(Long matterId, MatterEventSearchFilter filter) {
        int pageSize = Math.min(filter.pageSize ?: DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)

        List<MatterEvent> rows = MatterEvent.withCriteria {
            eq('matter.id', matterId)
            createAlias('performedBy', 'pb')
            fetchMode('performedBy', org.hibernate.FetchMode.JOIN)
            if (filter.eventTypes) {
                'in'('eventType', filter.eventTypes)
            }
            if (filter.performedByIds) {
                'in'('pb.id', filter.performedByIds)
            }
            if (filter.fromDate) {
                ge('occurredAt', filter.fromDate)
            }
            if (filter.toDate) {
                le('occurredAt', filter.toDate)
            }
            if (filter.cursor) {
                or {
                    lt('occurredAt', filter.cursor.occurredAt)
                    and {
                        eq('occurredAt', filter.cursor.occurredAt)
                        lt('id', filter.cursor.id)
                    }
                }
            }
            order('occurredAt', 'desc')
            order('id', 'desc')
            maxResults(pageSize + 1)
        }

        boolean hasMore = rows.size() > pageSize
        if (hasMore) {
            rows = rows.take(pageSize)
        }
        String nextCursor = hasMore && rows ? encodeCursor(rows.last().occurredAt, rows.last().id) : null
        return [items: rows, nextCursor: nextCursor]
    }

    // Full filtered result set (no pagination) for CSV export.
    @CompileDynamic
    List<MatterEvent> findAllForExport(Long matterId, MatterEventSearchFilter filter) {
        return MatterEvent.withCriteria {
            eq('matter.id', matterId)
            createAlias('performedBy', 'pb')
            fetchMode('performedBy', org.hibernate.FetchMode.JOIN)
            if (filter.eventTypes) {
                'in'('eventType', filter.eventTypes)
            }
            if (filter.performedByIds) {
                'in'('pb.id', filter.performedByIds)
            }
            if (filter.fromDate) {
                ge('occurredAt', filter.fromDate)
            }
            if (filter.toDate) {
                le('occurredAt', filter.toDate)
            }
            order('occurredAt', 'desc')
            order('id', 'desc')
            maxResults(MAX_EXPORT_ROWS)
        } as List<MatterEvent>
    }

    // Distinct actors who have generated events on this matter, for the People filter dropdown.
    @CompileDynamic
    List<AppUser> availablePeople(Long matterId) {
        List<Long> userIds = MatterEvent.withCriteria {
            eq('matter.id', matterId)
            projections {
                distinct('performedBy.id')
            }
        } as List<Long>
        if (!userIds) {
            return []
        }
        return AppUser.withCriteria {
            'in'('id', userIds)
            order('firstname', 'asc')
            order('lastname', 'asc')
        } as List<AppUser>
    }

    static String encodeCursor(Date d, Long id) {
        return "${d.time}_${id}"
    }

    static MatterEventSearchFilter.Cursor decodeCursor(String s) {
        if (!s) return null
        String[] parts = s.split('_')
        if (parts.length != 2) return null
        try {
            return new MatterEventSearchFilter.Cursor(
                occurredAt: new Date(parts[0] as long),
                id: parts[1] as long
            )
        } catch (NumberFormatException ignored) {
            return null
        }
    }
}
