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

import com.juralio.matterevent.payload.AddedToMatterPayload
import com.juralio.matterevent.payload.AddedToTaskTeamPayload
import com.juralio.matterevent.payload.DeletedMatterPayload
import com.juralio.matterevent.payload.MarkedAsNotRequiredPayload
import com.juralio.matterevent.payload.PostCreatedPayload
import com.juralio.matterevent.payload.PostMarkedFinalPayload
import com.juralio.matterevent.payload.RemovedFromMatterPayload
import com.juralio.matterevent.payload.RemovedFromTaskTeamPayload
import com.juralio.matterevent.payload.RestoredMatterPayload
import com.juralio.matterevent.payload.TaskCreatedPayload
import com.juralio.matterevent.payload.TaskDateUpdatedPayload
import com.juralio.matterevent.payload.TaskMovedLevelAPayload
import com.juralio.matterevent.payload.TaskMovedNewParentPayload
import com.juralio.matterevent.payload.TaskMovedNewProjectPayload
import com.juralio.matterevent.payload.TaskStatusChangedPayload

class MatterEventRegistryService {

    private static final String TASK_TEAM = 'taskTeamRecipientResolverService'
    private static final String AFFECTED_MEMBER = 'affectedMemberRecipientResolverService'
    private static final String MATTER_ADMINS_AND_AFFECTED = 'matterAdminAndAffectedMemberRecipientResolverService'

    // High-level categories surfaced in the Matter History event filter. Each maps to the
    // underlying MatterEvent types. Keep in sync with the frontend matter-history category constant.
    static final Map<String, List<String>> CATEGORY_TO_EVENT_TYPES = [
        'Tasks' : [
            'TaskCreated', 'TaskStatusChanged', 'TaskDateUpdated', 'TaskMovedNewParent',
            'TaskMovedNewProject', 'TaskMovedLevelA', 'MarkedAsNotRequired'
        ],
        'Notes' : ['PostCreated', 'PostMarkedFinal'],
        'Team'  : ['AddedToTaskTeam', 'RemovedFromTaskTeam', 'AddedToMatter', 'RemovedFromMatter'],
        'Matter': ['DeletedMatter', 'RestoredMatter']
    ].asImmutable()

