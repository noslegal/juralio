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

import { formatUserDisplayName } from '../../../user/helper/user-format-service'
import { getDownloadedByText } from '../common/report-text-helpers'
import {
  getMatterReferenceNumber,
  getWorkstreamLabel,
  getWorkstreamName,
} from '../workstream-task-list/header-details-helper'

export const buildTeamList = (t, teamSummary, team, matter, project) => {
  const downloadedByText = getDownloadedByText(t)
  let content =
    matter.numProjects > 1 ? t('entity:workstream') : t('entity.matter')
  content = content.toLowerCase()

  const isPrivate = project.isPrivate

  const teamText = t('exports.team.matterTeam')

  teamSummary.push(
    ['', t('entity.client') + ':', matter.clientName, downloadedByText],
    [
      '',
      t('entity.matter') + ':',
      matter.name + ' / ' + getMatterReferenceNumber(t, matter),
    ],
    [
      isPrivate ? 'Private' : '',
      getWorkstreamLabel(t, matter, project),
      getWorkstreamName(t, matter, project),
      '',
    ],
    [teamText, '', ''],
    ['', '', '', '']
  )
  teamSummary.push([
    t('exports.team.name'),
    t('exports.team.accountType'),
    t('exports.team.role'),
    t('exports.team.tasksInProgress', { content: content }),
  ])
  team.forEach(member => buildMemberRow(t, teamSummary, member, project))
}

const buildRoles = (t, user) => {
  let rolesString = ''
  if (user.matterAdminId !== 0) {
    rolesString = rolesString + t('entity.admin')
  }
  if (user.teamMemberId !== 0) {
    if (user.matterAdminId !== 0) {
      rolesString = rolesString + ', '
    }
    rolesString = rolesString + t('entity.editor')
  }
  return rolesString
}

const buildAccountType = (t, user) => {
  let accountTypeString = ''
  if (user.isExternal) {
    accountTypeString = accountTypeString + t('auth.external')
  } else {
    accountTypeString = accountTypeString + t('auth.internal')
  }
  // Guest users are not yet supported, so every user is treated as a standard user here.
  accountTypeString = accountTypeString + ' ' + t('exports.team.standardUser')
  return accountTypeString
}

const buildPlaceholderRow = (t, member, project) => {
  return [
    formatUserDisplayName(member.user),
    `${t('exports.common.placeholder')}`,
    `${t('exports.team.noAccess')}`,
    `${
      project.people &&
      project.people?.find(u => u.id === member.user.id) &&
      project.people?.find(u => u.id === member.user.id).taskCount > 0
        ? project.people?.find(u => u.id === member.user.id).taskCount
        : t('exports.team.none')
    }`,
  ]
}

export const buildMemberRow = (t, teamSummary, member, project) => {
  let row
  if (member.user.isPlaceholder) {
    row = buildPlaceholderRow(t, member, project)
  } else {
    row = [
      formatUserDisplayName(member.user),
      `${buildAccountType(t, member.user)}`,
      `${buildRoles(t, member)}`,
      `${
        project.people &&
        project.people?.find(u => u.id === member.user.id) &&
        project.people?.find(u => u.id === member.user.id).taskCount > 0
          ? project.people?.find(u => u.id === member.user.id).taskCount
          : t('exports.team.none')
      }`,
    ]
  }
  teamSummary.push(row)
}
