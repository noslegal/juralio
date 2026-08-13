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

import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DateRangeIcon from '@mui/icons-material/DateRange'
import { IconButton, Tooltip, Typography } from '@mui/material'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import React from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withStyles } from 'tss-react/mui'
import DateField from '../../../../components/inputs/date-field/DateField'
import {
  actualStartDateIsValid,
  getMilestoneDateLimits,
  isInThePast,
  isInThePastOrToday,
} from '../../../../services/helpers/date-helper'
import { flatTaskListFromTree } from '../../../../services/task/data-provider/task-list-data-provider'
import juralioColours from '../../../../theme/juralio-colours'
import { DATE_VARIABLES, TASK_STATUS } from '../../../constants'
import { displaySnackbar } from '../../../global-snackbar/global-snackbar-actions'
import ConfirmDateTimeChangeContainer from './ConfirmDateTimeChangeContainer'

const styles = theme => ({
  outerRoot: { display: 'flex' },
  root: {
    marginTop: theme.spacing(),
  },
  notRequiredText: {
    color: juralioColours.darkText.secondary,
  },
  dateRow: {
    display: 'flex',
  },
  expansion: {
    marginLeft: theme.spacing(),
    alignContent: 'right',
    width: 55,
  },
  calendarIcon: {
    padding: theme.spacing(),
    paddingTop: theme.spacing(4),
    paddingLeft: 0,
  },
  expandableDates: {
    transition: '1s',
  },
  collapsableDates: {
    transform: 'rotate(90deg)',
    transition: '1s',
  },
  iconButton: {
    height: theme.spacing(2),
    width: theme.spacing(2),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
})

const getDateValue = date => (date ? date : undefined)
const noOpFunc = () => {}

class TaskDates extends React.Component {
  state = { showAllDates: false }

  adjustTimeOfDay(dateName, date) {
    if (!date) {
      return
    }

    if (dateName.indexOf('Start') > -1) {
      date.setUTCHours(0, 0, 0, 0) //.startOf('day')
    } else if (dateName === DATE_VARIABLES.ACTUAL_END_DATE) {
      date.setHours(new Date().getHours())
      date.setMinutes(new Date().getMinutes())
    } else {
      // date.setUTCHours(23, 59, 59, 999) //.endOf('day')
      date.setHours(22, 59, 59, 999) //.endOf('day')
    }
  }

  updateActualStartDate(date) {
    if (actualStartDateIsValid(new Date(date).toISOString(), this.props.task)) {
      this.updateDate(DATE_VARIABLES.ACTUAL_START_DATE, date)
    } else {
      this.props.actions.displaySnackBar(
        this.props.t('taskMapDates.ASDLaterThanAED')
      )
    }
  }

  updateDate(dateName, date) {
    let _d = date

    let newDate
    if (date) {
      dayjs.extend(utc)
      dayjs.extend(timezone)
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
    this.props.updateHandler({
      [dateName]: _d ? _d.toISOString() : _d,
      dateCleared: _d === null,
    })
  }

  renderPlannedStartDate = () => {
    const isTaskNotStarted = this.props.task.status === TASK_STATUS.NOT_STARTED
    const isDone = this.props.task.status === TASK_STATUS.DONE
    return (
      <DateField
        task={this.props.task}
        dateType={DATE_VARIABLES.START}
        fullType={DATE_VARIABLES.PSD}
        label={
          getDateValue(this.props.task.plannedStartDate?.replace('Z', ''))
            ? isTaskNotStarted
              ? this.props.t('taskDetails.dates.startingOn')
              : this.props.t('taskDetails.dates.plannedStart')
            : this.props.t('taskDates.prompts.setPlannedStartDate')
        }
        data-test="planned-start-date"
        value={getDateValue(this.props.task.plannedStartDate?.replace('Z', ''))}
        onChange={date =>
          this.updateDate(DATE_VARIABLES.PLANNED_START_DATE, date)
        }
        maxDate={getDateValue(this.props.task.plannedEndDate?.replace('Z', ''))}
        clearable
        width={this.props.width}
        error={
          isTaskNotStarted &&
          this.props.task.plannedStartDate &&
          isInThePastOrToday(
            getDateValue(this.props.task.plannedStartDate?.replace('Z', ''))
          )
        }
        hideIcon={true}
        isTaskNotStarted={isTaskNotStarted}
        disabled={this.props.viewOnly || !isTaskNotStarted}
        viewOnly={this.props.viewOnly}
        customTooltip={
          isDone
            ? this.props.t('taskDates.lockedDone')
            : this.props.t('taskDates.lockedStarted')
        }
      />
    )
  }

  renderActualStartDate = () => {
    return (
      <DateField
        task={this.props.task}
        dateType={DATE_VARIABLES.START}
        fullType={DATE_VARIABLES.ASD}
        label={this.props.t('taskDetails.dates.startedOn')}
        data-test="actual-start-date"
        disabled={this.props.viewOnly}
        value={getDateValue(this.props.task.actualStartDate?.replace('Z', ''))}
        onChange={date => this.updateActualStartDate(date)}
        disableFuture={this.props.task.status !== TASK_STATUS.IN_PROGRESS}
        maxDate={
          this.props.task.status === TASK_STATUS.IN_PROGRESS
            ? new Date()
            : getDateValue(this.props.task.actualEndDate?.replace('Z', ''))
        }
        width={this.props.width}
        hideIcon={true}
        viewOnly={this.props.viewOnly}
      />
    )
  }

  renderPlannedEndDate = () => {
    const isNotDone = this.props.task.status !== TASK_STATUS.DONE
    const isTaskNotStarted = this.props.task.status === TASK_STATUS.NOT_STARTED
    const isDone = this.props.task.status === TASK_STATUS.DONE

    return (
      <DateField
        task={this.props.task}
        dateType={DATE_VARIABLES.END}
        fullType={DATE_VARIABLES.PED}
        label={
          getDateValue(this.props.task.plannedEndDate?.replace('Z', ''))
            ? isNotDone
              ? this.props.t('taskDetails.dates.dueToEnd')
              : this.props.t('taskDetails.dates.plannedEnd')
            : this.props.t('taskDates.prompts.setPlannedEndDate')
        }
        data-test="planned-end-date"
        disabled={this.props.viewOnly || isDone}
        value={getDateValue(this.props.task.plannedEndDate?.replace('Z', ''))}
        onChange={date =>
          this.updateDate(DATE_VARIABLES.PLANNED_END_DATE, date)
        }
        clearable
        minDate={getDateValue(this.props.task.plannedStartDate)}
        width={this.props.width}
        error={
          isNotDone &&
          this.props.task.plannedEndDate &&
          isInThePast(getDateValue(this.props.task.plannedEndDate))
        }
        hideIcon={true}
        isTaskNotStarted={isTaskNotStarted}
        viewOnly={this.props.viewOnly}
        customTooltip={isDone ? this.props.t('taskDates.lockedDone') : ''}
      />
    )
  }

  _renderMilestoneDate = () => {
    const task = this.props.task
    const isNotDone = task.status === TASK_STATUS.NOT_STARTED
    const renderDate =
      task.status === TASK_STATUS.NOT_STARTED
        ? task.plannedEndDate?.replace('Z', '')
        : task.actualEndDate?.replace('Z', '')
    const dateLimits = getMilestoneDateLimits(task)

    return (
      <DateField
        task={this.props.task}
        dateType={DATE_VARIABLES.END}
        fullType={
          this.props.task.status === TASK_STATUS.DONE
            ? DATE_VARIABLES.AED
            : DATE_VARIABLES.PED
        }
        label={
          getDateValue(renderDate)
            ? isNotDone
              ? this.props.t('taskMapDates.milestonePlan')
              : this.props.t('taskMapDates.milestoneEnd')
            : this.props.t('taskDates.prompts.setPlannedEndDate')
        }
        data-test="actual-milestone-end-date"
        disabled={this.props.viewOnly}
        value={getDateValue(renderDate)}
        onChange={
          isNotDone
            ? date => this.updateDate(DATE_VARIABLES.PLANNED_END_DATE, date)
            : date => this.updateDate(DATE_VARIABLES.ACTUAL_END_DATE, date)
        }
        clearable={false}
        minDate={dateLimits.minDate}
        maxDate={dateLimits.maxDate}
        width={this.props.width}
        error={
          isNotDone &&
          renderDate &&
          isInThePastOrToday(getDateValue(renderDate))
        }
        hideIcon={true}
        viewOnly={this.props.viewOnly}
      />
    )
  }

  renderActualEndDate = () => {
    return (
      <DateField
        task={this.props.task}
        dateType={DATE_VARIABLES.END}
        fullType={DATE_VARIABLES.AED}
        label={this.props.t('taskDetails.dates.endedOn')}
        data-test="actual-end-date"
        value={getDateValue(this.props.task.actualEndDate?.replace('Z', ''))}
        onChange={date => this.updateDate(DATE_VARIABLES.ACTUAL_END_DATE, date)}
        disableFuture={true}
        minDate={getDateValue(
          this.props.task.actualStartDate?.replace('Z', '')
        )}
        maxDate={new Date()}
        width={this.props.width}
        hideIcon={true}
        viewOnly={this.props.viewOnly}
      />
    )
  }

  renderDateExpansionButton = () => {
    return (
      <IconButton
        onClick={() => {
          this.setState({ showAllDates: !this.state.showAllDates })
        }}
        className={this.props.classes.iconButton}
        data-test="date-expansion-button"
        size="large"
      >
        <Tooltip
          title={
            this.state.showAllDates
              ? this.props.t('taskDates.showFewerDates')
              : this.props.t('taskDates.showMoreDates')
          }
        >
          <ChevronRightIcon
            className={
              this.state.showAllDates
                ? this.props.classes.collapsableDates
                : this.props.classes.expandableDates
            }
          />
        </Tooltip>
      </IconButton>
    )
  }

  renderNotStartedDates = () => {
    return (
      <div className={this.props.classes.root}>
        <div className={this.props.classes.dateRow}>
          {this.renderPlannedStartDate()}
          {this.renderPlannedEndDate()}
        </div>
        <ConfirmDateTimeChangeContainer
          tasks={flatTaskListFromTree(this.props.project)}
          matterId={this.props.matterId}
          projectId={this.props.project.id}
          onCancel={noOpFunc}
        />
      </div>
    )
  }
  renderInProgressDates = () => {
    return (
      <div className={this.props.classes.root}>
        <div className={this.props.classes.dateRow}>
          {this.state.showAllDates
            ? this.renderPlannedStartDate()
            : this.renderActualStartDate()}
          {this.renderPlannedEndDate()}
          {this.renderDateExpansionButton()}
        </div>
        <div className={this.props.classes.dateRow}>
          <div style={{ width: '45%' }}>
            {this.state.showAllDates && this.renderActualStartDate()}
          </div>
        </div>
        <ConfirmDateTimeChangeContainer
          tasks={flatTaskListFromTree(this.props.project)}
          matterId={this.props.matterId}
          projectId={this.props.project.id}
          onCancel={noOpFunc}
        />
      </div>
    )
  }
  renderDoneDates = () => {
    return (
      <div className={this.props.classes.root}>
        <>
          <div className={this.props.classes.dateRow}>
            {this.state.showAllDates && this.renderPlannedStartDate()}
            {this.state.showAllDates && this.renderPlannedEndDate()}
            {!this.state.showAllDates && this.renderActualStartDate()}
            {!this.state.showAllDates && this.renderActualEndDate()}
            {
              <div className={this.props.classes.expansion}>
                {this.renderDateExpansionButton()}
              </div>
            }
          </div>
          <div className={this.props.classes.dateRow}>
            {this.state.showAllDates && this.renderActualStartDate()}
            {this.state.showAllDates && this.renderActualEndDate()}
            {this.state.showAllDates && (
              <div className={this.props.classes.expansion}>&nbsp;</div>
            )}
          </div>
        </>
        <ConfirmDateTimeChangeContainer
          matterId={this.props.matterId}
          projectId={this.props.project.id}
          tasks={flatTaskListFromTree(this.props.project)}
          onCancel={noOpFunc}
        />
      </div>
    )
  }
  renderMilestoneDate = () => {
    return (
      <div className={this.props.classes.root}>
        <div className={this.props.classes.dateRow}>
          {this._renderMilestoneDate()}
        </div>
        <ConfirmDateTimeChangeContainer
          tasks={flatTaskListFromTree(this.props.project)}
          matterId={this.props.matterId}
          projectId={this.props.project.id}
          onCancel={noOpFunc}
        />
      </div>
    )
  }

  renderDateContent() {
    if (this.props.task.isMilestone) {
      return this.renderMilestoneDate()
    }
    const taskStatus = this.props.task.status
    if (taskStatus === TASK_STATUS.NOT_STARTED) {
      return this.renderNotStartedDates()
    } else if (taskStatus === TASK_STATUS.IN_PROGRESS) {
      return this.renderInProgressDates()
    } else if (taskStatus === TASK_STATUS.DONE) {
      return this.renderDoneDates()
    } else if (taskStatus === TASK_STATUS.NOT_REQUIRED) {
      return (
        <Typography
          data-test="key-dates-not-required"
          className={this.props.classes.notRequiredText}
        >
          {this.props.t('taskDates.notRequired')}
        </Typography>
      )
    }
  }

  render() {
    if (this.props.task.status) {
      return (
        <div className={this.props.classes.outerRoot}>
          {this.props.task.status !== TASK_STATUS.NOT_REQUIRED && (
            <div className={this.props.classes.calendarIcon}>
              <DateRangeIcon />
            </div>
          )}
          <div>{this.renderDateContent()}</div>
        </div>
      )
    }

    return null
  }
}

function mapStateToProps(state) {
  return {
    project: state.project,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      displaySnackBar: bindActionCreators(displaySnackbar, dispatch),
    },
  }
}

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(withStyles(TaskDates, styles))
)
