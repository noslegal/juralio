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
import { withTranslation } from 'react-i18next'
import { connect, useSelector } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  closeConfirmationDialog,
  updateTaskDetails,
} from '../../../task-map/selected-task/selected-task-actions'
import ConfirmDateTimeChange from './ConfirmDateTimeChange'
import { isInRoadmapContext } from '../../../../services/helpers/route/route-context-helper'

const ConfirmDateTimeChangeContainer = props => {
  const dateChange = useSelector(state => state.dateChange)
  const [consitencyBody, setConsistencyBody] = useState(
    props.dateChange.dateChangeConsistency?.body
  )
  useEffect(() => {
    setConsistencyBody(dateChange?.dateChangeConsistency?.body)
  }, [dateChange])

  const task = props.task || props.selectedTask

  useEffect(
    () => {
      if (consitencyBody?.length === 0) {
        props.actions.confirmHandler(
          props.matterId,
          props.projectId,
          task.id,
          props.dateChange.dateChangePayload,
          true,
          props.inTaskmap,
          true
        )
      }
    },
    //eslint-disable-next-line
    [consitencyBody]
  )
  if (consitencyBody?.length === 0) {
    return null
  } else {
    return (
      <ConfirmDateTimeChange
        {...props}
        task={task}
        closeDialog={() => {
          props.onCancel()
          props.actions.closeDialog()
        }}
      />
    )
  }
}

function mapStateToProps(state) {
  return {
    dateChange: state.dateChange,
    selectedTask:
      state.taskmap.selectedTask && !isInRoadmapContext()
        ? state.taskmap.selectedTask
        : state.selectedTask,
    inTaskmap: state.taskmap.selectedTask !== null,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      closeDialog: bindActionCreators(closeConfirmationDialog, dispatch),
      confirmHandler: bindActionCreators(updateTaskDetails, dispatch),
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(ConfirmDateTimeChangeContainer))
