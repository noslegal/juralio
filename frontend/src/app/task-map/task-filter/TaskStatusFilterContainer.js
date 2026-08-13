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

import debounce from 'lodash/debounce'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import StatusSelector from '../../../components/inputs/status-filter/StatusSelector'

import { taskFilterActions } from './task-filter-actions'

const TaskStatusFilterContainer = props => {
  const dispatch = useDispatch()
  const statusAll = useSelector(state => state.taskMapFilter.statusAll)
  const statusDone = useSelector(state => state.taskMapFilter.statusDone)
  const taskCounts = useSelector(state => state.project.taskCounts)

  const statusNotStarted = useSelector(
    state => state.taskMapFilter.statusNotStarted
  )

  const statusNotRequired = useSelector(
    state => state.taskMapFilter.statusNotRequired
  )
  const handleDone = () => {
    if (statusDone && statusAll) {
      dispatch(taskFilterActions.setStatusAll(statusAll))
    }
    dispatch(taskFilterActions.setStatusDone(statusDone))
  }
  const handleNotStarted = () => {
    if (statusNotStarted && statusAll) {
      dispatch(taskFilterActions.setStatusAll(statusAll))
    }
    dispatch(taskFilterActions.setStatusNotStarted(statusNotStarted))
  }

  const handleNotRequired = () => {
    if (statusNotRequired && statusAll) {
      dispatch(taskFilterActions.setStatusAll(statusAll))
    }
    dispatch(taskFilterActions.setStatusNotRequired(statusNotRequired))
  }

  const handleAll = () => {
    if (!statusAll) {
      dispatch(taskFilterActions.setStatusDone(false))
      dispatch(taskFilterActions.setStatusNotStarted(false))
      dispatch(taskFilterActions.setStatusNotRequired(false))
      dispatch(taskFilterActions.setStatusAll(statusAll))
    } else if (statusAll) {
      dispatch(taskFilterActions.setStatusDone(true))
      dispatch(taskFilterActions.setStatusNotStarted(true))
      dispatch(taskFilterActions.setStatusNotRequired(true))
      dispatch(taskFilterActions.setStatusAll(statusAll))
    }
  }

  useEffect(() => {
    if (!statusAll && statusDone && statusNotRequired && statusNotStarted) {
      dispatch(taskFilterActions.setStatusAll(false))
    }
  }, [statusDone, statusNotRequired, statusNotStarted]) //eslint-disable-line

  return (
    <StatusSelector
      statusAll={statusAll}
      statusDone={statusDone}
      disableDone={taskCounts?.doneCount === 0}
      disableNotStarted={taskCounts?.notStartedCount === 0}
      disableNotRequired={taskCounts?.notRequiredCount === 0}
      statusNotStarted={statusNotStarted}
      statusNotRequired={statusNotRequired}
      handleDone={debounce(handleDone, 500, { leading: false })}
      handleNotStarted={debounce(handleNotStarted, 500, { leading: false })}
      handleNotRequired={debounce(handleNotRequired, 500, { leading: false })}
      handleAll={debounce(handleAll, 500, { leading: false })}
      shouldShowNotRequired={props.shouldShowNotRequired}
    />
  )
}

export default TaskStatusFilterContainer
