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
import PropTypes from 'prop-types'

import DestinationDialog from '../destination-dialog/DestinationDialog'
import MilestoneIcon from '../../../assets/images/JurMilestone'

function MilestoneDestinationDialog(props) {
  return (
    <DestinationDialog
      titleText="Choose a destination for your new milestone"
      titleIcon={MilestoneIcon}
      closeHandler={props.cancelHandler}
      createHandler={props.createHandler}
      showLevelATaskOption={true}
      taskCreateFlow
      fullScreen={props.fullScreen}
      usageContext="MilestoneDestinationDialog"
      error={props.error}
      cancelText={props.cancelText}
      isMilestone={true}
      filterOutMilestones={true}
      showNotRequired={true}
    />
  )
}

MilestoneDestinationDialog.propTypes = {
  cancelHandler: PropTypes.func.isRequired,
  createHandler: PropTypes.func.isRequired,
}

export default MilestoneDestinationDialog
