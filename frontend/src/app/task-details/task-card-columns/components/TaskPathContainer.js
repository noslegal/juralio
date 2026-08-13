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
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { withStyles } from 'tss-react/mui'
import TaskPath, {
  TASK_PATH_HEIGHT,
} from '../../../../components/data-display/task-path/TaskPath'
import {
  getTaskDetailsUrl,
  getTemplateTaskDetailsUrl,
} from '../../../../components/navigation/common/location-context-helper'
import { TASK_STATUS } from '../../../constants'

const styles = theme => ({
  root: {
    display: 'flex',
    marginLeft: '-32px',
  },
  taskCardTopBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: TASK_PATH_HEIGHT,
    justifyContent: 'space-between',
    [theme.breakpoints.down('md')]: {
      flex: 1,
    },
  },
  levelNumber: {
    fontWeight: theme.typography.fontWeightBold,
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(),
    color: theme.palette.common.black,
    display: 'flex',
    textTransform: 'uppercase',
    width: '100%',
  },
  afterTaskPath: {
    height: '100%',
    display: 'flex',
    flex: 1,
    borderBottomRightRadius: theme.spacing(0.5),
    borderTopRightRadius: theme.spacing(0.5),
    alignItems: 'center',
    marginRight: theme.spacing(2),
  },
  taskReferenceNumber: { display: 'flex', alignItems: 'center' },
})

const TaskPathContainer = props => {
  const { classes, matterId, task, templateId, hideTaskPath } = props
  const history = useNavigate()
  const { t } = useTranslation()

  const onTaskPathItemClick = (props, task) => {
    history(
      templateId
        ? getTemplateTaskDetailsUrl(templateId, task.id)
        : getTaskDetailsUrl(matterId, props.task.projectId, task.id)
    )
  }

  const levelString = task => {
    if (task.level > 0 && task.level < 7) {
      return (
        String.fromCharCode(64 + task.level) +
        (task.isDeliverable
          ? t('taskDetails.deliverablePath')
          : task.isMilestone
            ? t('taskDetails.milestonePath')
            : task.level === 1
              ? t('taskDetails.phasePath')
              : t('taskDetails.taskPath'))
      )
    }
  }

  const taskLevelLetterStyle = {
    backgroundColor:
      props.task.status === TASK_STATUS.NOT_STARTED ||
      props.task.status === TASK_STATUS.NOT_STARTED_MILESTONE
        ? 'rgba(225, 222, 216, 0.5)'
        : 'rgba(255, 255, 255, 0.6)',
  }
  return (
    <div className={classes.root} data-test="task-card-top-bar">
      <div className={classes.headerLeft}>
        {!hideTaskPath && (
          <TaskPath
            task={task}
            onClick={(event, task) => onTaskPathItemClick(props, task)}
            textColour={'black'}
            usageContext="TaskCard"
            backgroundColour={
              props.task.status === TASK_STATUS.NOT_STARTED ||
              props.task.status === TASK_STATUS.NOT_STARTED_MILESTONE
                ? 'rgba(225, 222, 216, 0.5)'
                : 'rgba(255, 255, 255, 0.6)'
            }
          />
        )}
        {!hideTaskPath && (
          <div
            className={classes.afterTaskPath}
            data-test="task-header-jur-number-container"
            style={taskLevelLetterStyle}
          >
            <Typography
              className={classes.levelNumber}
              variant="overline"
              noWrap
              data-test="task-header-jur-number"
            >
              {levelString(task)}
            </Typography>
          </div>
        )}
      </div>
    </div>
  )
}

TaskPathContainer.propTypes = {
  /** the matter Id */
  matterId: PropTypes.string,
  /** the task object */
  task: PropTypes.object.isRequired,
}

export default withStyles(TaskPathContainer, styles)
