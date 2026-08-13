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

import IconButton from '@mui/material/IconButton'
import React from 'react'
import { connect } from 'react-redux'
import { useNavigate } from 'react-router'
import { withStyles } from 'tss-react/mui'
import {
  getTaskDetailsUrl,
  getWorkstreamTaskPostUrl,
} from '../../../../../../components/navigation/common/location-context-helper'
import withRouter from '../../../../../../services/navigation/WithRouter'
import { JuralioNamedColours } from '../../../../../../theme/juralio-named-colours'
import { OpenInNewIcon } from '../../../../../../theme/navigation/CommonIcons'

const styles = theme => ({
  openTaskDetailsButton: {
    marginLeft: theme.spacing(1),
    color: JuralioNamedColours.black[200],
  },
})

const OpenInTaskDetailsButton = props => {
  const navigate = useNavigate()
  const openTaskDetails = () => {
    const url = props.post
      ? getWorkstreamTaskPostUrl(
          props.task.matterId,
          props.task.projectId,
          props.task.id,
          props.post.id
        )
      : getTaskDetailsUrl(
          props.task.matterId,
          props.task.projectId,
          props.task.id
        )
    navigate(url)
  }

  return (
    <IconButton
      className={props.classes.openTaskDetailsButton}
      onClick={openTaskDetails}
      data-test="open-task-details"
      size="small"
    >
      <OpenInNewIcon />
    </IconButton>
  )
}
const mapStateToProps = state => ({
  task: state.selectedTask,
})

export default connect(
  mapStateToProps,
  null
)(withRouter(withStyles(OpenInTaskDetailsButton, styles)))
