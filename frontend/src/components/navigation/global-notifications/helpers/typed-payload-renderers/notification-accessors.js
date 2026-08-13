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

// Accessors that normalise a UserNotification (new MatterEvent-backed shape) so
// the renderers don't reach into nested fields directly. Shape:
// { id, read, dismissed, dateCreated, matterEvent: { eventType, occurredAt,
//   matterId, matterReference, matterName, performedBy: { id, firstName,
//   lastName }, payload: {...} } }

export const getMatterEvent = notification => notification.matterEvent || {}

export const getPayload = notification =>
  getMatterEvent(notification).payload || {}

export const getEventType = notification =>
  getMatterEvent(notification).eventType

export const getMatterId = notification => getMatterEvent(notification).matterId

export const getMatterReference = notification =>
  getMatterEvent(notification).matterReference

export const getMatterName = notification =>
  getMatterEvent(notification).matterName

export const getOccurredAt = notification =>
  getMatterEvent(notification).occurredAt || notification.dateCreated

export const getActioneer = notification => {
  const performedBy = getMatterEvent(notification).performedBy || {}
  return {
    id: performedBy.id,
    firstname: performedBy.firstName,
    lastname: performedBy.lastName,
    avatarColorIndex: performedBy.avatarColorIndex,
    avatarImageIndex: performedBy.avatarImageIndex,
    isExternal: performedBy.isExternal,
  }
}

export const getActioneerId = notification =>
  (getMatterEvent(notification).performedBy || {}).id

// The user the action was about (membership events) — same {firstname, lastname}
// shape as above.
export const getAffectedMember = notification => {
  const payload = getPayload(notification)
  return {
    firstname: payload.affectedMemberFirstName,
    lastname: payload.affectedMemberLastName,
  }
}

export const getAffectedMemberId = notification =>
  getPayload(notification).affectedMemberId
