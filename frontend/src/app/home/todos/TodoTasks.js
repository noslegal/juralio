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
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import TaskChip from '../../../components/data-display/task-chip/TaskChip'
import { getMatterOverviewUrl } from '../../../components/navigation/common/location-context-helper'
import colorModifiers from '../../../theme/color-modifiers'
import rawColours from '../../../theme/raw-colours'
import TodoAndRecentlyViewedZeroState from '../zero-state/TodoAndRecentlyViewedZeroState'

const style = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  matterDetailsRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: theme.spacing(0.5),
  },
  todoTaskWrapper: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  matterLink: {
    color: rawColours.primary.primary.main,
    maxWidth: '49%',
  },
  matterLinkText: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  matterLinkTextMobile: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    color: colorModifiers.primaryText(rawColours.primary.black.black),
  },
  pipe: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    color: colorModifiers.primaryText(rawColours.primary.black.black),
  },
  clientName: {
    color: colorModifiers.primaryText(rawColours.primary.black.black),
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    maxWidth: '49%',
  },
}))

const TodoTask = props => {
  const matters = useSelector(state => state.matters)
  const { classes } = style()

  const matter = matters.matters.find(
    matter => matter.id === props.task.matterId
  )
  if (!matter) {
    return null
  }
  return (
    <div className={classes.todoTaskWrapper} data-test="todo-item">
      <div className={classes.matterDetailsRow}>
        <Typography className={classes.clientName}>
          {matter.clientName}
        </Typography>
        <Typography className={classes.pipe}> | </Typography>
        {!props.isMobile && (
          <Link
            to={getMatterOverviewUrl(matter.id)}
            className={classes.matterLink}
          >
            <Typography className={classes.matterLinkText}>
              {matter.name}
            </Typography>
          </Link>
        )}
        {props.isMobile && (
          <Typography className={classes.matterLinkTextMobile}>
            {matter.name}
          </Typography>
        )}
      </div>
      <TaskChip
        context="todo"
        isLink={true}
        task={props.task}
        projectId={props.task.projectId}
        matterId={props.task.matterId}
        showOptions={false}
        showDates={true}
        showInteractions={false}
        closeHandler={props.handleOptionsUpdate}
        forceStartDateIfDueToday={props.forceStartDateIfDueToday}
      />
    </div>
  )
}

const TodoTasks = props => {
  const [wrapperHeight, setWrapperHeight] = useState(window.innerHeight - 230)
  const { tasks, handleOptionsUpdate, isMobile } = props
  window.addEventListener('resize', () => {
    setWrapperHeight(window.innerHeight - 140)
  })
  const { classes } = style()

  if (props.tasks.length === 0) {
    return (
      <TodoAndRecentlyViewedZeroState
        selectedRange={props.selectedRange}
        rangeEnums={props.rangeEnums}
        context={'todo'}
      />
    )
  }
  if (tasks[0] === null) return null

  return (
    <div
      className={classes.wrapper}
      style={{ maxHeight: `${wrapperHeight}px` }}
      data-test="todo-list"
    >
      {props.tasks.map(task => (
        <TodoTask
          key={task.id}
          task={task}
          handleOptionsUpdate={handleOptionsUpdate}
          isMobile={isMobile}
          forceStartDateIfDueToday={props.selectedRange === 1} //today
        />
      ))}
    </div>
  )
}

export default TodoTasks
