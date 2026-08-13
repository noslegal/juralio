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

import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import AlertIcon from '@mui/icons-material/ReportProblem'
import { Tooltip, Typography } from '@mui/material'
import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import {
  DATE_FORMAT_FULL,
  DATE_VARIABLES,
  TASK_STATUS,
} from '../../../app/constants'
import { getDateDisplayString } from '../../../services/helpers/date-helper'
import juralioColours from '../../../theme/juralio-colours'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

const useStyles = makeStyles()(theme => ({
  legendDotStyle: {
    display: 'inline-block',
    borderRadius: '50%',
    width: 11,
    height: 11,
    marginRight: theme.spacing(2),
    verticalAlign: 'middle',
    marginLeft: theme.spacing(1.25),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  infoIcon: {
    height: theme.spacing(2),
    marginLeft: theme.spacing(0.5),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  notRequiredDotStyle: {
    backgroundColor: juralioColours.taskStatus.notRequired,
  },
  notStartedDotStyle: {
    backgroundColor: juralioColours.taskStatus.notStarted,
  },
  inProgressDotStyle: {
    backgroundColor: juralioColours.taskStatus.inProgress,
  },
  doneDotStyle: {
    backgroundColor: juralioColours.taskStatus.done,
  },
  wrapper: {
    display: 'flex',
  },
  statusText: {
    paddingTop: theme.spacing(1),
  },
  textPadding: {
    padding: theme.spacing(1.25),
  },
  dateText: {
    textTransform: 'capitalize',
    paddingTop: theme.spacing(1),
  },
  dateTextWrapper: {
    display: 'flex',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  text: {
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  title: {
    color: juralioColours.darkText.primary,
    fontWeight: 500,
  },
  alertIcon: {
    color: juralioColours.alert,
    alignSelf: 'center',
    paddingRight: theme.spacing(1.5),
  },
  blockerChangeDiv: {
    display: 'flex',
    marginBottom: theme.spacing(1.5),
    marginTop: theme.spacing(1.5),
  },
  cursorPointer: {
    cursor: 'pointer',
  },
}))

const TaskUpdateChip = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  const getDotStyle = status => {
    switch (status) {
      case TASK_STATUS.NOT_REQUIRED:
        return classes.notRequiredDotStyle
      case TASK_STATUS.NOT_STARTED:
        return classes.notStartedDotStyle
      case TASK_STATUS.IN_PROGRESS:
        return classes.inProgressDotStyle
      case TASK_STATUS.DONE:
        return classes.doneDotStyle
      default:
        return null
    }
  }

  const getStatusText = () => {
    return (
      <div>
        <div className={classNames(classes.wrapper, classes.statusText)}>
          <Typography className={classes.title}>
            {t('taskChange.statusText')}
          </Typography>
          <Tooltip
            title={`
            ${getStatusString(props.statusChange, props.task.isMilestone)}
              ${t('taskChange.tooltipText')}
              ${getStatusString(props.task.status, props.task.isMilestone)} 
              ${
                props.changeTask.level > props.task.level
                  ? t('taskChange.parentText')
                  : t('taskChange.subtaskText')
              }`}
          >
            <InfoOutlinedIcon fontSize="small" className={classes.infoIcon} />
          </Tooltip>
        </div>
        <div className={classNames(classes.wrapper, classes.textPadding)}>
          <div
            className={classNames(
              classes.legendDotStyle,
              getDotStyle(props.task.status)
            )}
          ></div>
          <Typography data-test="status-before" className={classes.text}>
            {getStatusString(props.task.status, props.task.isMilestone)}
          </Typography>
          <ArrowRightAltIcon />
          <div
            className={classNames(
              classes.legendDotStyle,
              getDotStyle(props.newStatus)
            )}
          ></div>
          <Typography data-test="status-after" className={classes.text}>
            {getStatusString(props.newStatus, props.task.isMilestone)}
          </Typography>
        </div>
      </div>
    )
  }

  const getDateTooltip = (
    isLinkChange = props.isLinkChange,
    dateChangeType = props.dateChangeType,
    prevDate = props.prevDate,
    newDate = props.newDate
  ) => {
    if (isLinkChange) {
      return t('taskDateChangeTooltips.linked')
    }
    if (props.newStatus) {
      return t('taskDateChangeTooltips.statusChange')
    }
    switch (dateChangeType) {
      case DATE_VARIABLES.PLANNED_START_DATE:
        if (new Date(prevDate) < new Date(newDate)) {
          return t('taskDateChangeTooltips.PSDEarlier')
        } else {
          return t('taskDateChangeTooltips.PSDLater')
        }
      case DATE_VARIABLES.PLANNED_END_DATE:
        if (new Date(prevDate) < new Date(newDate)) {
          return t('taskDateChangeTooltips.PEDEarlier')
        } else {
          return t('taskDateChangeTooltips.PEDLater')
        }
      case DATE_VARIABLES.ACTUAL_START_DATE:
        if (new Date(prevDate) < new Date(newDate)) {
          return t('taskDateChangeTooltips.ASDEarlier')
        } else {
          return t('taskDateChangeTooltips.ASDLater')
        }
      case DATE_VARIABLES.ACTUAL_END_DATE:
        if (new Date(prevDate) < new Date(newDate)) {
          return t('taskDateChangeTooltips.AEDEarlier')
        } else {
          return t('taskDateChangeTooltips.AEDLater')
        }
      default:
        return ''
    }
  }

  const getChangeType = (type = props.dateChangeType) => {
    switch (type) {
      case DATE_VARIABLES.PLANNED_START_DATE:
        return t('taskDateTypes.PSD')
      case DATE_VARIABLES.PLANNED_END_DATE:
        return t('taskDateTypes.PED')
      case DATE_VARIABLES.ACTUAL_START_DATE:
        return t('taskDateTypes.ASD')
      case DATE_VARIABLES.ACTUAL_END_DATE:
        return t('taskDateTypes.AED')
      default:
        return ''
    }
  }

  const getDateText = (
    isLinkChange,
    dateChangeType,
    prevDate,
    newDate,
    twoDateChanges
  ) => {
    prevDate = prevDate ? dayjs(prevDate).utc() : prevDate
    newDate = newDate ? dayjs(newDate).utc() : newDate
    if (twoDateChanges) {
      return (
        <div>
          <div className={`${classes.wrapper} ${classes.dateText}`}>
            <Typography className={classes.title}>
              {getChangeType(DATE_VARIABLES.ACTUAL_START_DATE)}{' '}
            </Typography>
            <Tooltip
              title={getDateTooltip(
                isLinkChange,
                DATE_VARIABLES.ACTUAL_START_DATE,
                prevDate,
                newDate
              )}
            >
              <InfoOutlinedIcon fontSize="small" className={classes.infoIcon} />
            </Tooltip>
          </div>
          <div className={classes.dateTextWrapper}>
            <Typography data-test="date-before" className={classes.text}>
              {getDateDisplayString(prevDate, DATE_FORMAT_FULL, true)}
              {prevDate === null && t('taskDates.noDate')}
            </Typography>
            <ArrowRightAltIcon />
            <Typography data-test="date-after" className={classes.text}>
              {getDateDisplayString(newDate, DATE_FORMAT_FULL, true)}
              {newDate === null && t('taskDates.noDate')}
            </Typography>
          </div>
          <div className={`${classes.wrapper} ${classes.dateText}`}>
            <Typography className={classes.title}>
              {getChangeType('actualEndDate')}{' '}
            </Typography>
            <Tooltip
              title={getDateTooltip(
                isLinkChange,
                DATE_VARIABLES.ACTUAL_END_DATE,
                prevDate,
                newDate
              )}
            >
              <InfoOutlinedIcon fontSize="small" className={classes.infoIcon} />
            </Tooltip>
          </div>
          <div className={classes.dateTextWrapper}>
            <Typography data-test="date-before" className={classes.text}>
              {getDateDisplayString(prevDate, DATE_FORMAT_FULL, true)}
              {prevDate === null && t('taskDates.noDate')}
            </Typography>
            <ArrowRightAltIcon />
            <Typography data-test="date-after" className={classes.text}>
              {getDateDisplayString(newDate, DATE_FORMAT_FULL, true)}
            </Typography>
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <div className={`${classes.wrapper} ${classes.dateText}`}>
            <Typography className={classes.title}>
              {getChangeType(dateChangeType)}{' '}
            </Typography>
            <Tooltip
              title={getDateTooltip(
                isLinkChange,
                dateChangeType,
                prevDate,
                newDate
              )}
            >
              <InfoOutlinedIcon fontSize="small" className={classes.infoIcon} />
            </Tooltip>
          </div>
          <div className={classes.dateTextWrapper}>
            <Typography data-test="date-before" className={classes.text}>
              {getDateDisplayString(prevDate, DATE_FORMAT_FULL, true)}
              {prevDate === null && t('taskDates.noDate')}
            </Typography>
            <ArrowRightAltIcon />
            <Typography data-test="date-after" className={classes.text}>
              {getDateDisplayString(newDate, DATE_FORMAT_FULL, true)}
              {newDate === null && t('taskDates.noDate')}
            </Typography>
          </div>
        </div>
      )
    }
  }

  const DateTextType = (
    isLinkChange = props.isLinkChange,
    dateChangeType = props.dateChangeType,
    prevDate = props.prevDate,
    newDate = props.newDate
  ) => {
    var newStatus = props.newStatus
    if (props.task.status === TASK_STATUS.NOT_STARTED) {
      switch (newStatus) {
        case TASK_STATUS.NOT_REQUIRED:
          return null
        case TASK_STATUS.NOT_STARTED:
          return null
        case TASK_STATUS.IN_PROGRESS:
          prevDate = null
          newDate = new Date()
          return getDateText(
            isLinkChange,
            DATE_VARIABLES.ACTUAL_START_DATE,
            prevDate,
            newDate,
            false
          )
        case TASK_STATUS.DONE:
          prevDate = null
          newDate = new Date()
          return getDateText(
            isLinkChange,
            dateChangeType,
            prevDate,
            newDate,
            true
          )
        default:
          return null
      }
    } else if (props.task.status === TASK_STATUS.IN_PROGRESS) {
      switch (newStatus) {
        case TASK_STATUS.NOT_REQUIRED:
          return null
        case TASK_STATUS.NOT_STARTED:
          prevDate = props.task.actualStartDate
          newDate = null
          return getDateText(
            isLinkChange,
            DATE_VARIABLES.ACTUAL_START_DATE,
            prevDate,
            newDate,
            false
          )
        case TASK_STATUS.IN_PROGRESS:
          return null
        case TASK_STATUS.DONE:
          prevDate = null
          newDate = new Date()
          return getDateText(
            isLinkChange,
            DATE_VARIABLES.ACTUAL_END_DATE,
            prevDate,
            newDate,
            false
          )
        default:
          return null
      }
    }
  }

  const getDateChanges = () => {
    return props.dateChanges.map(change => {
      return getDateText(
        props.isLinkChange,
        Object.keys(change)[0],
        props.task[Object.keys(change)[0]],
        change[Object.keys(change)[0]]
      )
    })
  }

  const getStatusString = (status, isMilestone) => {
    switch (status) {
      case TASK_STATUS.NOT_REQUIRED:
        return t('taskStatus.task-not-required')
      case TASK_STATUS.NOT_STARTED:
        return isMilestone
          ? t('taskStatus.notYetReached')
          : t('taskStatus.not-started')
      case TASK_STATUS.IN_PROGRESS:
        return t('taskStatus.in-progress')
      case TASK_STATUS.DONE:
        return isMilestone ? t('taskStatus.reached') : t('taskStatus.done')
      default:
        return null
    }
  }

  const getBlockerChanges = () => {
    return (
      <div className={classes.blockerChangeDiv} data-test="task-blocker-alert">
        <AlertIcon className={classes.alertIcon} />
        <Typography>
          {t('taskChange.taskBlocker1') +
            props.blockers.length +
            t('taskChange.taskBlocker2', {
              plural: props.blockers.length > 1 ? 's' : '',
              singular: props.blockers.length > 1 ? 'them' : 'it',
            })}
        </Typography>
      </div>
    )
  }

  return (
    <React.Fragment>
      {props.newStatus &&
        props.task.status !== props.newStatus &&
        getStatusText()}
      {DateTextType()}
      {props.dateChanges && getDateChanges()}
      {props.blockers?.length > 0 && getBlockerChanges()}
    </React.Fragment>
  )
}

export default TaskUpdateChip
