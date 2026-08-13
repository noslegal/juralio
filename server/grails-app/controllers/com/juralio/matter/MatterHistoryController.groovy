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
import com.juralio.matterevent.MatterEvent
import com.juralio.matterevent.MatterEventQueryService
import com.juralio.matterevent.MatterEventRegistryService
import com.juralio.matterevent.MatterEventSearchFilter
import grails.converters.JSON
import grails.plugin.springsecurity.annotation.Secured
import groovy.json.JsonSlurper
import org.springframework.http.HttpStatus

import java.text.SimpleDateFormat

@Secured(['IS_AUTHENTICATED_FULLY'])
class MatterHistoryController {

    static allowedMethods = [index: 'GET', filters: 'GET', export: 'GET']

    MatterEventQueryService matterEventQueryService
    MatterEventRegistryService matterEventRegistryService
    MatterAuthorisationService matterAuthorisationService

    // Reverse lookup so the CSV / filters can label each event with its category.
    private static final Map<String, String> EVENT_TYPE_TO_CATEGORY = buildEventTypeToCategory()

    private static Map<String, String> buildEventTypeToCategory() {
        Map<String, String> reverse = [:]
        MatterEventRegistryService.CATEGORY_TO_EVENT_TYPES.each { String category, List<String> types ->
            types.each { String type -> reverse[type] = category }
        }
        return reverse
    }

    def index() {
        Long matterId = params.long('matter_id')
        if (!isMatterAdmin(matterId)) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        MatterEventSearchFilter filter = buildFilter(matterId)
        Map result = matterEventQueryService.search(matterId, filter)
        render(
            view: '/matterEvent/_matterEventList',
            model: [events: result.items, nextCursor: result.nextCursor]
        )
    }

    def filters() {
        Long matterId = params.long('matter_id')
        if (!isMatterAdmin(matterId)) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        List people = matterEventQueryService.availablePeople(matterId).collect { AppUser user ->
            [id: user.id, firstName: user.firstname, lastName: user.lastname]
        }
        render([categories: matterEventRegistryService.categories(), people: people] as JSON)
    }

    def export() {
        Long matterId = params.long('matter_id')
        if (!isMatterAdmin(matterId)) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        MatterEventSearchFilter filter = buildFilter(matterId)
        List<MatterEvent> events = matterEventQueryService.findAllForExport(matterId, filter)

        response.contentType = 'text/csv'
        response.characterEncoding = 'UTF-8'
        response.setHeader('Content-Disposition', "attachment; filename=\"matter-${matterId}-history.csv\"")
        response.writer.write(buildCsv(events))
        response.writer.flush()
    }

    private boolean isMatterAdmin(Long matterId) {
        return matterId != null && matterAuthorisationService.hasAdminAccess(matterId)
    }

    private MatterEventSearchFilter buildFilter(Long matterId) {
        List<String> categories = params.list('categories') as List<String>
        return new MatterEventSearchFilter(
            cursor: MatterEventQueryService.decodeCursor(params.cursor as String),
            pageSize: parsePositiveInt(params.pageSize as String),
            eventTypes: matterEventRegistryService.categoriesToEventTypes(categories),
            performedByIds: params.list('performedByIds').findResults { parseLong(it as String) },
            fromDate: parseEpochDate(params.fromDate as String),
            toDate: parseEpochDate(params.toDate as String)
        )
    }

    private static Integer parsePositiveInt(String value) {
        if (!value) return null
        try {
            int parsed = Integer.parseInt(value)
            return parsed > 0 ? parsed : null
        } catch (NumberFormatException ignored) {
            return null
        }
    }

    private static Long parseLong(String value) {
        if (!value) return null
        try {
            return Long.parseLong(value)
        } catch (NumberFormatException ignored) {
            return null
        }
    }

    private static Date parseEpochDate(String value) {
        if (!value) return null
        try {
            return new Date(Long.parseLong(value))
        } catch (NumberFormatException ignored) {
            return null
        }
    }

    private static String buildCsv(List<MatterEvent> events) {
        JsonSlurper slurper = new JsonSlurper()
        SimpleDateFormat dateFormat = new SimpleDateFormat('yyyy-MM-dd HH:mm:ss')
        StringBuilder sb = new StringBuilder()
        List<String> headers = ['Date/time', 'Actor', 'Category', 'Event type',
                                'Workstream', 'Task reference', 'Task name', 'Details']
        sb.append(headers.collect { csvCell(it) }.join(',')).append('\r\n')

        events.each { MatterEvent event ->
            Map payload = event.payload ? (slurper.parseText(event.payload) as Map) : [:]
            AppUser actor = event.performedBy
            String actorName = actor ? "${actor.firstname ?: ''} ${actor.lastname ?: ''}".trim() : ''
            List<String> row = [
                event.occurredAt ? dateFormat.format(event.occurredAt) : '',
                actorName,
                EVENT_TYPE_TO_CATEGORY[event.eventType] ?: '',
                event.eventType,
                payload.projectName ?: '',
                payload.taskReferenceNumber ?: '',
                payload.taskName ?: '',
                detailsFor(payload)
            ].collect { csvCell(it as String) }
            sb.append(row.join(',')).append('\r\n')
        }
        return sb.toString()
    }

    // Compact, human-oriented detail string pulled from the common payload fields.
    private static String detailsFor(Map payload) {
        List<String> parts = []
        if (payload.previousTaskStatus) {
            parts << "status: ${payload.previousTaskStatus} → ${payload.taskStatus ?: '—'}"
        }
        if (payload.postName) {
            parts << "note: ${payload.postName}"
        }
        if (payload.affectedMemberFirstName || payload.affectedMemberLastName) {
            parts << "member: ${(payload.affectedMemberFirstName ?: '')} ${(payload.affectedMemberLastName ?: '')}".trim()
        }
        if (payload.matterName) {
            parts << "matter: ${payload.matterName}"
        }
        return parts.join('; ')
    }

    private static String csvCell(String value) {
        String v = value ?: ''
        // Neutralise CSV/formula injection (CWE-1236): a leading =, +, -, @, tab or
        // carriage return can be executed as a formula when the CSV is opened in
        // Excel/Sheets. Prefix such cells with a single quote before quoting.
        if (v && (v[0] in ['=', '+', '-', '@', '\t', '\r'])) {
            v = "'" + v
        }
        if (v.contains(',') || v.contains('"') || v.contains('\n') || v.contains('\r')) {
            return '"' + v.replace('"', '""') + '"'
        }
        return v
    }
}
