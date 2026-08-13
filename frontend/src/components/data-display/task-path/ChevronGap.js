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
import { makeStyles } from 'tss-react/mui'
import { TASK_PATH_HEIGHT } from './TaskPath'

export const useStyles = makeStyles()(theme => ({
  chevronGap: {
    display: 'flex',
    alignItems: 'center',
  },
  leadingTriangle: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: `${TASK_PATH_HEIGHT / 2}px 0 ${TASK_PATH_HEIGHT / 2}px 8px`,
    borderColor: 'transparent transparent transparent #FF0000',
    marginRight: -4,
  },
  topRightTriangle: {
    position: 'absolute',
    top: -TASK_PATH_HEIGHT / 2,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: `0 8px ${TASK_PATH_HEIGHT / 2}px 0`,
    borderColor: 'transparent #FF0000 transparent transparent',
  },
  bottomRightTriangle: {
    position: 'absolute',
    bottom: -TASK_PATH_HEIGHT / 2,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: `0 0 ${TASK_PATH_HEIGHT / 2}px 8px`,
    borderColor: 'transparent transparent #FF0000 transparent',
  },
  trailingTriangleContainer: {
    height: '100%',
    width: 8,
    position: 'relative',
  },
}))

export const CHEVRON_OPACITIES = {
  full: 1.0,
  faded: 0.6,
}

const ChevronGap = props => {
  const { backgroundColour } = props
  const { classes } = useStyles()

  return (
    <div className={classes.chevronGap}>
      <div
        className={classes.leadingTriangle}
        style={{
          borderColor: `transparent transparent transparent ${backgroundColour}`,
          opacity: props.leftOpacity,
        }}
      />
      <div className={classes.trailingTriangleContainer}>
        <div
          className={classes.topRightTriangle}
          style={{
            borderColor: `transparent ${backgroundColour} transparent transparent`,
            opacity: props.rightOpacity,
          }}
        />
        <div
          className={classes.bottomRightTriangle}
          style={{
            borderColor: `transparent transparent ${backgroundColour} transparent`,
            opacity: props.rightOpacity,
          }}
        />
      </div>
    </div>
  )
}

export default ChevronGap