    private final Map<String, MatterEventDescriptor> descriptorsByType = [
        'TaskCreated': new MatterEventDescriptor(
            eventType: 'TaskCreated',
            payloadClass: TaskCreatedPayload,
            i18nKey: 'matterEvent.taskCreated',
            recipientResolverBeanName: TASK_TEAM,
            defaultOptOut: false
        ),
        'TaskStatusChanged': new MatterEventDescriptor(
            eventType: 'TaskStatusChanged',
            payloadClass: TaskStatusChangedPayload,
            i18nKey: 'matterEvent.taskStatusChanged',
            recipientResolverBeanName: TASK_TEAM,
            defaultOptOut: false
        ),
        'PostCreated': new MatterEventDescriptor(
            eventType: 'PostCreated',
            payloadClass: PostCreatedPayload,
            i18nKey: 'matterEvent.postCreated',
            recipientResolverBeanName: TASK_TEAM,
            defaultOptOut: false
        ),
        'PostMarkedFinal': new MatterEventDescriptor(
            eventType: 'PostMarkedFinal',
            payloadClass: PostMarkedFinalPayload,
            i18nKey: 'matterEvent.postMarkedFinal',
            recipientResolverBeanName: TASK_TEAM,
            defaultOptOut: false
        ),
        'TaskDateUpdated': new MatterEventDescriptor(
            eventType: 'TaskDateUpdated',
            payloadClass: TaskDateUpdatedPayload,
            i18nKey: 'matterEvent.taskDateUpdated',
            recipientResolverBeanName: TASK_TEAM,
            defaultOptOut: false
        ),
        'TaskMovedNewParent': new MatterEventDescriptor(
            eventType: 'TaskMovedNewParent',
            payloadClass: TaskMovedNewParentPayload,
            i18nKey: 'matterEvent.taskMovedNewParent',
            recipientResolverBeanName: TASK_TEAM,
            defaultOptOut: false
        ),
        'TaskMovedNewProject': new MatterEventDescriptor(
            eventType: 'TaskMovedNewProject',
            payloadClass: TaskMovedNewProjectPayload,
            i18nKey: 'matterEvent.taskMovedNewProject',
            recipientResolverBeanName: TASK_TEAM,
            defaultOptOut: false
        ),
        'TaskMovedLevelA': new MatterEventDescriptor(
            eventType: 'TaskMovedLevelA',
            payloadClass: TaskMovedLevelAPayload,
            i18nKey: 'matterEvent.taskMovedLevelA',
            recipientResolverBeanName: TASK_TEAM,
            defaultOptOut: false
        ),
        'MarkedAsNotRequired': new MatterEventDescriptor(
            eventType: 'MarkedAsNotRequired',
            payloadClass: MarkedAsNotRequiredPayload,
            i18nKey: 'matterEvent.markedAsNotRequired',
            recipientResolverBeanName: TASK_TEAM,
            defaultOptOut: false
        ),
        'AddedToTaskTeam': new MatterEventDescriptor(
            eventType: 'AddedToTaskTeam',
            payloadClass: AddedToTaskTeamPayload,
            i18nKey: 'matterEvent.addedToTaskTeam',
            recipientResolverBeanName: AFFECTED_MEMBER,
            defaultOptOut: false
        ),
        'RemovedFromTaskTeam': new MatterEventDescriptor(
            eventType: 'RemovedFromTaskTeam',
            payloadClass: RemovedFromTaskTeamPayload,
            i18nKey: 'matterEvent.removedFromTaskTeam',
            recipientResolverBeanName: AFFECTED_MEMBER,
            defaultOptOut: false
        ),
        'AddedToMatter': new MatterEventDescriptor(
            eventType: 'AddedToMatter',
            payloadClass: AddedToMatterPayload,
            i18nKey: 'matterEvent.addedToMatter',
            recipientResolverBeanName: MATTER_ADMINS_AND_AFFECTED,
            defaultOptOut: false
        ),
        'RemovedFromMatter': new MatterEventDescriptor(
            eventType: 'RemovedFromMatter',
            payloadClass: RemovedFromMatterPayload,
            i18nKey: 'matterEvent.removedFromMatter',
            recipientResolverBeanName: AFFECTED_MEMBER,
            defaultOptOut: false
        ),
        'DeletedMatter': new MatterEventDescriptor(
            eventType: 'DeletedMatter',
            payloadClass: DeletedMatterPayload,
            i18nKey: 'matterEvent.deletedMatter',
            recipientResolverBeanName: MATTER_ADMINS_AND_AFFECTED,
            defaultOptOut: false
        ),
        'RestoredMatter': new MatterEventDescriptor(
            eventType: 'RestoredMatter',
            payloadClass: RestoredMatterPayload,
            i18nKey: 'matterEvent.restoredMatter',
            recipientResolverBeanName: MATTER_ADMINS_AND_AFFECTED,
            defaultOptOut: false
        )
    ].asImmutable()

    MatterEventDescriptor lookup(String eventType) {
        MatterEventDescriptor descriptor = descriptorsByType[eventType]
        if (descriptor == null) {
            throw new UnknownEventTypeException(eventType)
        }
        return descriptor
    }

    Collection<MatterEventDescriptor> all() {
        return descriptorsByType.values()
    }

    List<String> categories() {
        return CATEGORY_TO_EVENT_TYPES.keySet().toList()
    }

    // Resolves the selected categories to their underlying event types. Unknown categories are
    // ignored. Returns an empty list when nothing is selected (caller treats that as "no filter").
    List<String> categoriesToEventTypes(List<String> categories) {
        if (!categories) {
            return []
        }
        return categories.findResults { CATEGORY_TO_EVENT_TYPES[it] }.flatten().unique() as List<String>
    }
}
