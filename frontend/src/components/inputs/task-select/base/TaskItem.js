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

import { Typography } from '@mui/material'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import { levelNumberToLetter } from '../../../../services/helpers/task/task-util-helper'
import { formatReferenceNumber } from '../../../../services/task/task-text-format-service'
import TaskReferenceNumber from '../../../data-display/task-reference-number/TaskReferenceNumber'

export const formatTaskItemPlainText = item =>
  item
    ? `${formatTaskLevelAndNamePlainText(item)} - ${formatReferenceNumber(
        item
      )}`
    : ''

const formatTaskLevelAndNamePlainText = item =>
  item ? `${levelNumberToLetter(item.level)}. ${item.name}` : ''

const useStyles = makeStyles()(() => ({
  root: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}))

export const TaskItem = props => {
  const { classes } = useStyles()
  const { item, index } = props

  return (
    <div className={classes.root} data-test="task-search-item">
      <Typography variant="body1" className={classes.taskName}>
        <span data-test={'task-item-name-' + index}>
          {formatTaskLevelAndNamePlainText(item)}
        </span>
      </Typography>
      <TaskReferenceNumber task={item} index={index} />
    </div>
  )
}
