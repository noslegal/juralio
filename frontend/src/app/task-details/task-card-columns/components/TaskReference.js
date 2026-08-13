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

import { Tooltip, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { withStyles } from 'tss-react/mui'
import { TASK_PATH_HEIGHT } from '../../../../components/data-display/task-path/TaskPath'
import TaskReferenceNumber from '../../../../components/data-display/task-reference-number/TaskReferenceNumber'
import { getTooltipText } from '../../../../components/icicle/common/render/update/interaction/reference-number-tooltip-helper'
import { sendTextToClipboard } from '../../../../services/clipboard/clipboard-service'
import { formatReferenceNumber } from '../../../../services/task/task-text-format-service'
import { JuralioNamedColours } from '../../../../theme/juralio-named-colours'

const styles = theme => ({
  root: {
    display: 'flex',
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
  taskTitle: { marginRight: theme.spacing() },
  taskReferenceNumber: { display: 'flex', alignItems: 'center' },
})

const referenceNumberClickHandler = () =>
  sendTextToClipboard(window.location.href.split('?')[0])

const pointerCursorStyle = { cursor: 'pointer' }

const TaskReference = props => {
  const { classes, task } = props
  const { t } = useTranslation()
  const dispatch = useDispatch()

  return (
    <div className={classes.root} data-test="task-card-top-bar">
      <div className={classes.headerLeft}>
        <div
          onClick={() => {
            referenceNumberClickHandler()
            dispatch(
              props.showSnackbarHandler(
                task.isMilestone
                  ? t('milestoneDetails.urlOfMilestoneCopiedToClipbard')
                  : t('taskDetails.urlOfTaskCopiedToClipbard')
              )
            )
          }}
          style={pointerCursorStyle}
        >
          <Tooltip
            title={
              <div>
                {formatReferenceNumber(task)} {getTooltipText(task, t)}
              </div>
            }
            placement={'top'}
          >
            <div className={classes.taskReferenceNumber}>
              <Typography
                variant="caption"
                className={classes.taskTitle}
                data-test="task-reference-text"
              >
                {task.level === 1
                  ? t('entity.phase')
                  : task.isMilestone
                    ? t('entity.milestone')
                    : task.isDeliverable
                      ? t('entity.deliverable')
                      : t('entity.subtask')}
              </Typography>
              <TaskReferenceNumber
                compact
                task={task}
                index={0}
                colour={JuralioNamedColours.black[200]}
              />
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

TaskReference.propTypes = {
  /** the matter Id */
  matterId: PropTypes.string,
  /** the task object */
  task: PropTypes.object.isRequired,
}

export default withStyles(TaskReference, styles)
