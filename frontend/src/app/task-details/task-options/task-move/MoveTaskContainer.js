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

import { StatusCodes } from 'http-status-codes'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CONFIG } from '../../../../app/constants'
import {
  clearMoveTaskError,
  moveTask,
} from '../../../../app/task-map/selected-task/selected-task-menu-actions'
import IsWidthDown from '../../../../hooks/width-helper'
import { getLevelATaskCount } from '../../../../services/helpers/task/task-util-helper'
import projectService from '../../../../services/project/project-service'
import {
  fetchProjects,
  fetchProjectWithTasks,
} from '../../../matter-details/projects/projects-actions'
import {
  fetchProject,
  fetchProjectOverview,
  fetchProjectWithHierarchy,
} from '../../../project/project-actions'
import { fetchTaskDetails } from '../../../task-map/selected-task/selected-task-actions'
import TaskMoveDialog from './task-move-dialog/TaskMoveDialog'

function MoveTaskContainer(props) {
  const dispatch = useDispatch()
  const project = useSelector(state => state.project)

  useEffect(() => {
    if (!project.isLoaded) {
      dispatch(
        fetchProject(props.matterId, props.task.project.id, {
          includeFullHierarchy: true,
        })
      )
    }
    dispatch(fetchProjects(props.matterId))
    dispatch(fetchProjectWithTasks(props.matterId, false, false, false))
    props.actions.clearMoveTaskError()
  }, [dispatch, props.actions, props.matterId]) //eslint-disable-line

  return props.display ? (
    <TaskMoveDialog
      task={props.task}
      matterId={props.matterId}
      cancelHandler={props.cancelHandler}
      moveHandler={props.actions.moveTask}
      updateProject={(matterId, projectId) => {
        props.actions.fetchProjectWithHierarchy(matterId, projectId)
        props.updateProject(matterId, projectId, true)
      }}
      data-test="move-task-dialog"
      levelAProjectTaskCountCheck={checkIfLevelATaskCountAtCapacity}
      fullScreen={IsWidthDown('sm', props.width)}
      taskMenuContext={props.taskMenuContext}
      fetchTaskDetails={props.actions.fetchTaskDetails}
      fetchProjectOverview={props.actions.fetchProjectOverview}
      clearMoveTaskError={props.actions.clearMoveTaskError}
    />
  ) : null
}

function checkIfLevelATaskCountAtCapacity(project) {
  if (project.tasks)
    return getLevelATaskCount(project) === CONFIG.LEVEL_A_TASK_LIMIT

  return projectService
    .getProject(project.matter.id, project.id, { includeFullHierarchy: true })
    .then(response => {
      if (response.status !== StatusCodes.OK) return
      return getLevelATaskCount(response.body) === CONFIG.LEVEL_A_TASK_LIMIT
    })
}

MoveTaskContainer.propTypes = {
  task: PropTypes.object.isRequired,
  cancelHandler: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  matterId: PropTypes.string.isRequired,
  display: PropTypes.bool.isRequired,
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      moveTask: bindActionCreators(moveTask, dispatch),
      fetchProjectWithHierarchy: bindActionCreators(
        fetchProjectWithHierarchy,
        dispatch
      ),
      fetchTaskDetails: bindActionCreators(fetchTaskDetails, dispatch),
      fetchProjectOverview: bindActionCreators(fetchProjectOverview, dispatch),
      clearMoveTaskError: bindActionCreators(clearMoveTaskError, dispatch),
    },
  }
}

export default connect(null, mapDispatchToProps)(MoveTaskContainer)
