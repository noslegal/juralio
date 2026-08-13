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

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  Tooltip,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton'
import { PickerDay as PickersDay } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { DATE_TYPES, DATE_VARIABLES, TASK_STATUS } from '../../../app/constants'
import taskService from '../../../services/task/task-service'
import colorModifiers from '../../../theme/color-modifiers'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'

import isBetweenPlugin from 'dayjs/plugin/isBetween'
dayjs.extend(isBetweenPlugin)
const styles = makeStyles()(theme => ({
  dialogMain: {
    backgroundColor: rawColours.primary.primary.main,
    color: juralioColours.whiteText.primary,
  },
  dialogText: {
    backgroundColor: rawColours.primary.primary.main,
    color: juralioColours.whiteText.primary,
    textAlign: 'center',
    paddingTop: '16px',
  },
  dialogBody: {
    backgroundColor: rawColours.primary.primary.main,
  },
  dialogButtons: {
    backgroundColor: rawColours.primary.primary.main,
    color: juralioColours.whiteText.primary,
    '&:hover': {
      backgroundColor: colorModifiers.hover(rawColours.primary.blue.light),
      color: juralioColours.whiteText.primary,
    },
  },
}))

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: prop =>
    prop !== 'dayIsBetween' &&
    prop !== 'isFirstDay' &&
    prop !== 'isLastDay' &&
    prop !== 'isStartOfWeek' &&
    prop !== 'isEndOfWeek' &&
    prop !== 'isStart',
})(
  ({
    theme,
    dayIsBetween,
    isFirstDay,
    isLastDay,
    isStartOfWeek,
    isEndOfWeek,
    isStart,
  }) => ({
    ...(dayIsBetween && {
      borderRadius: 0,
      backgroundColor: `${theme.palette.primary.light} !important`,
      color: theme.palette.common.white,
      '&:hover, &:focus': {
        backgroundColor: `${theme.palette.primary.dark} !important`,
      },
    }),

    ...(isStartOfWeek && {
      borderTopLeftRadius: '50%',
      borderBottomLeftRadius: '50%',
    }),
    ...(isEndOfWeek && {
      borderTopRightRadius: '50%',
      borderBottomRightRadius: '50%',
    }),
    ...(isFirstDay && {
      border: !isStart ? 'unset !important' : '',

      backgroundColor: !isStart
        ? `${theme.palette.primary.light} !important`
        : `${theme.palette.primary.main} !important`,
      borderTopLeftRadius: '50%',
      borderBottomLeftRadius: '50%',
    }),
    ...(isLastDay && {
      border: isStart ? 'unset !important' : '',

      backgroundColor: isStart
        ? `${theme.palette.primary.light} !important`
        : `${theme.palette.primary.main} !important`,
      borderTopRightRadius: '50%',
      borderBottomRightRadius: '50%',
    }),
  })
)

