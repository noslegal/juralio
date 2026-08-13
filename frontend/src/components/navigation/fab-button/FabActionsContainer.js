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
import { connect, useSelector } from 'react-redux'
import FabActions from './FabActions'

const FabActionsContainer = props => {
  const isMilestone = useSelector(state => state.selectedTask?.isMilestone)

  return (
    <FabActions
      open={props.open}
      mobile={props.mobile}
      closeHandler={props.closeHandler}
      user={props.user}
      anchor={props.anchor}
      isMilestone={isMilestone}
    />
  )
}

function mapStateToProps(state) {
  return {
    user: state.auth.data.details,
  }
}

FabActionsContainer.propTypes = {
  /** open */
  open: PropTypes.bool.isRequired,
  /** mobile */
  mobile: PropTypes.bool,
  /** closeHandler */
  closeHandler: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, null)(FabActionsContainer)
