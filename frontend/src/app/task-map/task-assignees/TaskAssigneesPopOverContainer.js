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

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { replaceTask } from '../../../redux/ducks/improved-taskmap'
import { fetchTeam } from '../../../redux/ducks/matter-team'
import {
  isInImprovedTaskmapContext,
  isInTasklistContext,
} from '../../../services/helpers/route/route-context-helper'
import taskService from '../../../services/task/task-service'
import { addUserToSubtasksSteps } from '../../../services/tour/steps/add-user-to-subtasks-steps'
import {
  clearTour,
  setAvailableTours,
  setTour,
} from '../../../services/tour/tour-actions'
import tourService from '../../../services/tour/tour-service'
import {
  fetchProjectOverview,
  fetchProjectWithPostsAndTaskTeam,
} from '../../project/project-actions'
import { hideTaskmapTaskAssigneeContainer } from '../../task-details/task-actions'
import { fetchTaskDetails } from '../selected-task/selected-task-actions'
import { addTaskTeamMember } from '../selected-task/selected-task-team-actions'
import TaskAssigneesPopOver from './TaskAssigneesPopOver'

const filterUsers = (mtm, currentUser) => {
  if (!mtm || !Array.isArray(mtm) || !currentUser) return []
  currentUser.isActiveOnMatter = true
  return [
    currentUser,
    ...mtm
      .filter(mtm => mtm.teamMemberId > 0 || mtm.matterViewerId > 0)
      .map(mtm => mtm.user)
      .filter(mtm => mtm.id !== currentUser.id)
      .slice(0, 2),
  ]
}

const filterMatterTeamMembers = (
  matterTeamMembers,
  taskTeam,
  taskFollowers
) => {
  if (!matterTeamMembers || !Array.isArray(matterTeamMembers) || !taskTeam) {
    return []
  }
  const followerIds = (taskFollowers ?? []).map(f => f.id)
  return matterTeamMembers
    .filter(
      mtm => mtm.teamMemberId > 0 || mtm.matterViewerId > 0 || mtm.isPlaceholder
    )
    .map(tm => {
      tm.user.isPlaceholder = tm.isPlaceholder
      tm.user.organisationGroup = tm.organisationGroup
      return tm.user
    })
    .filter(mtm => !taskTeam.map(tm => tm.id).includes(mtm.id))
    .filter(mtm => !followerIds.includes(mtm.id))
}

const TaskAssigneesPopOverContainer = () => {
  const dispatch = useDispatch()
  const show = useSelector(state => state.taskmap.showAssigneePopover)

  const position = useSelector(state => state.taskmap.position)
  const selectedTask = useSelector(state => state.taskmap.selectedTask)
  const matterId = useSelector(state => state.matterDetails?.matter?.id)
  const projectId = useSelector(state => state.project?.id)
  const taskId = useSelector(state => state.taskmap.selectedTask?.id)
  const matterTeamMembers = useSelector(state => state.matterTeam.mainPage.team)
  const currentUser = useSelector(state => state.auth.data.details)
  const { t } = useTranslation()
  const tours = useSelector(state => state.tour.tours)

  const [taskTeam, setTaskTeam] = useState([])
  const [taskFollowers, setTaskFollowers] = useState([])
  const [progressBar, setProgressBar] = useState(false)
  const [showUserList, setShowUserList] = useState(true)
  const [users, setUsers] = useState([])
  const [filteredMatterTeamMembers, setFilteredMatterTeamMembers] =
    useState(matterTeamMembers)

  useEffect(() => {
    if (selectedTask && selectedTask?.teamMembers?.length > 0) {
      setTaskTeam(selectedTask?.teamMembers)
    } else {
      setTaskTeam([])
    }
    setTaskFollowers(selectedTask?.followers ?? [])
  }, [selectedTask])

  useEffect(() => {
    const includeTaskCount = true
    const includePlaceholders = true
    if (matterId) {
      dispatch(fetchTeam(matterId, includeTaskCount, includePlaceholders))
    }
  }, [matterId]) // eslint-disable-line

  useEffect(() => {
    setUsers(filterUsers(matterTeamMembers, currentUser))
    setFilteredMatterTeamMembers(
      filterMatterTeamMembers(matterTeamMembers, taskTeam, taskFollowers)
    )
  }, [matterTeamMembers, taskTeam, taskFollowers]) // eslint-disable-line

  if (!show) {
    return null
  }

  const addAssignee = assignee => {
    setProgressBar(true)
    dispatch(fetchTaskDetails(matterId, projectId, taskId)).then(() => {
      dispatch(
        addTaskTeamMember(
          matterId,
          projectId,
          taskId,
          assignee,
          false,
          selectedTask.tasks && selectedTask?.tasks?.length > 0
        )
      ).then(() => {
        close()
        dispatch(fetchProjectWithPostsAndTaskTeam(matterId, projectId))
        dispatch(fetchProjectOverview(matterId, projectId))
        if (isInImprovedTaskmapContext() || isInTasklistContext()) {
          taskService
            .getTaskById(matterId, projectId, taskId)
            .then(response => {
              if (response.status === 200) {
                dispatch(replaceTask(response.body))
              }
            })
        }
      })
    })
  }

  const closeTourForever = () => {
    tourService.completeTour('addToSubtasks').then(() => {
      dispatch(clearTour())
      tourService.getTours().then(res => {
        if (res.status === 200) {
          dispatch(setAvailableTours(res.body))
        }
      })
    })
  }
  const triggerAddtoSubtasksTour = () => {
    if (selectedTask.tasks && selectedTask.tasks.length === 0) {
      return
    }
    const sessionTours = JSON.parse(
      window.sessionStorage.getItem('juralio_tours')
    )

    //if has subtasks
    const hiddenForSession = sessionTours && sessionTours['addToSubtasks']

    !tours.addToSubtasks &&
      !hiddenForSession &&
      !isInTasklistContext() &&
      dispatch(
        setTour(
          'addToSubtasks',
          addUserToSubtasksSteps(
            t,
            closeTourForever,
            `[id=task-cell-assignee-avatar-${selectedTask.id}]`
          )
        )
      )
  }

  const close = () => {
    dispatch(hideTaskmapTaskAssigneeContainer())
    setTimeout(() => triggerAddtoSubtasksTour(), 1000)
    setShowUserList(true)
    setProgressBar(false)
  }

  const onSearchInputchange = () => {
    setShowUserList(false)
  }

  return (
    <TaskAssigneesPopOver
      selectedTask={selectedTask}
      position={position}
      addAssignee={addAssignee}
      close={close}
      users={users}
      showUserList={showUserList}
      matterTeamMembers={filteredMatterTeamMembers}
      taskTeam={taskTeam}
      onSearchInputchange={onSearchInputchange}
      setShowUserList={setShowUserList}
      matterId={matterId}
      progressBar={progressBar}
    />
  )
}

export default TaskAssigneesPopOverContainer