const DatePicker = props => {
  const { classes } = styles()
  const { t } = useTranslation()
  const { dateType, inTaskDetails, error } = props
  const [minDate, setMinDate] = useState(props.minDate)
  const [maxDate, setMaxDate] = useState(
    props.maxDate && new Date(props.maxDate) < 4102444800000
      ? props.maxDate
      : undefined
  )
  const [earliestProblem, setEarliestProblem] = useState()
  const [latestProblem, setLatestProblem] = useState()
  const [showOpen, setShowOpen] = useState(props.isOpen)
  const [isLoading, setIsLoading] = useState(false)
  const [fullDateType, setFullDateType] = useState('')
  const [initialValue, setInitialValue] = useState(null)
  const [hasBothDates, setHasBothDates] = useState(false)
  const [dateDifference, setDateDifference] = useState()
  const [selectedTask] = useState(props.selectedTask)
  useEffect(() => {
    setMinDate(props.minDate)
  }, []) //eslint-disable-line
  //test fix need to ensure this does not break other parts
  useEffect(() => {
    setMaxDate(
      props.maxDate && new Date(props.maxDate) < 4102444800000
        ? props.maxDate
        : undefined
    )
  }, [props.maxDate])

  function Arrow(props, arrowType = 'left') {
    return (
      <Tooltip
        title={
          arrowType === 'right'
            ? 'All future dates are unavailable'
            : 'All prior dates are unavailable'
        }
        disableFocusListener={!props.disabled}
        disableHoverListener={!props.disabled}
        disableTouchListener={!props.disabled}
        slotProps={{
          popper: { style: { zIndex: 10002 } },
        }}
      >
        <div>
          <Button
            data-test={
              arrowType === 'right'
                ? 'date-picker-next-month'
                : 'date-picker-prev-month'
            }
            onClick={props.onClick}
            size={props.size}
            title={props.title}
            disabled={props.disabled}
            className={props.className}
            style={{
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              minWidth: '40px',
            }}
          >
            {arrowType === 'left' && (
              <KeyboardArrowLeftIcon
                style={{
                  fill: props.disabled
                    ? 'rgba(0, 0, 0, 0.26)'
                    : 'rgba(0, 0, 0, 0.54)',
                }}
              />
            )}
            {arrowType === 'right' && (
              <KeyboardArrowRightIcon
                style={{
                  fill: props.disabled
                    ? 'rgba(0, 0, 0, 0.26)'
                    : 'rgba(0, 0, 0, 0.54)',
                }}
              />
            )}
          </Button>
        </div>
      </Tooltip>
    )
  }

  function ServerDay(props) {
    const { day, outsideCurrentMonth, ...other } = props
    const startOfWeek = dayjs(day).startOf('week')
    const endOfWeek = dayjs(day).endOf('week')
    let startTemp = dayjs()
    if (inTaskDetails) {
      if (fullDateType === DATE_TYPES.ACTUAL_START) {
        startTemp = dayjs(
          selectedTask.actualStartDate?.replace('Z', '')
        ).startOf('day')
      } else if (fullDateType === DATE_TYPES.PLANNED_START) {
        startTemp = dayjs(selectedTask.plannedStartDate?.replace('Z', ''))
      } else {
        if (fullDateType === DATE_TYPES.PLANNED_END) {
          if (selectedTask.actualStartDate) {
            startTemp = selectedTask.actualEndDate
              ? dayjs(selectedTask.plannedStartDate?.replace('Z', '')).startOf(
                  'day'
                )
              : dayjs(selectedTask.actualStartDate?.replace('Z', '')).startOf(
                  'day'
                )
          } else {
            startTemp = dayjs(
              selectedTask.plannedStartDate?.replace('Z', '')
            ).startOf('day')
          }
        } else {
          startTemp = dayjs(
            selectedTask.actualStartDate?.replace('Z', '')
          ).startOf('day')
        }
      }
    } else {
      startTemp = selectedTask.actualStartDate
        ? dayjs(selectedTask.actualStartDate?.replace('Z', '')).startOf('day')
        : dayjs(selectedTask.plannedStartDate?.replace('Z', '')).startOf('day')
    }
    const start = startTemp
    let endTemp = dayjs()
    if (inTaskDetails) {
      if (fullDateType === DATE_TYPES.ACTUAL_END) {
        endTemp = dayjs(selectedTask.actualEndDate?.replace('Z', '')).endOf(
          'day'
        )
      } else if (fullDateType === DATE_TYPES.PLANNED_END) {
        endTemp = dayjs(selectedTask.plannedEndDate?.replace('Z', ''))
      } else {
        if (fullDateType === DATE_TYPES.ACTUAL_START) {
          endTemp = selectedTask.actualEndDate
            ? dayjs(selectedTask.actualEndDate?.replace('Z', '')).endOf('day')
            : dayjs(selectedTask.plannedEndDate?.replace('Z', ''))
        } else {
          endTemp = dayjs(selectedTask.plannedEndDate?.replace('Z', ''))
        }
      }
    } else {
      endTemp = selectedTask.actualEndDate
        ? dayjs(selectedTask.actualEndDate?.replace('Z', '')).endOf('day')
        : dayjs(selectedTask.plannedEndDate?.replace('Z', ''))
    }

    let end = endTemp
    const dayIsBetween = dayjs(day).isBetween(start, end, null, '[]')
    const isFirstDay = dayjs(day).isSame(start, 'day')
    const isLastDay = dayjs(day).isSame(end, 'day')
    const isStartOfWeek = dayjs(day).isSame(startOfWeek, 'day')
    const isEndOfWeek = dayjs(day).isSame(endOfWeek, 'day')

    let isProblemDay = false
    let thisDay = dayjs(props.day)
    thisDay = thisDay.hour(0)
    thisDay = thisDay.minute(0)
    thisDay = thisDay.second(0)
    if (dateType === DATE_VARIABLES.START && earliestProblem) {
      isProblemDay =
        !outsideCurrentMonth &&
        thisDay.toDate() > dayjs(earliestProblem).toDate()
    } else if (dateType === DATE_VARIABLES.END && latestProblem) {
      isProblemDay =
        !outsideCurrentMonth && thisDay.toDate() < dayjs(latestProblem).toDate()
    }

    const isOutsideMinMaxRange =
      !outsideCurrentMonth &&
      ((maxDate &&
        thisDay.endOf('day').toDate() > dayjs(maxDate).endOf('day').toDate()) ||
        (minDate &&
          thisDay.startOf('day').toDate() <
            dayjs(minDate).startOf('day').toDate()))

    if (isOutsideMinMaxRange) {
      let title = ''
      if (
        (fullDateType === DATE_TYPES.ACTUAL_START &&
          dayjs(thisDay).toDate() > dayjs(new Date()).toDate()) ||
        (fullDateType === DATE_TYPES.ACTUAL_END &&
          dayjs(thisDay).toDate() > dayjs(new Date()).toDate())
      ) {
        title = t('taskDatesDialog.actualDatesLimit')
      } else if (maxDate && thisDay.toDate() > dayjs(maxDate).toDate()) {
        end = end.add(1, 'day') // move for 00:00 on end day to 00:00 the next day
        if (
          (selectedTask.plannedEndDate &&
            thisDay.toDate() >
              dayjs(selectedTask.plannedEndDate?.replace('Z', '')).toDate()) ||
          (selectedTask.actualEndDate &&
            thisDay.toDate() >
              dayjs(selectedTask.actualEndDate?.replace('Z', '')).toDate())
        ) {
          if (fullDateType === DATE_TYPES.PLANNED_END) {
            title = t('taskDatesDialog.childOOBAfter')
          } else {
            title = t('taskDatesDialog.level1OOBAfter')
          }
        } else {
          title = t('taskDatesDialog.childOOBAfter')
        }
      } else if (minDate && thisDay.toDate() < dayjs(minDate).toDate()) {
        if (
          (selectedTask.plannedStartDate &&
            thisDay.toDate() <
              dayjs(
                selectedTask.plannedStartDate?.replace('Z', '')
              ).toDate()) ||
          (selectedTask.actualStartDate &&
            thisDay.toDate() <
              dayjs(selectedTask.actualStartDate?.replace('Z', '')).toDate())
        ) {
          if (
            fullDateType === DATE_TYPES.PLANNED_START ||
            fullDateType === DATE_TYPES.ACTUAL_START
          ) {
            title = t('taskDatesDialog.childOOBBefore')
          } else {
            title = t('taskDatesDialog.level1OOBBefore')
          }
        } else {
          title = t('taskDatesDialog.childOOBBefore')
        }
      }
      return (
        <Tooltip
          title={t(title)}
          slotProps={{
            popper: { style: { zIndex: 10002 } },
          }}
        >
          <span>
            {!hasBothDates && (
              <PickersDay
                data-test="calendar-date"
                day={day}
                {...other}
                outsideCurrentMonth={outsideCurrentMonth}
                disabled={isOutsideMinMaxRange}
              />
            )}
            {hasBothDates && (
              <CustomPickersDay
                data-test="calendar-date"
                day={day}
                {...other}
                outsideCurrentMonth={outsideCurrentMonth}
                disableMargin
                dayIsBetween={dayIsBetween}
                isFirstDay={isFirstDay}
                isLastDay={isLastDay}
                isStartOfWeek={isStartOfWeek}
                isEndOfWeek={isEndOfWeek}
                disabled={isOutsideMinMaxRange}
                isStart={dateType === DATE_VARIABLES.START}
              />
            )}
            {/* </Badge> */}
          </span>
        </Tooltip>
      )
    } else if (isProblemDay) {
      return (
        <Tooltip
          title={t('taskDatesDialog.problemTaskTooltip')}
          slotProps={{
            popper: { style: { zIndex: 10002 } },
          }}
        >
          <Badge
            key={props.day.toString()}
            overlap="circular"
            variant="dot"
            color="warning"
          >
            {!hasBothDates && (
              <PickersDay
                data-test="calendar-date"
                day={day}
                {...other}
                outsideCurrentMonth={outsideCurrentMonth}
                disabled={isOutsideMinMaxRange}
              />
            )}
            {hasBothDates && (
              <CustomPickersDay
                data-test="calendar-date"
                day={day}
                {...other}
                outsideCurrentMonth={outsideCurrentMonth}
                disableMargin
                dayIsBetween={dayIsBetween}
                isFirstDay={isFirstDay}
                isLastDay={isLastDay}
                isStartOfWeek={isStartOfWeek}
                isEndOfWeek={isEndOfWeek}
                disabled={isOutsideMinMaxRange}
                isStart={dateType === DATE_VARIABLES.START}
              />
            )}
          </Badge>
        </Tooltip>
      )
    } else {
      return (
        <>
          {!hasBothDates && (
            <PickersDay
              data-test="calendar-date"
              day={day}
              {...other}
              outsideCurrentMonth={outsideCurrentMonth}
              disabled={isOutsideMinMaxRange}
            />
          )}
          {hasBothDates && (
            <CustomPickersDay
              data-test="calendar-date"
              day={day}
              {...other}
              outsideCurrentMonth={outsideCurrentMonth}
              disableMargin
              dayIsBetween={dayIsBetween}
              isFirstDay={isFirstDay}
              isLastDay={isLastDay}
              isStartOfWeek={isStartOfWeek}
              isEndOfWeek={isEndOfWeek}
              disabled={isOutsideMinMaxRange}
              isStart={dateType === DATE_VARIABLES.START}
            />
          )}
        </>
      )
    }
  }

  const getProblemDays = () => {
    setIsLoading(true)
    if (props.selectedTask?.tasks?.length > 0) {
      taskService
        .getProblemDates(
          props.selectedTask.matterId,
          props.selectedTask.project.id,
          props.selectedTask.id,
          {
            ignorePED:
              props.dateType === DATE_VARIABLES.START &&
              props.selectedTask.status !== TASK_STATUS.NOT_STARTED,
          }
        )
        .then(res => {
          if (res.status === 200) {
            let ep = dayjs(res.body.earliestDate?.replace('Z', ''))
            ep = ep.hour(0)
            ep = ep.minute(0)
            ep = ep.second(0)
            setEarliestProblem(ep)
            let lp = dayjs(res.body.latestDate?.replace('Z', ''))
            lp = lp.hour(0)
            lp = lp.minute(0)
            lp = lp.second(0)
            setLatestProblem(lp)
            setIsLoading(false)
          } else {
            setIsLoading(false)
          }
        })
    } else {
      setIsLoading(false)
    }
  }

  const getFullDateType = () => {
    if (!props.inTaskDetails) {
      if (props.dateType === DATE_VARIABLES.START) {
        if (props.selectedTask?.actualStartDate) {
          setFullDateType(t(DATE_TYPES.ACTUAL_START))
        } else {
          setFullDateType(t(DATE_TYPES.PLANNED_START))
        }
      } else {
        if (props.selectedTask?.actualEndDate) {
          setFullDateType(t(DATE_TYPES.ACTUAL_END))
        } else {
          setFullDateType(t(DATE_TYPES.PLANNED_END))
        }
      }
    } else {
      switch (props.fullType) {
        case DATE_VARIABLES.ASD:
          setFullDateType(t(DATE_TYPES.ACTUAL_START))
          break
        case DATE_VARIABLES.PSD:
          setFullDateType(t(DATE_TYPES.PLANNED_START))
          break
        case DATE_VARIABLES.AED:
          setFullDateType(t(DATE_TYPES.ACTUAL_END))
          break
        case DATE_VARIABLES.PED:
          setFullDateType(t(DATE_TYPES.PLANNED_END))
          break
        default:
          break
      }
    }
  }

  const getHasBothDates = () => {
    let task = props.selectedTask
    if (task.actualStartDate) {
      if (task.plannedEndDate || task.actualEndDate) {
        setHasBothDates(true)
        if (task.actualEndDate) {
          setDateDifference(
            dayjs(task.actualEndDate?.replace('Z', ''))
              .startOf('day')
              .diff(
                dayjs(task.actualStartDate?.replace('Z', '')).startOf('day'),
                'day'
              )
          )
        } else {
          setDateDifference(
            dayjs(task.plannedEndDate?.replace('Z', ''))
              .startOf('day')
              .diff(
                dayjs(task.actualStartDate?.replace('Z', '')).startOf('day'),
                'day'
              )
          )
        }
      }
    } else if (task.plannedStartDate) {
      if (task.plannedEndDate) {
        setHasBothDates(true)
        setDateDifference(
          dayjs(task.plannedEndDate?.replace('Z', ''))
            .startOf('day')
            .diff(
              dayjs(task.plannedStartDate?.replace('Z', '')).startOf('day'),
              'day'
            )
        )
      }
    } else {
      setHasBothDates(false)
    }
  }

  const zeroOutDate = date => {
    let d = dayjs(date)
    d = d.hour(0)
    d = d.minute(0)
    d = d.second(0)
    return d.toDate()
  }

  const maxOutDate = date => {
    let d = dayjs(date)
    d = d.hour(23)
    d = d.minute(59)
    d = d.second(59)
    return d.toDate()
  }

  const _getMinMaxBasedOnSingleTask = (
    task,
    useBounds = false,
    dateBeingChanged = null
  ) => {
    let _min = 0
    let _max =
      task.status !== TASK_STATUS.NOT_STARTED &&
      dateType === DATE_VARIABLES.START
        ? new Date().getTime()
        : 4102444800000 //1st Jan 2100

    if (dateType === DATE_VARIABLES.START) {
      if (
        task.actualEndDate &&
        dateBeingChanged !== DATE_VARIABLES.ACTUAL_END_DATE
      ) {
        if (new Date(task.actualEndDate).getTime() < _max) {
          _max = maxOutDate(
            new Date(task.actualEndDate).toISOString().replace('Z', '')
          ).getTime()
        }
      } else if (
        task.plannedEndDate &&
        task.status === TASK_STATUS.NOT_STARTED &&
        dateBeingChanged !== DATE_VARIABLES.PLANNED_END_DATE
      ) {
        if (new Date(task.plannedEndDate).getTime() < _max) {
          _max = maxOutDate(
            new Date(task.plannedEndDate).toISOString().replace('Z', '')
          ).getTime()
        }
      }
      if (useBounds) {
        if (
          task.actualStartDate &&
          dateBeingChanged !== DATE_VARIABLES.ACTUAL_START_DATE
        ) {
          if (new Date(task.actualStartDate).getTime() > _min) {
            _min = zeroOutDate(
              new Date(task.actualStartDate).toISOString().replace('Z', '')
            ).getTime()
          }
        } else if (
          task.plannedStartDate &&
          !task.actualStartDate &&
          dateBeingChanged !== DATE_VARIABLES.PLANNED_START_DATE
        ) {
          if (new Date(task.plannedStartDate).getTime() > _min) {
            _min = zeroOutDate(
              new Date(task.plannedStartDate).toISOString().replace('Z', '')
            ).getTime()
          }
        }
      }
    } else {
      if (useBounds) {
        if (
          task.actualEndDate &&
          dateBeingChanged !== DATE_VARIABLES.ACTUAL_END_DATE
        ) {
          if (new Date(task.actualEndDate).getTime() < _max) {
            _max = maxOutDate(
              new Date(task.actualEndDate).toISOString().replace('Z', '')
            ).getTime()
          }
        } else if (
          task.plannedEndDate &&
          dateBeingChanged !== DATE_VARIABLES.PLANNED_END_DATE &&
          !task.actualEndDate
        ) {
          if (new Date(task.plannedEndDate).getTime() < _max) {
            _max = maxOutDate(
              new Date(task.plannedEndDate).toISOString().replace('Z', '')
            ).getTime()
          }
        }
      }
      if (
        task.actualStartDate &&
        dateBeingChanged !== DATE_VARIABLES.ACTUAL_START_DATE
      ) {
        if (new Date(task.actualStartDate).getTime() > _min) {
          _min = zeroOutDate(
            new Date(task.actualStartDate).toISOString().replace('Z', '')
          ).getTime()
        }
      } else if (
        task.plannedStartDate &&
        dateBeingChanged !== DATE_VARIABLES.PLANNED_START_DATE
      ) {
        if (new Date(task.plannedStartDate).getTime() > _min) {
          _min = zeroOutDate(
            new Date(task.plannedStartDate).toISOString().replace('Z', '')
          ).getTime()
        }
      }
    }
    if (task.status === TASK_STATUS.DONE) {
      _min = Math.min(_min, new Date().getTime())
      _max = Math.min(_max, new Date().getTime())
    }
    if (task.status === TASK_STATUS.IN_PROGRESS) {
      _min = Math.min(_min, new Date().getTime())
    }

    return [_min, _max]
  }

  const getMinMaxBoundaries = () => {
    let _min =
      dateType === DATE_VARIABLES.END &&
      (props.selectedTask.plannedStartDate ||
        props.selectedTask.actualStartDate)
        ? new Date(
            props.selectedTask.actualStartDate
              ? props.selectedTask.actualStartDate?.replace('Z', '')
              : props.selectedTask.plannedStartDate?.replace('Z', '')
          ).getTime()
        : 0
    let _max =
      props.selectedTask.status !== TASK_STATUS.NOT_STARTED &&
      dateType === DATE_VARIABLES.START
        ? new Date().getTime()
        : props.fullType === DATE_VARIABLES.AED
          ? new Date().getTime()
          : 4102444800000 //1st Jan 2100
    if (props.selectedTask?.level > 1 && props.selectedTask.parent) {
      taskService
        .getMinMaxBoundsUpTree(
          props.selectedTask.matterId,
          props.selectedTask.project.id,
          props.selectedTask.id
        )
        .then(res => {
          if (res.status === 200) {
            let dateBeingChanged =
              dateType === DATE_VARIABLES.START
                ? props.selectedTask.actualStartDate
                  ? DATE_VARIABLES.ACTUAL_START_DATE
                  : DATE_VARIABLES.PLANNED_START_DATE
                : props.selectedTask.actualEndDate
                  ? DATE_VARIABLES.ACTUAL_END_DATE
                  : DATE_VARIABLES.PLANNED_END_DATE

            let _fakeTask = {
              plannedStartDate: dayjs
                .utc(res.body.minDate)
                .startOf('day')
                .toDate(),
              plannedEndDate: dayjs.utc(res.body.maxDate).endOf('day').toDate(),
              actualStartDate:
                props.selectedTask.status === TASK_STATUS.DONE
                  ? dayjs.utc(res.body.minDate).startOf('day').toDate()
                  : '',
              actualEndDate:
                props.selectedTask.status === TASK_STATUS.DONE
                  ? dayjs.utc(res.body.maxDate).endOf('day').toDate()
                  : '',

              status: props.selectedTask.status,
            }
            let [a, b] = _getMinMaxBasedOnSingleTask(_fakeTask, true)
            let [z, y] = _getMinMaxBasedOnSingleTask(
              props.selectedTask,
              props.selectedTask.status === TASK_STATUS.DONE,
              dateBeingChanged
            )

            _min = Math.max(a, z)
            _max = Math.min(b, y)
            if (_min > 0) {
              setMinDate(new Date(_min).toISOString())
            } else {
              setMinDate(undefined)
            }
            if (_max < 4102444800000) {
              setMaxDate(
                _max && new Date(_max).getTime() < 4102444800000
                  ? new Date(_max).toISOString()
                  : undefined
              )
            } else {
              setMaxDate(undefined)
            }
          }
        })
    } else {
      let dateBeingChanged =
        dateType === DATE_VARIABLES.START
          ? props.selectedTask.actualStartDate
            ? DATE_VARIABLES.ACTUAL_START_DATE
            : DATE_VARIABLES.PLANNED_START_DATE
          : props.selectedTask.actualEndDate
            ? DATE_VARIABLES.ACTUAL_END_DATE
            : DATE_VARIABLES.PLANNED_END_DATE

      let [a, b] = _getMinMaxBasedOnSingleTask(
        props.selectedTask,
        props.selectedTask.status === TASK_STATUS.DONE,
        dateBeingChanged
      )

      _max = b
      if (_min > 0) {
        setMinDate(new Date(_min).toISOString())
      } else {
        setMinDate(undefined)
      }
      if (_max < 4102444800000) {
        setMaxDate(
          _max && new Date(_max).getTime() < 4102444800000
            ? new Date(_max).toISOString()
            : undefined
        )
      } else {
        setMaxDate(undefined)
      }
    }
  }

  const getInitialValue = () => {
    if (props.value === null) {
      if (dateType === DATE_VARIABLES.START) {
        if (props.selectedTask?.actualStartDate) {
          setInitialValue(
            dayjs(props.selectedTask?.actualStartDate?.replace('Z', ''))
              .startOf('day')
              .toDate()
          )
        } else if (props.selectedTask?.plannedStartDate?.replace('Z', '')) {
          setInitialValue(
            dayjs(props.selectedTask?.plannedStartDate?.replace('Z', ''))
              .startOf('day')
              .toDate()
          )
        } else {
          if (
            new Date(minDate).getTime() < new Date().getTime() &&
            new Date().getTime() < new Date(maxDate).getTime()
          ) {
            setInitialValue(null)
          } else {
            setInitialValue(dayjs(minDate).endOf('day').toDate())
          }
        }
      } else {
        if (props.selectedTask?.actualEndDate) {
          setInitialValue(
            dayjs(props.selectedTask?.actualEndDate?.replace('Z', ''))
              .endOf('day')
              .toDate()
          )
        } else if (props.selectedTask?.plannedEndDate) {
          setInitialValue(
            dayjs(props.selectedTask?.plannedEndDate?.replace('Z', ''))
              .endOf('day')
              .toDate()
          )
        } else {
          if (
            new Date(minDate).getTime() < new Date().getTime() &&
            new Date().getTime() < new Date(maxDate).getTime()
          ) {
            setInitialValue(null)
          } else {
            if (maxDate === undefined && minDate) {
              setInitialValue(dayjs(minDate).endOf('day').toDate())
            } else {
              setInitialValue(dayjs(maxDate).endOf('day').toDate())
            }
          }
        }
      }
    } else {
      setInitialValue(dayjs(props.value).toDate())
    }
  }

  useEffect(() => {
    getInitialValue()
    getFullDateType()
    getMinMaxBoundaries()
    getHasBothDates()
    getProblemDays()
  }, [props.dateType]) //eslint-disable-line

  useEffect(() => {
    getInitialValue()
  }, [minDate, maxDate]) //eslint-disable-line
  const getUnsetInitialValue = () => {
    // let fullDate = getFullDateType(false)
    const isStartDate = props.dateType === DATE_VARIABLES.START
    const isEndDate = props.dateType === DATE_VARIABLES.END
    let maxDateTime = new Date(maxDate).getTime()
    let minDateTime = new Date(minDate).getTime()
    let now = new Date().getTime()
    if (isStartDate && minDate && new Date(minDate).getTime() !== 0) {
      return new Date(minDate)
    }
    if (isStartDate && maxDate && new Date(maxDate).getTime() < 4102444800000) {
      if (maxDateTime < now) {
        return new Date(maxDate)
      }
    }

    if (isEndDate && maxDate && new Date(maxDate).getTime() < 4102444800000) {
      return new Date(maxDate)
    }
    if (isEndDate && minDate && new Date(minDate).getTime() !== 0) {
      if (minDateTime > now) {
        return new Date(minDate)
      }
    }

    return null
  }

  const checkIfHasOtherDate = (dateTypeBeingEdited, task) => {
    switch (dateTypeBeingEdited) {
      case DATE_TYPES.ACTUAL_START:
        return task.actualEndDate !== null || task.plannedEndDate !== null
      case DATE_TYPES.ACTUAL_END:
        return task.actualStartDate !== null
      case DATE_TYPES.PLANNED_START:
        return task.plannedEndDate !== null
      case DATE_TYPES.PLANNED_END:
        return task.actualStartDate !== null || task.plannedStartDate !== null
      default:
        return false
    }
  }
  const hasOtherDate = checkIfHasOtherDate(fullDateType, selectedTask)

  const isFreshDate = props.value === null
  return (
    <Dialog
      style={{ zIndex: 10001 }}
      open={showOpen}
      onClose={() => {
        setShowOpen(false)
        props.onClose()
      }}
    >
      <div>
        <DialogContentText className={classes.dialogText}>
          {isFreshDate
            ? t('taskDatesDialog.AddDate')
            : t('taskDatesDialog.ChangeDate')}
        </DialogContentText>
        <DialogTitle className={classes.dialogText}>{fullDateType}</DialogTitle>
      </div>
      <DialogContent className={classes.dialogBody}>
        <div style={{ backgroundColor: 'white' }}>
          <DateCalendar
            loading={isLoading}
            renderLoading={() => <DayCalendarSkeleton />}
            value={initialValue ? initialValue : getUnsetInitialValue()}
            onChange={(newValue, type) => {
              if (type === 'finish') {
                props.onChange(newValue)
                setShowOpen(false)
                props.onClose()
              }
            }}
            onClose={() => {
              setShowOpen(false)
              props.onClose()
            }}
            slots={{
              day: ServerDay,
              nextIconButton: props => Arrow(props, 'right'),
              previousIconButton: props => Arrow(props, 'left'),
            }}
            minDate={minDate ? new Date(minDate) : minDate}
            maxDate={maxDate ? new Date(maxDate) : maxDate}
            error={error}
            label={props.label}
          />
        </div>
        {(hasBothDates || hasOtherDate) && (
          <div className={classes.dialogText}>
            {hasBothDates && (
              <Typography style={{ position: 'fixed' }}>
                {t('Duration: ') +
                  (dateDifference > 0
                    ? dateDifference +
                      t(` day${dateDifference !== 1 ? 's' : ''}`)
                    : '< 1 day')}
              </Typography>
            )}
            <div style={{ display: 'flex', paddingTop: '12px' }}>
              <DialogContentText className={classes.dialogText}>
                {inTaskDetails
                  ? fullDateType === DATE_TYPES.PLANNED_START
                    ? t('taskDatesDialog.PED') + ': '
                    : fullDateType === DATE_TYPES.ACTUAL_START &&
                        selectedTask.actualEndDate
                      ? t('taskDatesDialog.AED') + ': '
                      : fullDateType === DATE_TYPES.ACTUAL_START &&
                          selectedTask.plannedEndDate
                        ? t('taskDatesDialog.PED') + ': '
                        : fullDateType === DATE_TYPES.PLANNED_END &&
                            selectedTask.actualEndDate
                          ? t('taskDatesDialog.PSD') + ': '
                          : fullDateType === DATE_TYPES.PLANNED_END &&
                              selectedTask.actualStartDate
                            ? t('taskDatesDialog.ASD') + ': '
                            : fullDateType === DATE_TYPES.ACTUAL_END
                              ? t('taskDatesDialog.ASD') + ': '
                              : t('taskDatesDialog.PSD') + ': '
                  : props.dateType === DATE_VARIABLES.START
                    ? props.selectedTask?.actualStartDate &&
                      props.selectedTask.actualEndDate
                      ? t('taskDatesDialog.AED') + ': '
                      : t('taskDatesDialog.PED') + ': '
                    : props.selectedTask?.actualStartDate &&
                        !props.selectedTask?.actualEndDate
                      ? t('taskDatesDialog.ASD') + ': '
                      : props.selectedTask?.actualEndDate
                        ? t('taskDatesDialog.ASD') + ': '
                        : t('taskDatesDialog.PSD') + ': '}
              </DialogContentText>
              <Link
                variant="body2"
                color={juralioColours.whiteText.primary}
                style={{
                  cursor: 'pointer',
                  paddingTop: '12px',
                  paddingLeft: '8px',
                }}
                onClick={() => {
                  if (!props.selectedTask.isMilestone) {
                    props.onSwap()
                    setIsLoading(true)
                  }
                }}
              >
                {inTaskDetails
                  ? fullDateType === DATE_TYPES.PLANNED_START
                    ? dayjs(
                        props.selectedTask?.plannedEndDate?.replace('Z', '')
                      ).format('DD MMM YYYY')
                    : fullDateType === DATE_TYPES.ACTUAL_START &&
                        selectedTask.actualEndDate
                      ? dayjs(
                          props.selectedTask?.actualEndDate?.replace('Z', '')
                        ).format('DD MMM YYYY')
                      : fullDateType === DATE_TYPES.ACTUAL_START &&
                          selectedTask.plannedEndDate
                        ? dayjs(
                            props.selectedTask?.plannedEndDate?.replace('Z', '')
                          ).format('DD MMM YYYY')
                        : fullDateType === DATE_TYPES.PLANNED_END &&
                            selectedTask.actualEndDate
                          ? dayjs(
                              props.selectedTask?.plannedStartDate?.replace(
                                'Z',
                                ''
                              )
                            ).format('DD MMM YYYY')
                          : fullDateType === DATE_TYPES.PLANNED_END &&
                              selectedTask.actualStartDate
                            ? dayjs(
                                props.selectedTask?.actualStartDate?.replace(
                                  'Z',
                                  ''
                                )
                              ).format('DD MMM YYYY')
                            : fullDateType === DATE_TYPES.ACTUAL_END
                              ? dayjs(
                                  props.selectedTask?.actualStartDate?.replace(
                                    'Z',
                                    ''
                                  )
                                ).format('DD MMM YYYY')
                              : dayjs(
                                  props.selectedTask?.plannedStartDate?.replace(
                                    'Z',
                                    ''
                                  )
                                ).format('DD MMM YYYY')
                  : props.dateType === DATE_VARIABLES.START
                    ? props.selectedTask?.actualStartDate &&
                      props.selectedTask.actualEndDate
                      ? dayjs(
                          props.selectedTask?.actualEndDate?.replace('Z', '')
                        ).format('DD MMM YYYY')
                      : dayjs(
                          props.selectedTask?.plannedEndDate?.replace('Z', '')
                        ).format('DD MMM YYYY')
                    : props.selectedTask?.actualStartDate &&
                        !props.selectedTask?.actualEndDate
                      ? dayjs(
                          props.selectedTask?.actualStartDate?.replace('Z', '')
                        ).format('DD MMM YYYY')
                      : props.selectedTask?.actualEndDate
                        ? dayjs(
                            props.selectedTask?.actualStartDate?.replace(
                              'Z',
                              ''
                            )
                          ).format('DD MMM YYYY')
                        : dayjs(
                            props.selectedTask?.plannedStartDate?.replace(
                              'Z',
                              ''
                            )
                          ).format('DD MMM YYYY')}
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
      <DialogActions className={classes.dialogMain}>
        <Button
          className={classes.dialogButtons}
          onClick={() => {
            setShowOpen(false)
            props.onClose()
          }}
        >
          {t('common.cancel')}
        </Button>
        {initialValue !== null &&
          props.selectedTask.status !== TASK_STATUS.DONE &&
          props.fullType !== DATE_VARIABLES.ASD &&
          props.fullType !== DATE_VARIABLES.AED && (
            <Button
              className={classes.dialogButtons}
              onClick={() => {
                setShowOpen(false)
                props.onClose()
                props.onChange(null)
              }}
            >
              {t('common.clear')}
            </Button>
          )}
      </DialogActions>
    </Dialog>
  )
}
export default DatePicker
