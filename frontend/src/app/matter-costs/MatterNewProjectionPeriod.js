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
import { makeStyles } from 'tss-react/mui'
import { Tooltip, Typography } from '@mui/material'
import dayjs from 'dayjs'
import CalendarPickerButton from './resource/CalendarPickerButton'

const useStyles = makeStyles()(theme => ({
  periodSelect: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(3),
    marginLeft: theme.spacing(2),
    display: 'grid',
    gridTemplateColumns: '40% 40% 20%',
  },
  periodSelectContainer: {
    width: '100%',
  },
  pickerLabel: {
    padding: theme.spacing(1),
  },
}))

const MatterNewProjectionPeriod = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const { startDate, setStartDate, endDate, setEndDate } = props
  const isDisabled = props.canSetStartDate || props.disableStart
  const endDisabled = props.disableEnd === true
  const hasPreviousProjection = props.hasPreviousProjection !== false
  const currentPeriodMonths = props.fullPeriod
    ? dayjs(props.fullPeriod?.endDate).diff(
        dayjs(props.fullPeriod?.startDate),
        'month'
      ) + 1
    : undefined
  const flatMonths =
    currentPeriodMonths !== undefined &&
    (currentPeriodMonths === 3 ||
      currentPeriodMonths === 6 ||
      currentPeriodMonths === 12)
      ? currentPeriodMonths
      : currentPeriodMonths === undefined
        ? 3
        : 0

  const [duration, setDuration] = useState(0)
  const [hasUpdatedValue, setHasUpdatedValue] = useState(false)

  // The start can never be earlier than the end of the previous projection.
  const startMinDate = (() => {
    const base =
      !props.allowExtendedStart && flatMonths === 0 && endDate
        ? dayjs(endDate).subtract(11, 'month')
        : null
    const prev = props.minStartDate ? dayjs(props.minStartDate) : null
    if (base && prev) return (base.isAfter(prev) ? base : prev).toDate()
    if (base) return base.toDate()
    if (prev) return prev.toDate()
    return undefined
  })()

  const getDuration = (startDate, endDate) => {
    if (startDate && endDate) {
      const d1 = dayjs(startDate)
      const d2 = dayjs(endDate)
      const diff = d2.diff(d1, 'month') + 1
      return diff.toString() + ' month'
    } else {
      return 0
    }
  }

  useEffect(() => {
    // When the start is locked (e.g. editing an existing period in live mode),
    // don't auto-normalise the end date — doing so would spuriously change the
    // loaded period and trigger an unnecessary save. Just reflect the duration.
    if (props.disableStart) {
      if (startDate && endDate) setDuration(getDuration(startDate, endDate))
      return
    }
    if (startDate && flatMonths > 0) {
      let end = dayjs(startDate).add(flatMonths - 1, 'months')
      setEndDate(
        dayjs(startDate)
          .add(flatMonths - 1, 'months')
          .endOf('month')
      )
      setDuration(getDuration(startDate, end))
    } else if (startDate && flatMonths === 0) {
      if (endDate) {
        setDuration(getDuration(startDate, endDate))
      }
    }
  }, [flatMonths, startDate]) // eslint-disable-line

  useEffect(() => {
    if (flatMonths === 0 && startDate) {
      setDuration(getDuration(startDate, endDate))
      if (!hasUpdatedValue) {
        setHasUpdatedValue(true)
      }
    }
  }, [endDate]) // eslint-disable-line

  return (
    <div className={classes.periodSelectContainer}>
      <div className={classes.periodSelect}>
        <div>
          <Typography className={classes.pickerLabel}>
            {t('matterCosts.newProjectionPeriod.startLabel')}
          </Typography>
          <Tooltip
            placement="bottom-start"
            title={
              isDisabled
                ? t('matterCosts.newProjectionPeriod.startDisabledTooltip')
                : ''
            }
          >
            <div>
              <CalendarPickerButton
                disabled={isDisabled}
                type={0}
                value={startDate}
                setValue={setStartDate}
                minDate={startMinDate}
                maxDate={
                  flatMonths === 0 && endDate
                    ? dayjs(endDate).toDate()
                    : undefined
                }
                nullText={t('matterCosts.newProjectionPeriod.startChoose')}
              />
            </div>
          </Tooltip>
        </div>

        <div>
          <Typography className={classes.pickerLabel}>
            {t('matterCosts.newProjectionPeriod.endLabel')}
          </Typography>
          <CalendarPickerButton
            type={1}
            disabled={endDisabled}
            value={dayjs(endDate).toDate()}
            setValue={setEndDate}
            minDate={startDate ? dayjs(startDate).toDate() : undefined}
            maxDate={
              startDate ? dayjs(startDate).add(11, 'month').toDate() : undefined
            }
            nullText={t('matterCosts.newProjectionPeriod.endChoose')}
            helperText={
              hasUpdatedValue
                ? t('matterCosts.newProjectionPeriod.helperMaximum')
                : hasPreviousProjection
                  ? t('matterCosts.newProjectionPeriod.helperBasedOnPrevious')
                  : ''
            }
          />
        </div>

        <div>
          <Typography variant="h3">
            <b>{parseInt(duration)}</b>
          </Typography>
          <Typography variant="body1">
            {parseInt(duration) === 1
              ? t('matterCosts.newProjectionPeriod.month')
              : t('matterCosts.newProjectionPeriod.months')}
          </Typography>
        </div>
      </div>
    </div>
  )
}
export default MatterNewProjectionPeriod
