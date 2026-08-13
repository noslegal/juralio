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
import { Chip, Tooltip } from '@mui/material'
import { TASK_STATUS } from '../../constants'
import dayjs from 'dayjs'
import rawColours from '../../../theme/raw-colours'
import { useTranslation } from 'react-i18next'

const ActiveDaysChip = props => {
  const { task, durationStart, durationEnd } = props
  const { t } = useTranslation()
  const startDate =
    task.status === TASK_STATUS.NOT_STARTED
      ? task.plannedStartDate?.replace('Z', '') || undefined
      : task.actualStartDate?.replace('Z', '') || undefined
  const endDate =
    task.status === TASK_STATUS.DONE
      ? task.actualEndDate?.replace('Z', '') || undefined
      : task.plannedEndDate?.replace('Z', '') || undefined
  const [colour, setColour] = useState()
  const [bgColour, setBgColour] = useState()
  const [label, setLabel] = useState('')
  const getLabel = () => {
    let startDateForCalc
    let endDateForCalc
    let displayString
    let startOutside = false
    let endOutside = false
    if (task.status === TASK_STATUS.DONE) {
      //check against both actual dates
      if (dayjs(task.actualStartDate).isBefore(dayjs(durationStart))) {
        startDateForCalc = durationStart
      } else {
        if (dayjs(task.actualStartDate).isAfter(dayjs(durationEnd))) {
          startOutside = true
        }
        startDateForCalc = task.actualStartDate
      }
      if (dayjs(task.actualEndDate).isAfter(dayjs(durationEnd))) {
        endDateForCalc = durationEnd
      } else {
        if (dayjs(task.actualEndDate).isBefore(dayjs(durationStart))) {
          endOutside = true
        }
        endDateForCalc = task.actualEndDate
      }
    } else if (task.status === TASK_STATUS.IN_PROGRESS) {
      //check against actual start and planned end
      if (dayjs(task.actualStartDate).isBefore(dayjs(durationStart))) {
        startDateForCalc = durationStart
      } else {
        if (dayjs(task.actualStartDate).isAfter(dayjs(durationEnd))) {
          startOutside = true
        }
        startDateForCalc = task.actualStartDate
      }
      if (task.plannedEndDate) {
        if (dayjs(task.plannedEndDate).isAfter(dayjs(durationEnd))) {
          endDateForCalc = durationEnd
        } else {
          if (dayjs(task.plannedEndDate).isBefore(dayjs(durationStart))) {
            endOutside = true
          }
          endDateForCalc = task.plannedEndDate
        }
      } else {
        endDateForCalc = durationEnd
      }
    } else {
      //check against both planned dates
      if (task.plannedStartDate) {
        if (dayjs(task.plannedStartDate).isBefore(dayjs(durationStart))) {
          startDateForCalc = durationStart
        } else {
          if (dayjs(task.plannedStartDate).isAfter(dayjs(durationEnd))) {
            startOutside = true
          }
          startDateForCalc = task.plannedStartDate
        }
      } else {
        startDateForCalc = durationStart
      }
      if (task.plannedEndDate) {
        if (dayjs(task.plannedEndDate).isAfter(dayjs(durationEnd))) {
          endDateForCalc = durationEnd
        } else {
          if (dayjs(task.plannedEndDate).isBefore(dayjs(durationStart))) {
            endOutside = true
          }
          endDateForCalc = task.plannedEndDate
        }
      } else {
        endDateForCalc = durationEnd
      }
    }
    //might cause issues if task dates are  exact same as duration dates
    if (
      (startOutside && endDateForCalc === durationEnd) ||
      (endOutside && startDateForCalc === durationStart)
    ) {
      displayString = '0'
      setColour(rawColours.primary.darkBlue.chip)
      setBgColour(rawColours.primary.white.costChip1)
    } else {
      setColour(rawColours.primary.green.dark)
      setBgColour(rawColours.primary.green.light)
      displayString =
        dayjs(dayjs(endDateForCalc)).diff(dayjs(startDateForCalc), 'day') + 1
      // if(displayString === 0){
      //   //because we use diff we need to make same day diffs 1
      //   displayString = 1
      // }
    }
    return displayString
  }

  useEffect(() => {
    setLabel(getLabel())
  }, [props.task]) //eslint-disable-line

  const isAssumed =
    (startDate === undefined || endDate === undefined) && Number(label) !== 0

  return (
    <div>
      <Tooltip
        title={
          <>
            {Number(label) === 0
              ? t('phaseDates.noDaysActive')
              : t('phaseDates.daysActive')}
            {isAssumed && <> {t('phaseDates.daysActiveAssumed')}</>}
          </>
        }
      >
        <Chip
          label={label}
          style={{
            color: colour,
            backgroundColor: bgColour,
            borderColor: colour,
          }}
          variant={'outlined'}
        />
      </Tooltip>
    </div>
  )
}
export default ActiveDaysChip
