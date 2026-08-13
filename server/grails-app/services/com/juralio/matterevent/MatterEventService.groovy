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

import com.fasterxml.jackson.databind.ObjectMapper
import com.juralio.auth.AppUser
import com.juralio.matter.Matter
import com.juralio.matterevent.payload.MatterEventPayload
import com.juralio.usernotification.NotificationFanOutService
import grails.gorm.transactions.Transactional
import groovy.util.logging.Slf4j
import org.springframework.transaction.support.TransactionSynchronization
import org.springframework.transaction.support.TransactionSynchronizationManager

@Slf4j
@Transactional
class MatterEventService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()

    MatterEventRegistryService matterEventRegistryService
    NotificationFanOutService notificationFanOutService

    MatterEvent publish(MatterEventPayload payload, AppUser performedBy, Matter matter, String correlationId = null) {
        matterEventRegistryService.lookup(payload.eventType)
        String json = OBJECT_MAPPER.writeValueAsString(payload)
        MatterEvent event = new MatterEvent(
            eventType: payload.eventType,
            schemaVersion: payload.schemaVersion,
            matter: matter,
            performedBy: performedBy,
            occurredAt: new Date(),
            payload: json,
            correlationId: correlationId
        )
        event.save(failOnError: true)
        // Fan-out is a secondary concern: defer it until AFTER the caller's
        // transaction commits so a notification failure can never roll back the
        // primary action (task create, post, membership change, etc.). Re-fetched
        // by id in a fresh transaction, so the now-committed MatterEvent satisfies
        // the UserNotification FK.
        scheduleFanOut(event.id, payload, performedBy.id, matter.id)
        return event
    }

    private void scheduleFanOut(Long eventId, MatterEventPayload payload, Long performedById, Long matterId) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                void afterCommit() {
                    runFanOut(eventId, payload, performedById, matterId)
                }
            })
        } else {
            // No active transaction synchronisation — fan out inline.
            runFanOut(eventId, payload, performedById, matterId)
        }
    }

    private void runFanOut(Long eventId, MatterEventPayload payload, Long performedById, Long matterId) {
        try {
            notificationFanOutService.fanOut(eventId, payload, performedById, matterId)
        } catch (Exception e) {
            log.error(
                "Notification fan-out failed for MatterEvent ${eventId} (${payload.eventType}); " +
                    'event persisted, notifications skipped.',
                e
            )
        }
    }
}
