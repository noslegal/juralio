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

import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CreateMilestoneFlow from './CreateMilestoneFlow'
import {
  fetchProjectOverview,
  fetchProjectWithPostsAndTaskTeam,
} from '../../../app/project/project-actions'
import {
  isInRoadmapContext,
  isInSpecificProjectContext,
  isInTaskmapContext,
} from '../../../services/helpers/route/route-context-helper'
import { createNewTask } from '../../../app/task-details/task-actions'
import { TASK_STATUS } from '../../../app/constants'
import { getLocationParams } from '../../../services/helpers/route/route-helper'

const CreateMilestoneFlowContainer = props => {
  const [milestoneName, setMilestoneName] = useState('')
  const [error, setError] = useState('')
  const parentTask = useSelector(state => state.selectedTask)

  const dispatch = useDispatch()

  const displayDestinationDialog = name => setMilestoneName(name)

  const handleBack = () => setMilestoneName('')

  const createMilestone = (matterId, projectId, parentId) => {
    const isMilestone = true
    dispatch(
      createNewTask(
        matterId,
        projectId,
        parentId,
        TASK_STATUS.NOT_STARTED,
        milestoneName,
        isMilestone
      )
    ).then(response => {
      if (response.type === 'CREATE_TASK_FAILURE') {
        setError(response.message)
        return
      }
      if (
        isInTaskmapContext() ||
        (isInRoadmapContext() && isInSpecificProjectContext(projectId))
      ) {
        dispatch(fetchProjectOverview(matterId, projectId))
        dispatch(fetchProjectWithPostsAndTaskTeam(matterId, projectId))
      }
      props.cancelHandler()
    })
  }

  const createMilestoneInContext = name => {
    setMilestoneName(name)
    createMilestone(
      getLocationParams('matter'),
      getLocationParams('workstream'),
      getLocationParams('task')
    )
  }

  return (
    <CreateMilestoneFlow
      milestoneName={milestoneName}
      error={error}
      parentTask={parentTask}
      createMilestoneInContext={createMilestoneInContext}
      displayDestinationDialog={displayDestinationDialog}
      handleBack={handleBack}
      createMilestone={createMilestone}
      {...props}
    />
  )
}

export default CreateMilestoneFlowContainer
