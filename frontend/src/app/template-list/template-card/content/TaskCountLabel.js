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

import Typography from '@mui/material/Typography'
import PropTypes from 'prop-types'
import React from 'react'
import { withStyles } from 'tss-react/mui'
import colorModifiers from '../../../../theme/color-modifiers'
import { TaskIcon } from '../../../../theme/navigation/CommonIcons'
import rawColours from '../../../../theme/raw-colours'

const styles = theme => ({
  root: {
    color: theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    paddingRight: theme.spacing(1),
    color: colorModifiers.secondaryBorder(rawColours.text.black),
  },
})

function TaskCountLabel(props) {
  return (
    <div className={props.classes.root}>
      <TaskIcon className={props.classes.icon} />
      <Typography data-test="task-count" variant="body1">
        {props.count}
      </Typography>
    </div>
  )
}

TaskCountLabel.propTypes = {
  /** count of tasks*/
  count: PropTypes.number.isRequired,
}

export default withStyles(TaskCountLabel, styles)
