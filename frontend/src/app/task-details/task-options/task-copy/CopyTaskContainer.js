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

import React, { useEffect } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { bindActionCreators } from 'redux'
import { checkTaskCopyPreconditions } from '../../../../app/task-details/TaskCardCommon'
import { getTaskMapUrl } from '../../../../components/navigation/common/location-context-helper'
import IsWidthDown from '../../../../hooks/width-helper'
import withRouter from '../../../../services/navigation/WithRouter'
import { TASK_MENU_CONTEXT } from '../../../constants'
import {
  fetchProject,
  fetchProjectOverview,
  fetchProjectWithPostsAndTaskTeam,
} from '../../../project/project-actions'
import { fetchTaskDetails } from '../../../task-map/selected-task/selected-task-actions'
import {
  copyTask,
  denyALevelTaskCopy,
  denyTaskCopy,
} from '../../../task-map/selected-task/selected-task-menu-actions'
import CopyTaskDialog from './task-copy-dialog/CopyTaskDialog'

function CopyTaskContainer(props) {
  const project = useSelector(state => state.project)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  useEffect(() => {
    if (!project.isLoaded) {
      dispatch(
        fetchProject(props.matterId, props.task.project.id, {
          includeFullHierarchy: true,
        })
      )
    }
  }, []) //eslint-disable-line

  const copyProjectTaskHandler = newName => {
    props.actions
      .copyTask(props.matterId, props.task.projectId, props.task.id, newName)
      .then(result => {
        if (
          props.taskMenuContext === TASK_MENU_CONTEXT.TASK_MAP ||
          props.taskMenuContext === TASK_MENU_CONTEXT.ROADMAP
        ) {
          props.actions.fetchProjectWithPostsAndTaskTeam(
            props.matterId,
            props.task.projectId
          )
          props.updateProject(props.matterId, props.task.projectId, true)
          props.cancelHandler()
        } else if (props.taskMenuContext === TASK_MENU_CONTEXT.SUBTASK_PANEL) {
          if (props.task.level > 1) {
            props.actions
              .fetchTaskDetails(
                props.matterId,
                props.task.projectId,
                props.task.parent.id
              )
              .then(props.cancelHandler)
          } else {
            props.actions
              .fetchProjectOverview(props.matterId, props.task.projectId)
              .then(props.cancelHandler)
          }
        } else if (!props.dontRedirect) {
          navigate(getAfterCopyUrl(result.task.id))
        } else {
          props.cancelHandler()
        }
      })
  }

  const mountHandler = () => {
    checkTaskCopyPreconditions(
      props.task,
      props.project,
      props.actions.denyALevelTaskCopy,
      props.actions.denyTaskCopy,
      props.cancelHandler
    )
  }

  const getAfterCopyUrl = copiedTaskId =>
    getTaskMapUrl(copiedTaskId, props.matterId, props.task.projectId)

  return props.display && project.isLoaded ? (
    <CopyTaskDialog
      hasSubtasks={props.task?.tasks.length > 0}
      data-test="copy-confirmation-dialog"
      taskName={props.task.name}
      cancelHandler={props.cancelHandler}
      copyHandler={props.actions.copyTask}
      fullScreen={IsWidthDown('sm', props.width)}
      updateProject={props.actions.fetchProjectWithHierarchy}
      fetchTaskDetails={props.actions.fetchTaskDetails}
      taskMenuContext={props.taskMenuContext}
      copyTaskHandler={copyProjectTaskHandler}
      mountHandler={mountHandler}
      isTemplate={false}
      cannotCopyHere={() => false}
    />
  ) : null
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      copyTask: bindActionCreators(copyTask, dispatch),
      denyTaskCopy: bindActionCreators(denyTaskCopy, dispatch),
      denyALevelTaskCopy: bindActionCreators(denyALevelTaskCopy, dispatch),
      fetchProjectWithPostsAndTaskTeam: bindActionCreators(
        fetchProjectWithPostsAndTaskTeam,
        dispatch
      ),
      fetchTaskDetails: bindActionCreators(fetchTaskDetails, dispatch),
      fetchProjectOverview: bindActionCreators(fetchProjectOverview, dispatch),
    },
  }
}

function mapStateToProps(state) {
  return {
    project: state.project,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(CopyTaskContainer))
