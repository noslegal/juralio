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
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import TaskDatePicker from '../../components/inputs/task-date-picker/TaskDatePicker'
import { DateLinkingIcon } from '../../theme/navigation/CommonIcons'
import rawColours from '../../theme/raw-colours'
import { TASK_STATUS } from '../constants'
import { useDateSelector } from './task-hooks'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  spacer: {
    width: theme.spacing(1.5),
  },
  icon: {
    marginLeft: theme.spacing(1),
    color: rawColours.primary.black.black,
  },
}))

const TaskDatePickers = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const {
    isTaskLinked,
    taskStatus,
    taskId,
    psd,
    ped,
    asd,
    aed,
    showDatePicker,
    isMilestone,
  } = props

  const [startDate, endDate] = useDateSelector(taskStatus, psd, ped, asd, aed)
  return (
    <div className={classes.root}>
      {!isMilestone && (
        <TaskDatePicker
          disabled={props.viewOnly}
          label={
            startDate &&
            (taskStatus === TASK_STATUS.NOT_STARTED
              ? t('taskDates.dueToStart')
              : t('taskDates.startedOn'))
          }
          buttonLabel={t('taskDates.prompts.setPlannedStartDate')}
          taskId={taskId}
          date={startDate?.replace('Z', '')}
          showDatePicker={showDatePicker}
          dateType={'start'}
          taskStatus={taskStatus}
          viewOnly={props.viewOnly}
        />
      )}

      <div className={classes.spacer} />

      <TaskDatePicker
        disabled={props.viewOnly}
        label={
          isMilestone && taskStatus === TASK_STATUS.DONE
            ? t('taskMapDates.milestoneEnd')
            : isMilestone && taskStatus === TASK_STATUS.NOT_STARTED
              ? t('taskMapDates.milestonePlan')
              : endDate &&
                (taskStatus === TASK_STATUS.DONE
                  ? t('taskDates.ended')
                  : t('taskDates.dueToEnd'))
        }
        buttonLabel={t('taskDates.prompts.setPlannedEndDate')}
        taskId={taskId}
        date={endDate?.replace('Z', '')}
        showDatePicker={showDatePicker}
        dateType={'end'}
        taskStatus={taskStatus}
        viewOnly={props.viewOnly}
      />
      {isTaskLinked && <DateLinkingIcon className={classes.icon} />}
    </div>
  )
}

export default TaskDatePickers
