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

import { formatReferenceNumber } from '../../../../services/task/task-text-format-service'
import {
  getDateDisplayStringUTC,
  getTimeDisplayStringUTC,
} from '../../../helpers/date-helper'
import { formatUserDisplayName } from '../../../user/helper/user-format-service'

export const getProjectReferenceAndName = project =>
  `${project.referenceNumber} - ${project.name}`

export const getTaskReferenceAndName = (t, task) =>
  `${t('entity.task')} ${formatReferenceNumber(task)} - ${task.name}`

export const getTaskStatusText = (t, task) => t(`taskStatus.${task.status}`)

export const getPrivilegedAndConfidentialText = t =>
  t('exports.common.privilegedAndConfidential')

export const getClientAndMatterNames = matter =>
  `${matter.clientName} > ${matter.name}`

export const getTaskTeam = (t, task, internal) => {
  if (!task.teamMembers || task.teamMembers.length === 0) return ''
  let team = ''
  let teamMembers = task.teamMembers
  if (internal !== undefined) {
    if (internal) {
      teamMembers = teamMembers.filter(t => !t.isExternal)
    } else {
      teamMembers = teamMembers.filter(t => t.isExternal)
    }
  }
  teamMembers.forEach(member => (team += `${formatUserDisplayName(member)}, `))
  if (team.length > 0) {
    team = team.slice(0, -2)
  }
  return team
}

export const getDownloadedByText = t => {
  const now = new Date()
  return `${t('exports.common.exportedFromJuralio')}\n${getDateDisplayStringUTC(
    now
  )} ${getTimeDisplayStringUTC(now)} UTC`
}
