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

import PropTypes from 'prop-types'
import React from 'react'
import { TaskIcon } from '../../../theme/navigation/CommonIcons'
import DestinationDialog from '../destination-dialog/DestinationDialog'

function TaskDestinationDialog(props) {
  return (
    <DestinationDialog
      titleText="Choose a destination for your new task"
      titleIcon={TaskIcon}
      closeHandler={props.cancelHandler}
      createHandler={props.createHandler}
      showLevelATaskOption={true}
      taskCreateFlow
      fullScreen={props.fullScreen}
      usageContext="TaskDestinationDialog"
      error={props.error}
      cancelText={props.cancelText}
      filterOutMilestones={true}
      showNotRequired={true}
    />
  )
}

TaskDestinationDialog.propTypes = {
  cancelHandler: PropTypes.func.isRequired,
  createHandler: PropTypes.func.isRequired,
}

export default TaskDestinationDialog
