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

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { TASK_STATUS, DATE_VARIABLES } from '../../constants'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { cloneDeep } from 'lodash'
import DateField from '../../../components/inputs/date-field/DateField'
import { updateTaskDetails } from '../../task-map/selected-task/selected-task-actions'
import ConfirmDateTimeChangeContainer from '../../task-details/task-card-content/TaskDates/ConfirmDateTimeChangeContainer'

dayjs.extend(utc)
dayjs.extend(timezone)

const PhaseDateCell = ({
  task: initialTask,
  dateType,
  matterId,
  allTasks,
  taskIndex,
  setTasks,
  flatTaskList,
}) => {
  const [task, setTask] = useState(initialTask)

  useEffect(() => {
    setTask(initialTask)
  }, [initialTask])
  const [showConfirmDateDialog, setShowConfirmDateDialog] = useState(false)
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const projectId = task.projectId

  const getDateValue = date => (date ? date : undefined)
  const startDate =
    task.status === TASK_STATUS.NOT_STARTED
      ? getDateValue(task.plannedStartDate?.replace('Z', ''))
      : getDateValue(task.actualStartDate?.replace('Z', ''))
  const endDate =
    task.status === TASK_STATUS.DONE
      ? getDateValue(task.actualEndDate?.replace('Z', ''))
      : getDateValue(task.plannedEndDate?.replace('Z', ''))

  const updateDate = (dateName, date) => {
    let _d = date
    let newDate
    if (date) {
      newDate = dayjs(
        new Date(date.getFullYear(), date.getMonth(), date.getDate())
      ).utc(true)
    } else {
      newDate = dayjs(date)
    }
    if (dateName === DATE_VARIABLES.PLANNED_START_DATE) {
      newDate = newDate.startOf('day')
    }
    if (dateName === DATE_VARIABLES.PLANNED_END_DATE) {
      newDate = newDate.endOf('day')
    }
    if (date) {
      _d = newDate.toDate()
    }
    return dispatch(
      updateTaskDetails(
        matterId,
        projectId,
        task.id,
        {
          [dateName]: _d ? _d.toISOString() : _d,
          dateCleared: _d === null,
        },
        false
      )
    ).then(res => {
      if (res.task !== undefined) {
        setTask(res.task)
        let updatedTasks = cloneDeep(allTasks)
        updatedTasks[taskIndex] = res.task
        setTasks(updatedTasks)
        return true
      }
      return false
    })
  }

  const isStart = dateType === DATE_VARIABLES.START
  const fullType = isStart
    ? task.status === TASK_STATUS.NOT_STARTED
      ? DATE_VARIABLES.PSD
      : DATE_VARIABLES.ASD
    : task.status === TASK_STATUS.DONE
      ? DATE_VARIABLES.AED
      : DATE_VARIABLES.PED

  const dateValue = isStart ? startDate : endDate

  const dateName = isStart
    ? task.status === TASK_STATUS.NOT_STARTED
      ? DATE_VARIABLES.PLANNED_START_DATE
      : DATE_VARIABLES.ACTUAL_START_DATE
    : task.status === TASK_STATUS.DONE
      ? DATE_VARIABLES.ACTUAL_END_DATE
      : DATE_VARIABLES.PLANNED_END_DATE

  return (
    <>
      <DateField
        task={task}
        dateType={dateType}
        fullType={fullType}
        onChange={date => {
          updateDate(dateName, date).then(success => {
            if (success) {
              setShowConfirmDateDialog(true)
            }
          })
        }}
        t={t}
        viewOnly={false}
        hideIcon={true}
        hideHeader={true}
        value={dateValue}
        disabled={false}
      />
      {showConfirmDateDialog && (
        <ConfirmDateTimeChangeContainer
          matterId={matterId}
          projectId={projectId}
          tasks={flatTaskList}
          task={task}
          onCancel={() => setShowConfirmDateDialog(false)}
          isOOC={true}
          setTask={setTask}
          allTasks={allTasks}
          setTasks={setTasks}
          taskIndex={taskIndex}
        />
      )}
    </>
  )
}

export default PhaseDateCell
