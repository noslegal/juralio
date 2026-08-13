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
import { makeStyles } from 'tss-react/mui'
import { TASK_MAP } from '../../../app/constants'
import juralioColours from '../../../theme/juralio-colours'
import Arrow from './Arrow'
import {
  getArrowTypeForBlandArrow,
  getArrowTypeForHighlightedArrow,
} from './level-indicator-helper'

export const TASK_PATH_HEIGHT = 24

const style = makeStyles()(theme => ({
  root: {
    display: 'flex',
    height: '16px',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
}))

const LevelIndicator = props => {
  const { classes } = style()
  const { totalNumberOfTasks, taskLevelToHighlight } = props

  if (taskLevelToHighlight > totalNumberOfTasks) {
    return 'Error: taskLevelToHighlight cannot be > totalNumberOfTasks'
  }
  if (
    taskLevelToHighlight < 1 ||
    taskLevelToHighlight > TASK_MAP.MAX_TASK_DEPTH
  )
    return `Error: Can only show between 1 and ${TASK_MAP.MAX_TASK_DEPTH} tasks, inclusive`

  const darkColour = juralioColours.named.black.main
  const lightColour = juralioColours.named.black[100]
  let arrowPos = 0

  const renderDarkArrow = () => {
    arrowPos += 1
    return (
      <Arrow
        arrowType={getArrowTypeForHighlightedArrow(
          taskLevelToHighlight,
          totalNumberOfTasks
        )}
        arrowColour={darkColour}
        nextArrowColour={lightColour}
        levelNumber={taskLevelToHighlight}
      />
    )
  }

  const renderSmallArrows = n =>
    [...Array(n).keys()].map((d, arrowPosition) => {
      arrowPos += 1
      return (
        <Arrow
          key={arrowPos}
          arrowType={getArrowTypeForBlandArrow(arrowPos, totalNumberOfTasks)}
          arrowColour={lightColour}
          nextArrowColour={lightColour}
        />
      )
    })
  return (
    <div
      className={classes.root}
      data-test={`level-inidcator-level-${taskLevelToHighlight}`}
    >
      {renderSmallArrows(taskLevelToHighlight - 1)}
      {renderDarkArrow()}
      {renderSmallArrows(
        taskLevelToHighlight > 1
          ? totalNumberOfTasks - taskLevelToHighlight
          : totalNumberOfTasks - 1
      )}
    </div>
  )
}

LevelIndicator.propTypes = {
  totalNumberOfTasks: PropTypes.number,
  taskLevelToHighlight: PropTypes.number,
}

export default LevelIndicator
