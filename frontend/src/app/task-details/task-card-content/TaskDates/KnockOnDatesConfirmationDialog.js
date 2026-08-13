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

import { TablePagination, Typography } from '@mui/material'
import DialogContent from '@mui/material/DialogContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import dayjs from 'dayjs'
import startCase from 'lodash/startCase'
import React, { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../../../components/dialog/juralio-dialog/JuralioDialog'
import { getDateDisplayString } from '../../../../services/helpers/date-helper'
import rawColours from '../../../../theme/raw-colours'
import { DATE_FORMAT_DAY_MONTH_YEAR, DATE_VARIABLES } from '../../../constants'
const style = makeStyles()(theme => ({
  summaryMessageWrapper: {
    display: 'flex',
    paddingBottom: theme.spacing(),
    flexDirection: 'column',
  },
  summaryDetailsWrapper: {
    display: 'flex',
  },
  reminderTextWrapper: {
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: theme.spacing(),
  },
  affectedTasksWrapper: { display: 'flex', paddingRight: theme.spacing() },
  maxImpactWrapper: { display: 'flex', paddingRight: theme.spacing() },
  summaryTitle: {
    paddingRight: theme.spacing(),
  },
  summaryValue: {
    fontWeight: 'bold',
    fontSize: theme.spacing(2),
  },
  affectedDetailsWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  affectedSubtext: {
    fontSize: theme.spacing(),
  },
  affectedText: {
    display: 'flex',
    fontSize: theme.spacing(1.5),
  },
  tableText: {
    fontSize: theme.spacing(1.5),
  },
  header: {
    backgroundColor: rawColours.primary.grey.main,
  },
  selectedLabel: {
    fontSize: theme.spacing(1.5),
  },
}))

const KnockOnDatesConfirmationDialog = props => {
  const { t } = useTranslation()
  const toDays = 86400000 //1000*60*60*24

  const { classes } = style()
  const [page, setPage] = useState(0)

  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [maxEffect, setMaxEffect] = useState(null)

  const handleChangePage = (e, newPage) => {
    setPage(newPage)
  }

  const generateReminderText = () => {
    let updateKeys = Object.keys(props.dateChange)
    let updateType
    if (updateKeys.length === 1) {
      updateType = updateKeys[0]
    } else {
      updateType = updateKeys.filter(k => k !== 'status')[0]
    }
    let task = props.task
    if (task[updateType] && props.dateChange[updateType]) {
      return (
        <Trans
          i18nkey="taskChange.reminderText1"
          values={{
            updateType: startCase(updateType),
            from: getDateDisplayString(task[updateType]),
            to: getDateDisplayString(props.dateChange[updateType]),
          }}
        >
          You are changing the <strong>{startCase(updateType)}</strong> in this
          task from <strong>{getDateDisplayString(task[updateType])}</strong> to{' '}
          <strong>{getDateDisplayString(props.dateChange[updateType])}</strong>
          .{' '}
        </Trans>
      )
    } else {
      return (
        <Trans
          i18nkey="taskChange.reminderText1"
          values={{
            updateType: startCase(updateType),
            to: getDateDisplayString(props.dateChange[updateType]),
          }}
        >
          You are setting the <strong>{startCase(updateType)}</strong> in this
          task to{' '}
          <strong>{getDateDisplayString(props.dateChange[updateType])}</strong>
          .{' '}
        </Trans>
      )
    }
  }

  const generateSummaryMessage = () => {
    const taskCount = props.updatedTasks
      .map(t => t.id)
      .filter((v, i, self) => self.indexOf(v) === i).length
    return (
      <div
        className={classes.summaryMessageWrapper}
        data-test="summary-message"
      >
        <div className={classes.reminderTextWrapper}>
          <Typography>{generateReminderText()}</Typography>
          <Typography>{t('taskChange.reminderText2')}</Typography>
        </div>
        <div className={classes.summaryDetailsWrapper}>
          <div className={classes.affectedTasksWrapper}>
            <Typography className={classes.summaryTitle}>
              {t('taskChange.affected')}:
            </Typography>
            <Typography
              className={classes.summaryValue}
              data-test="affected-task-count"
            >
              {taskCount}&nbsp;
              {taskCount !== 1 ? t('taskChange.tasks') : t('taskChange.task')}
            </Typography>
          </div>
          <div className={classes.maxImpactWrapper}>
            <Typography className={classes.summaryTitle}>
              {t('taskChange.maxImpact')}:
            </Typography>
            <Typography className={classes.summaryValue} data-test="max-impact">
              {maxEffect}&nbsp;
              {maxEffect !== 1 ? t('taskChange.days') : t('taskChange.day')}
            </Typography>
          </div>
        </div>
      </div>
    )
  }

  const generateTableRow = task => {
    let fullTask = props.tasks.find(t => t.id === task.id)
    if (!fullTask) {
      return null
    }
    let isDurationUpdate = false
    let isPlannedStartUpdate = false
    let isPlannedEndUpdate = false
    let isActualStartUpdate = false
    let isActualEndUpdate = false
    let keys = Object.keys(task)
    if (keys.includes(DATE_VARIABLES.PLANNED_START_DATE)) {
      isPlannedStartUpdate = true
    }
    if (keys.includes(DATE_VARIABLES.PLANNED_END_DATE)) {
      isPlannedEndUpdate = true
    }
    if (keys.includes(DATE_VARIABLES.ACTUAL_START_DATE)) {
      isActualStartUpdate = true
    }
    if (keys.includes(DATE_VARIABLES.ACTUAL_END_DATE)) {
      isActualEndUpdate = true
    }
    if (
      isPlannedStartUpdate &&
      fullTask.plannedStartDate &&
      (fullTask.plannedEndDate || fullTask.actualEndDate)
    ) {
      isDurationUpdate = true
    }
    if (
      isPlannedEndUpdate &&
      (fullTask.plannedStartDate || fullTask.actualStartDate) &&
      fullTask.plannedEndDate
    ) {
      isDurationUpdate = true
    }
    if (
      isActualStartUpdate &&
      fullTask.actualStartDate &&
      (fullTask.actualEndDate || fullTask.plannedEndDate)
    ) {
      isDurationUpdate = true
    }
    if (
      isActualEndUpdate &&
      fullTask.actualStartDate &&
      fullTask.actualEndDate
    ) {
      isDurationUpdate = true
    }

    const generateAffectedDetails = () => {
      return (
        <div
          className={classes.affectedDetailsWrapper}
          data-test="affected-details"
        >
          {isDurationUpdate && (
            <Typography
              className={classes.affectedText}
              data-test="affected-details-duration"
              style={{ fontWeight: 'bold' }}
            >
              {t('taskChange.duration')}
            </Typography>
          )}
          {isPlannedStartUpdate && (
            <Typography
              className={classes.affectedText}
              data-test="affected-details-planned-start"
            >
              {t('taskChange.start')}{' '}
              <Typography className={classes.affectedSubtext}>
                &nbsp; ({t('taskChange.planned')})
              </Typography>
            </Typography>
          )}
          {isPlannedEndUpdate && (
            <Typography
              className={classes.affectedText}
              data-test="affected-details-planned-end"
            >
              {t('taskChange.end')}{' '}
              <Typography className={classes.affectedSubtext}>
                &nbsp; ({t('taskChange.planned')})
              </Typography>
            </Typography>
          )}
          {isActualStartUpdate && (
            <Typography
              className={classes.affectedText}
              data-test="affected-details-actual-start"
            >
              {t('taskChange.start')}{' '}
              <Typography className={classes.affectedSubtext}>
                &nbsp; ({t('taskChange.actual')})
              </Typography>
            </Typography>
          )}
          {isActualEndUpdate && (
            <Typography
              className={classes.affectedText}
              data-test="affected-details-actual-end"
            >
              {t('taskChange.end')}{' '}
              <Typography className={classes.affectedSubtext}>
                &nbsp; ({t('taskChange.actual')})
              </Typography>
            </Typography>
          )}
        </div>
      )
    }

    const generateName = () => {
      return (
        <Typography
          className={classes.tableText}
          data-test="affected-task-name"
        >{`#${fullTask.referenceNumber.slice(3)} ${fullTask.name}`}</Typography>
      )
    }

    const getDuration = () => {
      let duration = 0
      let currentDuration = 0

      if (isPlannedStartUpdate && isPlannedEndUpdate) {
        let PED = dayjs.utc(fullTask.plannedEndDate).startOf('day').toDate()
        let PSD = dayjs.utc(fullTask.plannedStartDate).startOf('day').toDate()
        let newPED = dayjs
          .utc(task[DATE_VARIABLES.PLANNED_END_DATE])
          .startOf('day')
          .toDate()
        let newPSD = dayjs
          .utc(task[DATE_VARIABLES.PLANNED_START_DATE])
          .startOf('day')
          .toDate()
        currentDuration = Math.round((PED.getTime() - PSD.getTime()) / toDays)
        duration = Math.round((newPED.getTime() - newPSD.getTime()) / toDays)
      } else if (isActualStartUpdate && isPlannedEndUpdate) {
        let PED = dayjs.utc(fullTask.plannedEndDate).startOf('day').toDate()
        let ASD = dayjs.utc(fullTask.actualStartDate).startOf('day').toDate()
        let newPED = dayjs
          .utc(task[DATE_VARIABLES.PLANNED_END_DATE])
          .startOf('day')
          .toDate()
        let newASD = dayjs
          .utc(task[DATE_VARIABLES.ACTUAL_START_DATE])
          .startOf('day')
          .toDate()
        currentDuration = Math.round((PED.getTime() - ASD.getTime()) / toDays)
        duration = Math.round((newPED.getTime() - newASD.getTime()) / toDays)
      } else if (isActualStartUpdate && isActualEndUpdate) {
        let AED = dayjs.utc(fullTask.actualEndDate).startOf('day').toDate()
        let ASD = dayjs.utc(fullTask.actualStartDate).startOf('day').toDate()
        let newAED = dayjs
          .utc(task[DATE_VARIABLES.ACTUAL_END_DATE])
          .startOf('day')
          .toDate()
        let newASD = dayjs
          .utc(task[DATE_VARIABLES.ACTUAL_START_DATE])
          .startOf('day')
          .toDate()
        currentDuration = Math.round((AED.getTime() - ASD.getTime()) / toDays)
        duration = Math.round((newAED.getTime() - newASD.getTime()) / toDays)
      } else if (isPlannedStartUpdate) {
        let PED = dayjs.utc(fullTask.plannedEndDate).startOf('day').toDate()
        let PSD = dayjs.utc(fullTask.plannedStartDate).startOf('day').toDate()
        let newPSD = dayjs
          .utc(task[DATE_VARIABLES.PLANNED_START_DATE])
          .startOf('day')
          .toDate()
        currentDuration = Math.round((PED.getTime() - PSD.getTime()) / toDays)
        duration = Math.round((PED.getTime() - newPSD.getTime()) / toDays)
      } else if (isPlannedEndUpdate) {
        let PED = dayjs.utc(fullTask.plannedEndDate).startOf('day').toDate()
        let startDate = fullTask.actualStartDate
          ? fullTask.actualStartDate
          : fullTask.plannedStartDate
        let newPED = dayjs
          .utc(task[DATE_VARIABLES.PLANNED_END_DATE])
          .startOf('day')
          .toDate()
        let SD = dayjs.utc(startDate).startOf('day').toDate()

        currentDuration = Math.round((PED.getTime() - SD.getTime()) / toDays)
        duration = Math.round(
          (newPED.getTime() - new Date(SD).getTime()) / toDays
        )
      } else if (isActualStartUpdate) {
        let endDate = fullTask.actualEndDate
          ? fullTask.actualEndDate
          : fullTask.plannedEndDate
        let ED = dayjs.utc(endDate).startOf('day').toDate()
        let ASD = dayjs.utc(fullTask.actualStartDate).startOf('day').toDate()
        let newASD = dayjs
          .utc(task[DATE_VARIABLES.ACTUAL_START_DATE])
          .startOf('day')
          .toDate()
        currentDuration = Math.round((ED.getTime() - ASD.getTime()) / toDays)
        duration = Math.round((ED.getTime() - newASD.getTime()) / toDays)
      } else if (isActualEndUpdate) {
        let AED = dayjs.utc(fullTask.actualEndDate).startOf('day').toDate()
        let ASD = dayjs.utc(fullTask.actualStartDate).startOf('day').toDate()
        let newAED = dayjs
          .utc(task[DATE_VARIABLES.ACTUAL_END_DATE])
          .startOf('day')
          .toDate()
        currentDuration = Math.round((AED.getTime() - ASD.getTime()) / toDays)
        duration = Math.round((newAED.getTime() - ASD.getTime()) / toDays)
      }

      return [duration, currentDuration]
    }

    const getDateChange = dateType => {
      let oldDate = dayjs(fullTask[dateType].replace('Z', ''))
        .startOf('day')
        .toDate()
        .getTime()
      let newDate = dayjs(task[dateType].replace('Z', ''))
        .startOf('day')
        .toDate()
        .getTime()

      let change = Math.round((newDate - oldDate) / toDays)
      if (Math.abs(change) > maxEffect) {
        setMaxEffect(Math.abs(change))
      }
      return change > 0 ? `+${change}` : change
    }

    const [newDuration, currentDuration] = getDuration()
    const durationDifference = newDuration - currentDuration

    const generateDays = () => {
      return (
        <div className={classes.affectedDetailsWrapper} data-test="days-update">
          {isDurationUpdate && (
            <Typography
              className={classes.tableText}
              style={{ fontWeight: 'bold' }}
            >
              {`${durationDifference > 0 ? '+' : ''}${
                durationDifference !== 0 ? durationDifference : '< 1'
              }`}
            </Typography>
          )}
          {isPlannedStartUpdate && (
            <Typography className={classes.tableText}>
              {getDateChange(DATE_VARIABLES.PLANNED_START_DATE)}
            </Typography>
          )}
          {isPlannedEndUpdate && (
            <Typography className={classes.tableText}>
              {getDateChange(DATE_VARIABLES.PLANNED_END_DATE)}
            </Typography>
          )}

          {isActualStartUpdate && (
            <Typography className={classes.tableText}>
              {getDateChange(DATE_VARIABLES.ACTUAL_START_DATE)}
            </Typography>
          )}
          {isActualEndUpdate && (
            <Typography className={classes.tableText}>
              {getDateChange(DATE_VARIABLES.ACTUAL_END_DATE)}
            </Typography>
          )}
        </div>
      )
    }

    const getFromDate = () => {
      return (
        <div className={classes.affectedDetailsWrapper} data-test="old-date">
          {isDurationUpdate && (
            <Typography
              className={classes.tableText}
              style={{ fontWeight: 'bold' }}
            >
              {currentDuration !== 0 ? currentDuration : '< 1'}
            </Typography>
          )}
          {isPlannedStartUpdate && (
            <Typography className={classes.tableText}>
              {getDateDisplayString(
                fullTask.plannedStartDate.replace('Z', ''),
                DATE_FORMAT_DAY_MONTH_YEAR,
                true
              )}
            </Typography>
          )}
          {isPlannedEndUpdate && (
            <Typography className={classes.tableText}>
              {getDateDisplayString(
                fullTask.plannedEndDate.replace('Z', ''),
                DATE_FORMAT_DAY_MONTH_YEAR,
                true
              )}
            </Typography>
          )}

          {isActualStartUpdate && (
            <Typography className={classes.tableText}>
              {getDateDisplayString(
                fullTask.actualStartDate.replace('Z', ''),
                DATE_FORMAT_DAY_MONTH_YEAR,
                true
              )}
            </Typography>
          )}
          {isActualEndUpdate && (
            <Typography className={classes.tableText}>
              {getDateDisplayString(
                fullTask.actualEndDate.replace('Z', ''),
                DATE_FORMAT_DAY_MONTH_YEAR,
                true
              )}
            </Typography>
          )}
        </div>
      )
    }
    const getToDate = () => {
      return (
        <div className={classes.affectedDetailsWrapper} data-test="new-date">
          {isDurationUpdate && (
            <Typography
              className={classes.tableText}
              style={{ fontWeight: 'bold' }}
            >
              {newDuration !== 0 ? newDuration : '< 1'}
            </Typography>
          )}
          {isPlannedStartUpdate && (
            <Typography className={classes.tableText}>
              {getDateDisplayString(
                task.plannedStartDate.replace('Z', ''),
                DATE_FORMAT_DAY_MONTH_YEAR,
                true
              )}
            </Typography>
          )}
          {isPlannedEndUpdate && (
            <Typography className={classes.tableText}>
              {getDateDisplayString(
                task.plannedEndDate.replace('Z', ''),
                DATE_FORMAT_DAY_MONTH_YEAR,
                true
              )}
            </Typography>
          )}

          {isActualStartUpdate && (
            <Typography className={classes.tableText}>
              {getDateDisplayString(
                task.actualStartDate.replace('Z', ''),
                DATE_FORMAT_DAY_MONTH_YEAR,
                true
              )}
            </Typography>
          )}
          {isActualEndUpdate && (
            <Typography className={classes.tableText}>
              {getDateDisplayString(
                task.actualEndDate.replace('Z', ''),
                DATE_FORMAT_DAY_MONTH_YEAR,
                true
              )}
            </Typography>
          )}
        </div>
      )
    }

    return (
      <TableRow
        style={{
          height: 45,
        }}
      >
        <TableCell>{generateName()}</TableCell>
        <TableCell>{generateAffectedDetails()}</TableCell>
        <TableCell>{generateDays()}</TableCell>
        <TableCell>{getFromDate()}</TableCell>
        <TableCell>{getToDate()}</TableCell>
      </TableRow>
    )
  }

  const generateTable = () => {
    const emptyRows =
      page > 0
        ? rowsPerPage -
          props.updatedTasks.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
          ).length
        : 0

    return (
      <div style={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 560 }}>
          <Table size={'small'} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className={classes.header}>
                  <Typography className={classes.tableText}>
                    {t('taskChange.task')}
                  </Typography>
                </TableCell>
                <TableCell className={classes.header}>
                  {' '}
                  <Typography className={classes.tableText}>
                    {t('taskChange.affected')}
                  </Typography>
                </TableCell>
                <TableCell className={classes.header}>
                  {' '}
                  <Typography className={classes.tableText}>
                    {t('taskChange.days')}
                  </Typography>
                </TableCell>
                <TableCell className={classes.header}>
                  {' '}
                  <Typography className={classes.tableText}>
                    {t('taskChange.from')}
                  </Typography>
                </TableCell>
                <TableCell className={classes.header}>
                  {' '}
                  <Typography className={classes.tableText}>
                    {t('taskChange.to')}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.updatedTasks
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(task => generateTableRow(task))}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[4, props.updatedTasks.length]}
          component="div"
          count={props.updatedTasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value))
          }}
          classes={{
            selectLabel: classes.selectedLabel,
            displayedRows: classes.selectedLabel,
            select: classes.selectedLabel,
            menuItem: classes.selectedLabel,
            input: classes.selectedLabel,
          }}
        />
      </div>
    )
  }
  return (
    <JuralioDialog
      open={true}
      onClose={props.cancelHandler}
      largeSize={true}
      titleText={props.titleText}
      handleAction={props.actionHandler}
      handleCancel={props.cancelHandler}
      actionLabel={t('common.confirm')}
      usageContext={`${props.usageContext}.ConfirmationDialog`}
      style={{ zIndex: 2001 }}
      isKnockOnDialog={true}
    >
      <DialogContent>
        {generateSummaryMessage()}
        {generateTable()}
      </DialogContent>
    </JuralioDialog>
  )
}
export default KnockOnDatesConfirmationDialog
