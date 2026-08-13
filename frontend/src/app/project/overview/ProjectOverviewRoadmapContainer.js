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

import React from 'react'
import { useSelector } from 'react-redux'
import BigDataSpinner from '../../../components/feedback/big-data-spinner/BigDataSpinner'
import { ACTIVITIES, TASK_STATUS } from '../../constants'
import ProjectOverviewContent from './ProjectOverviewContent'
import ProjectOverviewNoTasksPlaceholder from './ProjectOverviewNoTasksPlaceholder'

const ProjectOverviewRoadmapContainer = props => {
  const project = props.project
  const auth = useSelector(state => state.auth)
  const taskCount = Object.values(project.taskCounts).reduce(
    (total, num) => total + num
  )

  if (!project && !taskCount) {
    return <BigDataSpinner size={80} />
  }

  const sortByStatus = (a, b) => {
    if (a.status === b.status) {
      return 0
    }
    if (a.status === TASK_STATUS.DONE) {
      return -1
    }
    if (b.status === TASK_STATUS.DONE) {
      return 1
    }
    if (a.status === TASK_STATUS.IN_PROGRESS) {
      return -1
    }
    if (b.status === TASK_STATUS.IN_PROGRESS) {
      return 1
    }
    if (a.status === TASK_STATUS.NOT_STARTED) {
      return -1
    }
    if (b.status === TASK_STATUS.NOT_STARTED) {
      return 1
    }
    return 0
  }

  if (taskCount === 0) {
    return (
      <ProjectOverviewNoTasksPlaceholder
        isMatterOverview={props.isMatterOverview}
        projectId={project.id}
        isMatterViewer={
          project?.activities?.includes(ACTIVITIES.MATTER_VIEWER) ||
          auth?.data?.details?.roles?.includes('FROZEN_ORG_USER')
        }
        project={props.project}
        isTemplate={props.isTemplate}
      />
    )
  }
  return (
    <ProjectOverviewContent
      tasks={props.project.levelATasks.sort(sortByStatus)}
      project={props.project}
      isMatterOverview={props.isMatterOverview}
      projectId={project.id}
      isTemplate={props.isTemplate}
      isViewOnly={
        project?.activities?.includes(ACTIVITIES.MATTER_VIEWER) ||
        auth?.data?.details?.roles?.includes('FROZEN_ORG_USER')
      }
    />
  )
}

export default ProjectOverviewRoadmapContainer
