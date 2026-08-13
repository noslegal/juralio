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
import {
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  styled,
} from '@mui/material'
import CalendarPickerButton from './CalendarPickerButton'
import rawColours from '../../../theme/raw-colours'
import dayjs from 'dayjs'

const useStyles = makeStyles()(theme => ({
  periodSelect: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(3),
    marginLeft: theme.spacing(2),
    display: 'grid',
    gridTemplateColumns: '40% 40% 20%',
  },
  toggleButtonContainer: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(3),
  },
  periodSelectContainer: {
    width: '100%',
  },
  durationContainer: {},
}))

const StyledToggleButton = styled(ToggleButton)({
  textTransform: 'none',
  '&.Mui-selected, &.Mui-selected:hover': {
    color: 'white',
    backgroundColor: rawColours.primary.black[200],
  },
})

const MatterProjectionPeriod = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const { startDate, setStartDate, endDate, setEndDate } = props
  const currentPeriodMonths = props.fullPeriod
    ? dayjs(props.fullPeriod?.endDate).diff(
        dayjs(props.fullPeriod?.startDate),
        'month'
      ) + 1
    : undefined
  const [flatMonths, setFlatMonths] = useState(
    currentPeriodMonths !== undefined &&
      (currentPeriodMonths === 3 ||
        currentPeriodMonths === 6 ||
        currentPeriodMonths === 12)
      ? currentPeriodMonths
      : currentPeriodMonths === undefined
        ? 3
        : 0
  )
  const [duration, setDuration] = useState(0)

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
    }
  }, [endDate]) // eslint-disable-line

  return (
    <div className={classes.periodSelectContainer}>
      <Divider />
      <div className={classes.toggleButtonContainer}>
        <ToggleButtonGroup
          value={flatMonths}
          exclusive
          onChange={e => {
            if (e.target.value === '0') {
              setDuration(0)
            }
            setFlatMonths(parseInt(e.target.value))
          }}
        >
          <StyledToggleButton value={3}>3 Months</StyledToggleButton>
          <StyledToggleButton value={6}>6 Months</StyledToggleButton>
          <StyledToggleButton value={12}>12 Months</StyledToggleButton>
          <StyledToggleButton value={0}>Custom</StyledToggleButton>
        </ToggleButtonGroup>
      </div>
      <Divider />
      <div className={classes.periodSelect}>
        <div>
          <Typography style={{ padding: '8px' }}>
            {t('Starting from the first day of:')}
          </Typography>
          <CalendarPickerButton
            disabled={!props.canEditStartDate}
            type={0}
            value={dayjs(startDate).toDate()}
            defualtValue={startDate ? startDate : endDate}
            setValue={setStartDate}
            minDate={
              flatMonths === 0 && endDate
                ? dayjs(endDate).subtract(11, 'month').toDate()
                : undefined
            }
            maxDate={
              flatMonths === 0 && endDate ? dayjs(endDate).toDate() : undefined
            }
            nullText={'Choose a start month'}
          />
        </div>

        {flatMonths === 0 && (
          <>
            <div>
              <Typography style={{ padding: '8px' }}>
                {t('Until the last day of:')}
              </Typography>
              <CalendarPickerButton
                type={1}
                value={dayjs(endDate).toDate()}
                defualtValue={endDate ? endDate : dayjs(startDate).toDate()}
                setValue={setEndDate}
                minDate={startDate ? dayjs(startDate).toDate() : undefined}
                maxDate={
                  startDate
                    ? dayjs(startDate).add(11, 'month').toDate()
                    : undefined
                }
                nullText={'Choose an end month'}
                helperText={'Maximum of 12 Months'}
              />
            </div>

            <div className={classes.durationContainer}>
              <Typography variant="h3">
                <b>{parseInt(duration)}</b>
              </Typography>
              <Typography variant="body1">
                {parseInt(duration) === 1 ? 'Month' : 'Months'}
              </Typography>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
export default MatterProjectionPeriod
