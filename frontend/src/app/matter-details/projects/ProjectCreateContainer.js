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
import { useDispatch, useSelector } from 'react-redux'
import { taskFilterActions } from '../../task-map/task-filter/task-filter-actions'
import CreateWorkstreamAdminDialog from './create-project/CreateWorkstreamAdminDialog'

const ProjectCreateContainer = props => {
  const statusDone = useSelector(state => state.taskMapFilter.statusDone)
  const statusNotStarted = useSelector(
    state => state.taskMapFilter.statusNotStarted
  )
  const statusNotRequired = useSelector(
    state => state.taskMapFilter.statusNotRequired
  )

  const dispatch = useDispatch()

  const setTaskmapFilters = () => {
    if (!statusDone) dispatch(taskFilterActions.setStatusDone(false))
    if (!statusNotStarted)
      dispatch(taskFilterActions.setStatusNotStarted(false))
    if (statusNotRequired)
      dispatch(taskFilterActions.setStatusNotRequired(true))
  }

  return (
    <CreateWorkstreamAdminDialog
      {...props}
      handleCloseDialog={props.closeHandler}
      setTaskmapFilters={setTaskmapFilters}
    />
  )
}

export default ProjectCreateContainer
