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

import { OPERATOR, UNASSIGNED } from '../../../../../app/constants'
import { filterOutLabels } from '../../../../../services/helpers/task/filter-tasks'

const emailExistsInList = (list, email) => {
  return list && list.filter(item => item.email === email).length > 0
}

const getTasks = taskList => {
  let tasks = taskList.descendants()
  if (tasks.length > 1) {
    tasks = tasks.slice(1)
  }
  return tasks
}

const noAssignedTaskTeamMember = taskTeam => taskTeam?.length === 0

const taskTeamMembersDeactivated = taskTeam => {
  const found = taskTeam.find(teamMember => teamMember.enabled)
  return !found
}

const taskTeamMembersNotMatterTeamMembers = (taskTeam, matterTeam) => {
  let usersInBoth = taskTeam.filter(taskMember =>
    matterTeam.find(matterMember => matterMember.user.id === taskMember.id)
  )
  return !usersInBoth || usersInBoth.length === 0
}

const taskTeamMembersDeactivatedOrNotInMatterTeam = (taskTeam, matterTeam) => {
  let result = taskTeam.filter(taskMember => {
    return (
      taskMember.enabled &&
      matterTeam.find(matterMember => matterMember.user.id === taskMember.id)
    )
  })
  return !result || result.length === 0
}

export const filterTasksByEmail = (
  taskList,
  email,
  matterTeam,
  { taskMemberOf = true, following = true, logicOperator = OPERATOR.AND } = {}
) => {
  if (!taskList || taskList.length === 0) return null
  let tasks = getTasks(taskList)
  if (!tasks || !email) {
    return tasks
  }

  let t = tasks.filter(task => {
    let followers = task.data.followers
    let teamMembers = task.data.teamMembers

    if (!followers || !teamMembers) return null

    // Filter by unassigned tasks
    if (email === UNASSIGNED) {
      return (
        noAssignedTaskTeamMember(teamMembers) ||
        taskTeamMembersDeactivated(teamMembers) ||
        taskTeamMembersNotMatterTeamMembers(teamMembers, matterTeam) ||
        taskTeamMembersDeactivatedOrNotInMatterTeam(teamMembers, matterTeam)
      )
    }

    // Filter by your tasks
    if (logicOperator === OPERATOR.OR) {
      return (
        emailExistsInList(teamMembers, email) ||
        emailExistsInList(followers, email)
      )
    }

    // Filter by specified user
    if (logicOperator === OPERATOR.AND) {
      if (taskMemberOf && following) {
        return (
          emailExistsInList(teamMembers, email) &&
          emailExistsInList(followers, email)
        )
      } else if (taskMemberOf) {
        return emailExistsInList(teamMembers, email)
      } else if (following) {
        return emailExistsInList(followers, email)
      }
    }

    return null
  })
  return t
}

export const filterTasksByMilestone = (taskList, showMilestone) => {
  if (!taskList || taskList.length === 0) return null
  let tasks = getTasks(taskList)
  if (!tasks || !showMilestone) {
    return tasks
  }
  let filterTaskList = tasks.filter(
    task => task.data.isMilestone === showMilestone
  )
  return filterTaskList
}

export const filterTaskByLabel = (taskList, labels) => {
  if (!taskList || taskList.length === 0) return null
  let tasks = taskList
  if (!tasks || labels.length === 0) {
    return tasks
  }
  let filteredTasks = tasks.filter(task => filterOutLabels(task, labels))
  return filteredTasks
}
