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
import { TASK_STATUS } from '../../../app/constants'
import {
  getStatusColour,
  getStatusColourLight,
} from '../../../services/helpers/task/task-status-colour-helper'

const style = makeStyles()(theme => ({
  wrapper: {
    width: '100%',
    height: '100%',
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
    marginTop: theme.spacing(0.5),
    display: 'flex',
    flexDirection: 'column',
  },
  cell: {
    borderRadius: theme.spacing(0.5),
    height: theme.spacing(2),
    width: theme.spacing(7),
    display: 'flex',
  },
  innerBar: {
    marginTop: theme.spacing(0.25),
    width: '50%',
    height: theme.spacing(0.25),
    marginLeft: theme.spacing(0.25),
    borderRadius: theme.spacing(),
  },
}))

const Cell = props => {
  const { classes } = style()

  return (
    <div
      className={classes.cell}
      style={{
        backgroundColor: props.colour,
        position: 'relative',
        top: props.y,
        left: props.x,
        height: props.height,
        width: props.width,
      }}
    >
      <div
        className={classes.innerBar}
        style={{
          backgroundColor: props.darkColour,
        }}
      ></div>
    </div>
  )
}

const SplitImage = () => {
  const { classes } = style()
  return (
    <div className={classes.wrapper}>
      <Cell
        colour={getStatusColourLight(TASK_STATUS.IN_PROGRESS)}
        darkColour={getStatusColour(TASK_STATUS.IN_PROGRESS)}
        x={5}
        y={5}
        width={'30px'}
        height={'30px'}
      />
      <Cell
        colour={getStatusColourLight(TASK_STATUS.DONE)}
        darkColour={getStatusColour(TASK_STATUS.DONE)}
        x={40}
        y={-20}
        width={'30px'}
        height={'14px'}
      />
      <Cell
        colour={getStatusColourLight(TASK_STATUS.IN_PROGRESS)}
        darkColour={getStatusColour(TASK_STATUS.IN_PROGRESS)}
        x={40}
        y={-18}
        width={'30px'}
        height={'14px'}
      />
      <Cell
        colour={getStatusColourLight(TASK_STATUS.DONE)}
        darkColour={getStatusColour(TASK_STATUS.DONE)}
        x={5}
        y={0}
        width={'30px'}
        height={'30px'}
      />
      <Cell
        colour={getStatusColourLight(TASK_STATUS.DONE)}
        darkColour={getStatusColour(TASK_STATUS.DONE)}
        x={40}
        y={-25}
        width={'30px'}
        height={'8px'}
      />
      <Cell
        colour={getStatusColourLight(TASK_STATUS.DONE)}
        darkColour={getStatusColour(TASK_STATUS.DONE)}
        x={40}
        y={-22}
        width={'30px'}
        height={'8px'}
      />
      <Cell
        colour={getStatusColourLight(TASK_STATUS.DONE)}
        darkColour={getStatusColour(TASK_STATUS.DONE)}
        x={40}
        y={-19}
        width={'30px'}
        height={'8px'}
      />
    </div>
  )
}

export default SplitImage
