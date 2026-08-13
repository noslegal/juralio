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

import { Link } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { withStyles } from 'tss-react/mui'
import { levelNumberToLetter } from '../../../services/helpers/task/task-util-helper'
import ChevronGap, { CHEVRON_OPACITIES } from './ChevronGap'
import { TASK_PATH_HEIGHT } from './TaskPath'

const styles = theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  contentItem: {
    padding: theme.spacing(0.5),
    width: theme.spacing(2),
    height: TASK_PATH_HEIGHT,
    textAlign: 'center',
  },
  levelLetter: {
    color: theme.palette.common.black,
    fontWeight: theme.typography.fontWeightBold,
    cursor: 'pointer',
    lineHeight: `${TASK_PATH_HEIGHT}px`,
  },
})

const TaskPathItem = props => {
  return (
    <div data-test="task-path-item" className={props.classes.root}>
      <ChevronGap
        backgroundColour={props.backgroundColour}
        leftOpacity={CHEVRON_OPACITIES.faded}
        rightOpacity={CHEVRON_OPACITIES.faded}
      />
      <div
        className={props.classes.contentItem}
        style={{
          backgroundColor: props.backgroundColour,
          opacity: CHEVRON_OPACITIES.faded,
        }}
      >
        <Link
          onClick={event => props.onClick(event, props.task)}
          variant="caption"
          className={props.classes.levelLetter}
        >
          <div data-test="task-level-letter">
            {levelNumberToLetter(props.task.level)}
          </div>
        </Link>
      </div>
    </div>
  )
}

TaskPathItem.propTypes = {
  task: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  lastItemFlag: PropTypes.number.isRequired,
  usageContext: PropTypes.string,
  darkBackground: PropTypes.bool,
}

export default withStyles(TaskPathItem, styles)
