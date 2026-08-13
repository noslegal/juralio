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
import classNames from 'classnames'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import {
  DATE_VARIABLES,
  TASK_STATUS,
  DATE_FORMAT_FULL,
} from '../../../app/constants'
import DateChangePopover from '../../../app/task-map/date-change/DateChangePopover'
import {
  isInThePast,
  getDateDisplayString,
} from '../../../services/helpers/date-helper'
import colorModifiers from '../../../theme/color-modifiers'
import juralioColours from '../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import { DateIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import LightButton, {
  lightButtonBackgroundColour,
  lightButtonHoverColour,
} from '../light-button/LightButton'
const styles = theme => ({
  root: {
    padding: theme.spacing(),

    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(0.5),
    },

    borderRadius: theme.spacing(),
    // width: theme.spacing(42.5),
    maxWidth: theme.spacing(42.5),
    overflow: 'none',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  rootNoPadding: {
    // padding: theme.spacing(),

    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(0.5),
    },

    borderRadius: theme.spacing(),
    width: theme.spacing(42.5),
    maxWidth: theme.spacing(42.5),
    overflow: 'none',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  withoutDate: {
    flex: 1,
    height: theme.spacing(6),
    width: '100%',
  },
  withDate: {
    flex: 1,
    height: theme.spacing(6),
    width: '100%',
  },
  dateIcon: {
    color: JuralioNamedColours.black[200],
    paddingRight: theme.spacing(),
  },
  inputTop: {
    cursor: 'pointer',
    backgroundColor: lightButtonBackgroundColour,
    '&:hover': {
      backgroundColor: lightButtonHoverColour,
    },
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(0.5),
    height: theme.spacing(2.5),
  },
  input: {
    cursor: 'pointer',
  },
  floatingLabelFocusStyle: {
    cursor: 'pointer',
    color: JuralioNamedColours.black[200],
    paddingLeft: theme.spacing(0.5),
    textAlign: 'center',
  },
  error: {
    color: juralioColours.error,
  },
  notStarted: {
    backgroundColor: colorModifiers.restingButtonOpacity(
      rawColours.primary.grey.main
    ),
  },
  buttonClass: {
    padding: '6px',
  },
})

const DateField = props => {
  const { error, classes } = props
  const { t } = useTranslation()
  const [selectedTask, setSelectedTask] = useState(null)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const isOverdue = () => {
    if (props.dateType === DATE_VARIABLES.START) {
      if (props.fullType === DATE_VARIABLES.PLANNED_START_DATE) {
        return isInThePast(props.task?.plannedStartDate)
      }
    }
    if (props.dateType === DATE_VARIABLES.END) {
      if (props.fullType === DATE_VARIABLES.PLANNED_END_DATE) {
        return isInThePast(props.task?.plannedEndDate)
      }
    }

    return false
  }

  const buttonLabel =
    props.dateType === DATE_VARIABLES.START
      ? props.fullType === DATE_VARIABLES.ASD
        ? getDateDisplayString(
            dayjs(props.task?.actualStartDate?.replace('Z', '')),
            DATE_FORMAT_FULL,
            false
          )
        : props.task?.plannedStartDate
          ? getDateDisplayString(
              dayjs(props.task?.plannedStartDate?.replace('Z', '')),
              DATE_FORMAT_FULL,
              false
            )
          : props.task?.status === TASK_STATUS.NOT_STARTED && props.viewOnly
            ? t('taskDatesDialog.noSelectPSD')
            : props.task?.status === TASK_STATUS.NOT_STARTED && !props.viewOnly
              ? t('taskDatesDialog.SelectPSD')
              : t('common.none')
      : props.fullType === DATE_VARIABLES.AED
        ? getDateDisplayString(
            dayjs(props.task?.actualEndDate?.replace('Z', '')),
            DATE_FORMAT_FULL,
            false
          )
        : props.task?.plannedEndDate
          ? getDateDisplayString(
              dayjs(props.task?.plannedEndDate?.replace('Z', '')),
              DATE_FORMAT_FULL,
              false
            )
          : props.task?.status !== TASK_STATUS.DONE && props.viewOnly
            ? t('taskDatesDialog.noSelectPED')
            : props.task?.status !== TASK_STATUS.DONE && !props.viewOnly
              ? t('taskDatesDialog.SelectPED')
              : t('common.none')
  const buttonHeader =
    props.dateType === DATE_VARIABLES.START
      ? props.fullType === DATE_VARIABLES.ASD
        ? t('taskDatesDialog.ASD')
        : t('taskDatesDialog.PSD')
      : props.fullType === DATE_VARIABLES.AED
        ? t('taskDatesDialog.AED')
        : t('taskDatesDialog.PED')

  return (
    <Tooltip
      title={
        props.viewOnly
          ? t('matter.viewOnly')
          : props.disabled
            ? props.customTooltip
            : ''
      }
    >
      <div className={classes.buttonClass}>
        {!props.hideHeader && (
          <Typography variant="caption">{buttonHeader}</Typography>
        )}
        {!props.hideIcon && (
          <DateIcon
            className={classNames(classes.dateIcon, error && classes.error)}
          />
        )}

        <LightButton
          isNotStarted={props.task.status === TASK_STATUS.NOT_STARTED}
          caption={buttonLabel}
          clickHandler={() => {
            !props.disabled && !props.viewOnly && setSelectedTask(props.task)
            !props.disabled && !props.viewOnly && setShowDatePicker(true)
          }}
          error={isOverdue() || error}
          data-test={
            props.dateType === DATE_VARIABLES.START
              ? props.fullType === DATE_VARIABLES.ASD
                ? `actual-${
                    props.task?.isMilestone ? 'milestone-' : ''
                  }start-date`
                : `planned-${
                    props.task?.isMilestone ? 'milestone-' : ''
                  }start-date`
              : props.fullType === DATE_VARIABLES.AED
                ? `actual-${props.task?.isMilestone ? 'milestone-' : ''}end-date`
                : `planned-${props.task?.isMilestone ? 'milestone-' : ''}end-date`
          }
        />
        {showDatePicker && (
          <DateChangePopover
            inTaskMap={false}
            task={selectedTask}
            forceFetch={true}
            dateType={props.dateType}
            onCloseCleanUp={() => {
              setSelectedTask(null)
              setShowDatePicker(false)
            }}
            isInTaskDetails={true}
            onChange={props.onChange}
            fullType={props.fullType}
          />
        )}
      </div>
    </Tooltip>
  )
}

export default withStyles(DateField, styles)
