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
import com.juralio.matter.Matter
import com.juralio.matterevent.MatterEvent
import com.juralio.matterevent.MatterEventDescriptor
import com.juralio.matterevent.MatterEventRegistryService
import com.juralio.matterevent.payload.MatterEventPayload
import grails.core.GrailsApplication
import grails.gorm.transactions.Transactional
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic
import org.springframework.transaction.annotation.Propagation

@CompileStatic
@Transactional
class NotificationFanOutService {

    MatterEventRegistryService matterEventRegistryService
    NotificationPreferenceService notificationPreferenceService
    GrailsApplication grailsApplication

    @CompileDynamic
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    void fanOut(Long eventId, MatterEventPayload payload, Long performedById, Long matterId) {
        MatterEvent event = MatterEvent.get(eventId)
        AppUser performedBy = AppUser.get(performedById)
        Matter matter = Matter.get(matterId)
        if (!event || !performedBy || !matter) {
            log.warn("Missing event/performedBy/matter for MatterEvent ${eventId} — skipping fan-out")
            return
        }
        if (payload.suppressesUserNotifications()) {
            return
        }
        MatterEventDescriptor descriptor = matterEventRegistryService.lookup(event.eventType)
        String beanName = descriptor.recipientResolverBeanName
        if (!beanName) {
            log.warn("No recipient resolver bean for event type '${event.eventType}' — skipping fan-out")
            return
        }
        MatterEventRecipientResolver resolver = grailsApplication.mainContext.getBean(beanName, MatterEventRecipientResolver)
        Set<AppUser> recipients = resolver.resolveRecipients(payload, performedBy, matter)
        if (!recipients) return
        Set<AppUser> subscribed = notificationPreferenceService.filterToSubscribed(
            recipients, event.eventType, descriptor.defaultOptOut
        )
        if (!subscribed) return
        subscribed.each { AppUser user ->
            if (!user.enabled) return
            new UserNotification(user: user, matterEvent: event).save(failOnError: true)
        }
    }
}
