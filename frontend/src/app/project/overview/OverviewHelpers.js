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

import uniq from 'lodash/uniq'
import {
  convertTaskStatusString,
  levelNumberToLetter,
} from '../../../services/helpers/task/task-util-helper'
import {
  sortMatterViewersLast,
  sortNoAccessLast,
} from '../../../services/helpers/user/user-helper'
import { checkIfPrivateWorkstreamMember } from '../../../services/helpers/user/user-roles-helper'
import postHelper from './items/workstream-content/project-post-helpers'

export const generateTeamFilterList = (task, isTemplate = false) => {
  let teamOptions = []
  if (!isTemplate) {
    task.teamMembers.forEach(tm => tm.username && teamOptions.push(tm.username))
  }
  return uniq(teamOptions)
}

const generateMatterTeamAsMap = matterTeam => {
  const result = {}
  matterTeam.forEach(mtm => (result[mtm.user.id] = mtm))
  return result
}

const convertPAListToMTMList = (authors, teamMap) => {
  const result = []
  authors.forEach(postAuthors => {
    if (teamMap[postAuthors.appUserId]) {
      if (postAuthors.isActiveOnWorkstream !== undefined) {
        teamMap[postAuthors.appUserId].user.isActiveOnWorkstream =
          postAuthors.isActiveOnWorkstream
      } else {
        teamMap[postAuthors.appUserId].user.isActiveOnWorkstream =
          teamMap[postAuthors.appUserId].isActiveOnWorkstream
      }
      result.push({ ...teamMap[postAuthors.appUserId].user })
    } else {
      let defaultUser = postAuthors
      defaultUser.isActiveOnWorkstream = false
      defaultUser.isActiveOnMatter = false
      result.push(defaultUser)
    }
  })
  return result
}

const convertTTMListToMTMList = (taskTeam, teamMap) => {
  const result = []
  if (!taskTeam || !teamMap) {
    return result
  }
  taskTeam.forEach(ttm => {
    if (teamMap[ttm.id]?.user) {
      teamMap[ttm.id].user.isActiveOnWorkstream =
        teamMap[ttm.id].isActiveOnWorkstream
    }
    if (teamMap[ttm.id]) {
      result.push({ ...teamMap[ttm.id].user })
    } else {
      let defaultUser = ttm
      defaultUser.isActiveOnWorkstream = false
      defaultUser.isActiveOnMatter = false
      result.push(defaultUser)
    }
  })
  return result
}

export const generateTaskTableData = (
  tasks,
  t,
  currentUser,
  isMatterOverview,
  projects,
  isTemplate,
  matterTeam
) => {
  if (!tasks) {
    return []
  }

  const teamMap = generateMatterTeamAsMap(matterTeam)

  return tasks.map(task => {
    const dates = task.posts?.map(p => p?.lastUpdated) || []
    dates.push(task.lastUpdated)
    const lastUpdated = dates.sort((a, b) =>
      Date.parse(a) > Date.parse(b) ? 1 : -1
    )[0]

    const project = isMatterOverview
      ? projects.find(p => p.id === task.project.id)
      : null
    const teamMembers = convertTTMListToMTMList(task.teamMembers, teamMap)

    const searchParts = [
      task.name,
      isMatterOverview && project?.name,
      convertTaskStatusString(t, task.status),
      !isTemplate &&
        task.teamMembers
          ?.map(
            tm =>
              `${tm.firstname || ''} ${tm.lastname || ''} ${
                tm.username || ''
              } ${tm.email || ''}`
          )
          .join(' '),
    ].filter(Boolean)

    return {
      id: task.id,
      _task: task,
      _project: project,
      projectName: isMatterOverview ? (project?.name ?? '') : '',
      name: task.name,
      status: convertTaskStatusString(t, task.status),
      level: levelNumberToLetter(task.level),
      teamFilterList: !isTemplate ? generateTeamFilterList(task) : [],
      teamMembers,
      lastUpdated,
      following: task.followers?.map(u => u.id).includes(currentUser.id)
        ? t('postOverviewTable.followingText')
        : t('postOverviewTable.notFollowingText'),
      labels: task.labels?.map(label => label.name) ?? [],
      milestoneType: `${
        task.isMilestone ? t('entity.milestone') : t('entity.task')
      }s`,
      _search: searchParts.join(' ').toLowerCase(),
    }
  })
}

const generateEditorFilterList = (post, isTemplate) => {
  let editorOptions = []
  if (!isTemplate) {
    post.authors.forEach(e => editorOptions.push(e.username))
  }
  return uniq(editorOptions)
}

export const generatePostTableData = (
  posts,
  t,
  tasks,
  isTemplate,
  isMatterOverview = false,
  projects = [],
  matterTeam
) => {
  const isMatterTeamAvailable = matterTeam && matterTeam.length > 0
  const isPostContentAvailable = posts && posts.length > 0
  if (isTemplate && !isPostContentAvailable) {
    return []
  } else if (
    !isTemplate &&
    (!isPostContentAvailable || !isMatterTeamAvailable)
  ) {
    return []
  }

  return posts
    .map(post => {
      const task = postHelper.getTask(
        post.taskId,
        tasks.find(t => t.id === post.taskId)
      )
      if (task === undefined) {
        return null
      }

      let projectName
      if (isMatterOverview) {
        projectName = projects.find(p => p.id === post.project.id)?.name
      }

      const postProject = projects.filter(p => p.id === post.project.id)
      if (postProject.length > 0 && post.authors?.length > 0) {
        const p = postProject[0]
        const privateTeamUsers = p.privateWorkstreamTeam.map(p => p.user)
        post.authors = post.authors.map(pa => {
          pa.isActiveOnWorkstream = checkIfPrivateWorkstreamMember(
            { isPrivate: p.isPrivate, privateWorkstreamTeam: privateTeamUsers },
            { id: pa.appUserId }
          )
          return pa
        })
      }

      post.authors = post.authors ? post.authors : []

      const users = sortNoAccessLast(
        sortMatterViewersLast(
          isTemplate
            ? post.authors
            : convertPAListToMTMList(
                post.authors,
                generateMatterTeamAsMap(matterTeam)
              )
        )
      )

      return {
        id: post.id,
        _post: post,
        projectName: isMatterOverview ? (projectName ?? '') : '',
        name: post.name,
        status: post.finalised ? t('postMenu.final') : t('postMenu.draft'),
        type: post.type || t('entity.note'),
        users,
        _task: task,
        taskRefNumber: task.referenceNumber,
        taskName: task.name,
        editorFilterList: generateEditorFilterList(post, isTemplate),
        _search:
          `${post.name} ${task.name} ${task.referenceNumber}`.toLowerCase(),
      }
    })
    .filter(Boolean)
}
