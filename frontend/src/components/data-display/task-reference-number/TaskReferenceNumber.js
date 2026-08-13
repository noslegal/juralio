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

import { mdiPound } from '@mdi/js'
import Icon from '@mdi/react'
import { Typography } from '@mui/material'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import { formatReferenceNumber } from '../../../services/task/task-text-format-service'
import juralioColours from '../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    minHeight: theme.spacing(1.5),
    maxHeight: theme.spacing(1.75),
    color: juralioColours.darkText.secondary,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    width: 'fit-content',
  },
  hashIcon: {
    marginTop: theme.spacing(),
    color: juralioColours.darkText.secondary,
  },
}))

const TaskReferenceNumber = props => {
  const { classes } = useStyles()
  const { task, index, compact, colour } = props
  const foreColourStyle = colour ? { color: colour } : {}
  const iconStyle = compact ? { marginTop: -1 } : { marginTop: -3 }

  if (!task) return null
  const referenceNumber = formatReferenceNumber(task, false)
  // N.B. The copy task url to clipboard feature relies on this component
  // structure. Retest if changes made to this component.
  if (referenceNumber.length === 0) {
    return null
  }
  return (
    <div
      className={classes.root}
      id="reference-number"
      data-task-id={task.id}
      data-task-reference-number={referenceNumber}
    >
      <span data-task-reference-number={referenceNumber}>
        <Icon
          path={mdiPound}
          size={0.5}
          className={classes.hashIcon}
          style={{ ...foreColourStyle, ...iconStyle }} // This allows clicking to trigger the parent div onClick Event.
        />
      </span>
      <span
        data-test={'task-item-referencenumber-' + index}
        data-task-reference-number={referenceNumber}
      >
        <Typography
          variant={compact ? 'caption' : 'body1'}
          style={foreColourStyle}
        >
          {referenceNumber}
        </Typography>
      </span>
    </div>
  )
}

export default TaskReferenceNumber
