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

import Typography from '@mui/material/Typography'
import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { withStyles } from 'tss-react/mui'
import {
  DATE_FORMAT_DAY_MONTH_YEAR,
  DATE_STRINGS,
  TASK_STATUS,
} from '../../../app/constants'
import {
  isPlannedEndDateOverdue,
  isPlannedStartDateOverdue,
} from '../../../app/roadmap/helpers/task-dates-helper.js'
import { showTaskmapDatePickerForTask } from '../../../app/task-details/task-actions'
import { openDatePicker } from '../../../redux/ducks/improved-taskmap-interactions'
import { getDateDisplayString } from '../../../services/helpers/date-helper'
import colorModifiers from '../../../theme/color-modifiers'
import juralioColours from '../../../theme/juralio-colours'
import { DateLinkingIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import { lightButtonHoverColour } from '../../inputs/light-button/LightButton'

const styles = theme => ({
  wrapper: {
    display: 'flex',
    height: theme.spacing(2.5),
    marginLeft: '-2px',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  displayString: {
    marginTop: theme.spacing(0.25),
    marginBottom: 'auto',
    lineHeight: theme.spacing(2),
    color: juralioColours.darkText.secondary,
    marginLeft: theme.spacing(0.5),
  },
  displayStringError: {
    color: `${juralioColours.error} !important`,
  },
  dateButton: {
    padding: 'unset',
    textTransform: 'unset',
    display: 'flex',
    borderRadius: '2px',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: juralioColours.whiteText.disabled,
    },
  },
  doneDate: {
    display: 'flex',
  },
  dateButtonUnset: {
    color: juralioColours.darkText.secondary,
    borderRadius: '2px',
    paddingRight: theme.spacing(0.5),
    paddingLeft: theme.spacing(0.5),
    '&:hover': {
      cursor: 'pointer',
    },
  },
  otherTask: {
    backgroundColor: juralioColours.whiteText.disabled,
    '&:hover': {
      backgroundColor: juralioColours.whiteText.disabled,
    },
  },
  notStarted: {
    backgroundColor: colorModifiers.restingButtonOpacity(
      rawColours.primary.grey.main
    ),
    '&:hover': {
      backgroundColor: lightButtonHoverColour,
    },
  },
  dateText: {
    paddingLeft: theme.spacing(0.25),
    paddingRight: theme.spacing(0.25),
    color: juralioColours.darkText.secondary,
  },
  linkIcon: {
    color: juralioColours.darkText.secondary,
    height: theme.spacing(2.5),
  },
})

const TaskCellDates = props => {
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const DisplayDone = props => {
    return (
      <>
        <div
          data-test="done-display"
          className={props.classes.doneDate}
          style={{ pointerEvents: props.viewOnly && 'none' }}
          onClick={e => {
            e.stopPropagation()
            dispatch(
              showTaskmapDatePickerForTask({
                task: props.task,
                dateType: 'start',
              })
            )

            dispatch(openDatePicker(props.task))
          }}
        >
          {!props.task.isMilestone && (
            <>
              <Typography className={props.classes.displayString}>
                {getDateDisplayString(
                  props.task.actualStartDate?.replace('Z', ''),
                  DATE_FORMAT_DAY_MONTH_YEAR,
                  false
                )}
              </Typography>
              <Typography
                style={{ fontWeight: 'bold' }}
                className={props.classes.displayString}
              >
                {'-'}
              </Typography>
            </>
          )}
        </div>
        <div
          data-test="done-display"
          className={props.classes.doneDate}
          style={{ pointerEvents: props.viewOnly && 'none' }}
          onClick={e => {
            e.stopPropagation()
            dispatch(
              showTaskmapDatePickerForTask({
                task: props.task,
                dateType: 'end',
              })
            )

            dispatch(openDatePicker(props.task))
          }}
        >
          <Typography
            style={{ fontWeight: 'bold' }}
            className={props.classes.displayString}
          >
            {props.task.isMilestone ? t('taskMapDates.milestoneEnd') : t('')}
          </Typography>
          <Typography className={props.classes.displayString}>
            {getDateDisplayString(
              props.task.actualEndDate?.replace('Z', ''),
              DATE_FORMAT_DAY_MONTH_YEAR,
              false
            )}
          </Typography>
        </div>
      </>
    )
  }

  const DisplayInProgress = props => {
    const displayDate = Date.parse(props.displayDate?.replace('Z', ''))
    const displayString = displayDate ? (
      <Typography
        id={`taskCellDatePicker-end-${props.task.id}`}
        data-test={'task-cell-date-picker-end'}
        className={classNames(
          props.classes.displayString,
          props.error && props.classes.displayStringError
        )}
        style={{
          fontWeight:
            getDateDisplayString(
              props.task.plannedEndDate?.replace('Z', ''),
              DATE_FORMAT_DAY_MONTH_YEAR,
              false
            ) === DATE_STRINGS.TODAY
              ? 'bold'
              : '',
        }}
        onClick={e => {
          e.stopPropagation()
          dispatch(
            showTaskmapDatePickerForTask({ task: props.task, dateType: 'end' })
          )
          dispatch(openDatePicker(props.task))
        }}
      >
        {getDateDisplayString(displayDate, DATE_FORMAT_DAY_MONTH_YEAR, false)}
      </Typography>
    ) : (
      dateSelector('setPlannedEnd', 'end')
    )

    return (
      <div
        className={props.classes.wrapper}
        style={{ pointerEvents: props.viewOnly && 'none' }}
      >
        <React.Fragment>
          <div
            data-test="in-progress-display"
            style={{ pointerEvents: props.viewOnly && 'none' }}
            onClick={e => {
              e.stopPropagation()
              dispatch(
                showTaskmapDatePickerForTask({
                  task: props.task,
                  dateType: 'start',
                })
              )

              dispatch(openDatePicker(props.task))
            }}
          >
            <Typography
              data-test="in-progress-display"
              className={props.classes.displayString}
            >
              {getDateDisplayString(
                props.task.actualStartDate?.replace('Z', ''),
                DATE_FORMAT_DAY_MONTH_YEAR,
                false
              )}
            </Typography>
          </div>
          <Typography
            data-test="in-progress-display"
            style={{ fontWeight: 'bold' }}
            className={props.classes.displayString}
          >
            {'-'}
          </Typography>
        </React.Fragment>

        <div
          className={props.classes.dateButton}
          style={{ backgroundColor: props.viewOnly && 'unset !important' }}
        >
          {displayString}
        </div>
      </div>
    )
  }

  const DisplayNotStarted = props => {
    return (
      <div
        data-test="not-started-display"
        className={props.classes.wrapper}
        style={{ pointerEvents: props.viewOnly && 'none' }}
      >
        {notStartedSelector()}
      </div>
    )
  }

  const DisplayNotStartedMilestone = props => (
    <div className={props.classes.wrapper}>
      {props.task.plannedEndDate ? (
        <>
          <Typography
            style={{ fontWeight: 'bold' }}
            className={props.classes.displayString}
          >
            {props.task.isMilestone
              ? t('taskMapDates.milestonePlan')
              : t('taskMapDates.doneText')}
          </Typography>
          <Typography
            className={classNames(
              props.task.plannedEndDate
                ? props.classes.dateText
                : props.classes.dateButtonUnset,
              isPlannedEndDateOverdue(props.task) &&
                props.classes.displayStringError,
              assignBackgroundColors(!props.task.plannedEndDate)
            )}
            style={{ backgroundColor: props.viewOnly && 'unset !important' }}
            onClick={e => {
              e.stopPropagation()
              dispatch(
                showTaskmapDatePickerForTask({
                  task: props.task,
                  dateType: 'end',
                })
              )
              dispatch(openDatePicker(props.task))
            }}
          >
            {getDateDisplayString(
              props.task.plannedEndDate?.replace('Z', ''),
              DATE_FORMAT_DAY_MONTH_YEAR,
              false
            )}
          </Typography>
        </>
      ) : (
        <>{dateSelector('setPlannedEnd', 'end')}</>
      )}
    </div>
  )

  const dateSelector = (text, dateType) => {
    return (
      <>
        {props.task.plannedEndDate === null && (
          <div
            className={props.classes.dateButton}
            style={{ backgroundColor: props.viewOnly && 'unset !important' }}
          >
            <Typography
              data-test={`task-cell-date-picker-${dateType}`}
              id={`taskCellDatePicker-${dateType}-${props.task.id}`}
              className={classNames(
                props.classes.dateButtonUnset,
                assignBackgroundColors(!props.task.plannedEndDate)
              )}
              style={{ backgroundColor: props.viewOnly && 'unset !important' }}
              onClick={e => {
                e.stopPropagation()
                dispatch(
                  showTaskmapDatePickerForTask({
                    task: props.task,
                    dateType: dateType,
                  })
                )

                dispatch(openDatePicker(props.task))
              }}
            >
              {t(`taskMapDates.${text}`)}
            </Typography>
          </div>
        )}
      </>
    )
  }

  const assignBackgroundColors = isDateUnset => {
    return props.task.status === TASK_STATUS.NOT_STARTED && isDateUnset
      ? props.classes.notStarted
      : props.classes.otherTask
  }

  const notStartedSelector = () => {
    return (
      <div style={{ display: 'flex' }}>
        <>
          <div
            className={props.classes.dateButton}
            style={{ backgroundColor: props.viewOnly && 'unset !important' }}
            onClick={e => {
              e.stopPropagation()
              dispatch(
                showTaskmapDatePickerForTask({
                  task: props.task,
                  dateType: 'start',
                })
              )
              dispatch(openDatePicker(props.task))
            }}
          >
            <Typography
              data-test={'task-cell-date-picker-start'}
              className={classNames(
                props.task.plannedStartDate
                  ? props.classes.dateText
                  : props.classes.dateButtonUnset,
                isPlannedStartDateOverdue(props.task) &&
                  props.classes.displayStringError,
                assignBackgroundColors(!props.task.plannedStartDate)
              )}
              style={{
                backgroundColor: props.viewOnly && 'unset !important',
              }}
              id={`taskCellDatePicker-start-${props.task.id}`}
            >
              {props.task.plannedStartDate
                ? getDateDisplayString(
                    props.task.plannedStartDate?.replace('Z', ''),
                    DATE_FORMAT_DAY_MONTH_YEAR,
                    false
                  )
                : props.viewOnly
                  ? t('taskMapDates.noPlannedStart')
                  : t('taskMapDates.setPlannedStart')}
            </Typography>
          </div>

          <Typography className={props.classes.dateText}>{t('-')}</Typography>
        </>

        <div
          className={props.classes.dateButton}
          style={{ backgroundColor: props.viewOnly && 'unset !important' }}
          onClick={e => {
            e.stopPropagation()
            dispatch(
              showTaskmapDatePickerForTask({
                task: props.task,
                dateType: 'end',
              })
            )
            dispatch(openDatePicker(props.task))
          }}
        >
          <Typography
            data-test={'task-cell-date-picker-end'}
            className={classNames(
              props.task.plannedEndDate
                ? props.classes.dateText
                : props.classes.dateButtonUnset,
              isPlannedEndDateOverdue(props.task) &&
                props.classes.displayStringError,
              assignBackgroundColors(!props.task.plannedEndDate)
            )}
            id={`taskCellDatePicker-end-${props.task.id}`}
            style={{
              backgroundColor: props.viewOnly && 'unset !important',
              fontWeight:
                getDateDisplayString(
                  props.task.plannedEndDate,
                  DATE_FORMAT_DAY_MONTH_YEAR,
                  false
                ) === DATE_STRINGS.TODAY
                  ? 'bold'
                  : '',
            }}
          >
            {props.task.plannedEndDate
              ? getDateDisplayString(
                  props.task.plannedEndDate?.replace('Z', ''),
                  DATE_FORMAT_DAY_MONTH_YEAR,
                  false
                )
              : props.viewOnly
                ? t('taskMapDates.noPlannedEnd')
                : t('taskMapDates.setPlannedEnd')}
          </Typography>
        </div>
      </div>
    )
  }

  return (
    <div
      className={props.classes.wrapper}
      onClick={e => {
        e.stopPropagation()
      }}
    >
      {props.task.status === TASK_STATUS.DONE && (
        <DisplayDone
          task={props.task}
          classes={props.classes}
          displayDate={props.actualEndDate}
          isRoadmap={props.isRoadmap}
          viewOnly={props.viewOnly}
        />
      )}
      {props.task.status === TASK_STATUS.IN_PROGRESS && (
        <DisplayInProgress
          task={props.task}
          classes={props.classes}
          displayDate={props.plannedEndDate}
          error={isPlannedEndDateOverdue(props.task)}
          viewOnly={props.viewOnly}
        />
      )}
      {props.task.status === TASK_STATUS.NOT_STARTED &&
        !props.task.isMilestone && (
          <DisplayNotStarted
            task={props.task}
            classes={props.classes}
            displayDate={props.plannedStartDate}
            viewOnly={props.viewOnly}
          />
        )}

      {props.task.status === TASK_STATUS.NOT_STARTED &&
        props.task.isMilestone && (
          <DisplayNotStartedMilestone
            task={props.task}
            classes={props.classes}
            displayDate={props.plannedEndDate}
            viewOnly={props.viewOnly}
          />
        )}
      {props.isLinked &&
        (props.isDetailedMode ||
          (!props.task.isBlocked && !props.task.isBlocker)) && (
          <DateLinkingIcon
            data-test="dates-linked-icon"
            className={props.classes.linkIcon}
          />
        )}
    </div>
  )
}

export default withStyles(TaskCellDates, styles)
