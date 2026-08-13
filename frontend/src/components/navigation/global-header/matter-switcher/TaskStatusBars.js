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

import { useTranslation } from 'react-i18next'
import { Tooltip } from '@mui/material'
import juralioColours from '../../../../theme/juralio-colours'
import { makeStyles } from 'tss-react/mui'
const style = makeStyles()(theme => ({
  taskStatusBarsContainer: {
    display: 'flex',
    width: theme.spacing(35),
    height: theme.spacing(1),
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  masonryTaskStatusBarContainer: {
    display: 'flex',
    width: '100%',
    height: theme.spacing(1),
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  taskStatusBarNotStarted: {
    backgroundColor: juralioColours.taskStatus.filteredIn.notStarted,
    height: theme.spacing(1),
    border: '1px solid #989390',
  },
  taskStatusBarInProgress: {
    backgroundColor: juralioColours.taskStatus.filteredIn.inProgress,
    height: theme.spacing(1),
    border: '1px solid #989390',
  },
  taskStatusBarDone: {
    backgroundColor: juralioColours.taskStatus.filteredIn.done,
    height: theme.spacing(1),
    border: '1px solid #989390',
  },
}))

const TaskStatusBars = props => {
  const { classes } = style()
  let taskCount = props.taskCount
  const { t } = useTranslation()
  const statusBar = (count, status, t, width, styleClass) => {
    return (
      <Tooltip
        title={
          `${count} ${status} ` +
          (count > 1 ? t('common.tasks') : t('common.task')).toLowerCase()
        }
      >
        <div
          className={styleClass}
          style={{
            width: `${width}`,
          }}
        />
      </Tooltip>
    )
  }

  const getTaskStatusBars = () => {
    const statusBarWidth = 280
    if (!props.workstream.taskCounts || taskCount === 0) {
      return null
    }

    const getWidth = pcent => {
      if (props.masonry) {
        return `${pcent * 100}%`
      } else {
        return `${pcent * statusBarWidth}px`
      }
    }

    return (
      <div
        className={
          props.masonry
            ? classes.masonryTaskStatusBarContainer
            : classes.taskStatusBarsContainer
        }
        id="workstream-chip-status-bar"
        data-test="workstream-chip-status-bar"
      >
        {props.workstream.taskCounts.notStartedCount > 0 &&
          statusBar(
            props.workstream.taskCounts.notStartedCount,
            t('taskStatus.not-started'),
            t,
            getWidth(props.workstream.taskCounts.notStartedCount / taskCount),
            classes.taskStatusBarNotStarted
          )}
        {props.workstream.taskCounts.inProgressCount > 0 &&
          statusBar(
            props.workstream.taskCounts.inProgressCount,
            t('taskStatus.in-progress'),
            t,
            getWidth(props.workstream.taskCounts.inProgressCount / taskCount),
            classes.taskStatusBarInProgress
          )}
        {props.workstream.taskCounts.doneCount > 0 &&
          statusBar(
            props.workstream.taskCounts.doneCount,
            t('taskStatus.done'),
            t,
            getWidth(props.workstream.taskCounts.doneCount / taskCount),
            classes.taskStatusBarDone
          )}
      </div>
    )
  }
  return getTaskStatusBars()
}

export default TaskStatusBars
