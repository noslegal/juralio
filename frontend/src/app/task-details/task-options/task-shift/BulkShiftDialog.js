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

import {
  DialogContent,
  Typography,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableCell,
  TableRow,
  TableHead,
  TableBody,
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import JuralioDialog from '../../../../components/dialog/juralio-dialog/JuralioDialog'
import dayjs, { utc } from 'dayjs'

import { useDispatch, useSelector } from 'react-redux'

import JurShift from '../../../../assets/images/JurShift'
import { makeStyles } from 'tss-react/mui'
import {
  DATE_FORMAT_DAY_MONTH_YEAR,
  DATE_SHIFT,
  TASK_MENU_CONTEXT,
  TASK_STATUS,
} from '../../../constants'
import rawColours from '../../../../theme/raw-colours'
import { getDateDisplayString } from '../../../../services/helpers/date-helper'
import taskService from '../../../../services/task/task-service'
import { getMatterIdFromLocation } from '../../../../components/navigation/common/location-context-helper'
import { useLocation } from 'react-router'
import { displaySnackbar } from '../../../global-snackbar/global-snackbar-actions'
import {
  fetchProjectWithPostsAndTaskTeam,
  fetchWorkstreamOverview,
} from '../../../project/project-actions'
import { resetSelectedTask } from '../../../task-map/selected-task/selected-task-actions'
import { fetchTaskmapStructure } from '../../../../redux/ducks/improved-taskmap'
import ShiftImage from '../../../../assets/images/ShiftImage.png'
import { fetchMatterOverview } from '../../../matter-details/matter-details-actions'

const style = makeStyles()(theme => ({
  shiftDatesWrapper: {
    marginTop: theme.spacing(4),
    display: 'flex',
    marginLeft: theme.spacing(10),
  },
  dayFieldDiv: {
    marginTop: theme.spacing(1.5),
    marginLeft: theme.spacing(1.5),
  },
  flexDiv: {
    display: 'flex',
  },
  subtitleText: {
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(4),
    marginLeft: theme.spacing(2),
    justifySelf: 'left',
    fontSize: '0.9rem',
  },
}))

const BulkShiftDialog = props => {
  const { taskMenuContext, cancelHandler } = props
  const dispatch = useDispatch()
  const { classes } = style()
  const location = useLocation()
  dayjs.extend(utc)
  const { t } = useTranslation()
  const [screen, setScreen] = useState(0)
  const [daysShifted, setDaysShifted] = useState(0)
  const [shiftType, setShiftType] = useState(DATE_SHIFT.FORWARD)
  const tasks = useSelector(state =>
    state.project.tasks.filter(
      t =>
        t.status === TASK_STATUS.NOT_STARTED &&
        (t.plannedStartDate || t.plannedEndDate)
    )
  )
  const project = useSelector(state => state.project)

  const handleShiftChange = value => {
    if (value > -1 && value <= 999) {
      setDaysShifted(parseInt(value))
    }
  }
  const matterId = getMatterIdFromLocation(location)

  const handleAction = () => {
    taskService
      .bulkShiftTaskDates(
        matterId,
        project.id,
        daysShifted,
        shiftType,
        tasks.map(t => t.id)
      )
      .then(res => {
        if (res.status === 200) {
          dispatch(displaySnackbar(t('taskShifting.shiftSnackbar')))

          switch (taskMenuContext) {
            case (TASK_MENU_CONTEXT.TASK_MAP, TASK_MENU_CONTEXT.ROADMAP): {
              dispatch(fetchProjectWithPostsAndTaskTeam(matterId, project.id))
              cancelHandler()
              dispatch(fetchTaskmapStructure(matterId, project.id, true))
              dispatch(resetSelectedTask())
              return
            }
            default: {
              cancelHandler()
              if (props.isMatterOverview) {
                dispatch(fetchMatterOverview(matterId))
                dispatch(fetchProjectWithPostsAndTaskTeam(matterId, project.id))
                dispatch(fetchTaskmapStructure(matterId, project.id, true))
              } else {
                dispatch(fetchProjectWithPostsAndTaskTeam(matterId, project.id))
                dispatch(fetchWorkstreamOverview(matterId, project.id))
                dispatch(fetchTaskmapStructure(matterId, project.id, true))
              }
            }
          }
        }
      })
  }

  const generateTable = () => {
    return (
      <div>
        <Table size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography
                  style={{ textAlign: 'center', fontWeight: 1000 }}
                  variant="caption"
                >
                  {t('bulkShifting.phases')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  style={{ textAlign: 'center', fontWeight: 1000 }}
                  variant="caption"
                >
                  {t('bulkShifting.start')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  style={{ textAlign: 'center', fontWeight: 1000 }}
                  variant="caption"
                >
                  {t('bulkShifting.end')}
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map(row => {
              return (
                <TableRow
                  key={row.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {
                      <Typography
                        style={{
                          textAlign: 'center',
                          width: '130px',
                          overflow: 'hidden',
                        }}
                        variant="caption"
                      >
                        {row.name}
                      </Typography>
                    }
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      style={{ textAlign: 'center' }}
                      variant="caption"
                      data-test="start-date-change"
                      dangerouslySetInnerHTML={{
                        __html: row.plannedStartDate
                          ? getDateDisplayString(
                              row.plannedStartDate,
                              DATE_FORMAT_DAY_MONTH_YEAR
                            ) +
                            ' -> ' +
                            '<b>' +
                            getDateDisplayString(
                              shiftType === DATE_SHIFT.FORWARD
                                ? dayjs(row.plannedStartDate).add(
                                    daysShifted,
                                    'd'
                                  )
                                : dayjs(row.plannedStartDate).subtract(
                                    daysShifted,
                                    'd'
                                  ),
                              DATE_FORMAT_DAY_MONTH_YEAR
                            ) +
                            '</b>'
                          : 'N/A',
                      }}
                    ></Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      style={{ textAlign: 'center' }}
                      variant="caption"
                      data-test="end-date-change"
                      dangerouslySetInnerHTML={{
                        __html: row.plannedEndDate
                          ? getDateDisplayString(
                              row.plannedEndDate,
                              DATE_FORMAT_DAY_MONTH_YEAR
                            ) +
                            ' -> ' +
                            '<b>' +
                            getDateDisplayString(
                              shiftType === DATE_SHIFT.FORWARD
                                ? dayjs(row.plannedEndDate).add(
                                    daysShifted,
                                    'd'
                                  )
                                : dayjs(row.plannedEndDate).subtract(
                                    daysShifted,
                                    'd'
                                  ),
                              DATE_FORMAT_DAY_MONTH_YEAR
                            ) +
                            '</b>'
                          : 'N/A',
                      }}
                    ></Typography>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <JuralioDialog
      disableSingleClickAction={true}
      titleIcon={JurShift}
      titleText={t('bulkShifting.title')}
      disabled={daysShifted === 0 || isNaN(daysShifted)}
      cancelText={screen === 0 ? t('common.cancel') : t('common.back')}
      actionLabel={screen === 0 ? t('common.next') : t('common.confirm')}
      handleAction={() => {
        if (screen === 0) {
          setScreen(screen + 1)
        } else if (screen === 1) {
          handleAction()
        }
      }}
      handleCancel={() => {
        if (screen === 0) {
          cancelHandler()
        } else if (screen === 1) {
          setScreen(screen - 1)
        }
      }}
      open={true}
    >
      <div style={{ textAlignLast: 'center' }}>
        <DialogContent>
          <Typography
            dangerouslySetInnerHTML={{
              __html:
                screen === 0
                  ? t('bulkShifting.subtitle', {
                      tasks: tasks.length,
                    })
                  : t('bulkShifting.subtitle2', {
                      tasks: tasks.length,
                      daysShifted: daysShifted,
                      type:
                        shiftType === DATE_SHIFT.FORWARD
                          ? t('taskShifting.forward')
                          : t('taskShifting.backward'),
                    }),
            }}
            variant="body1"
            className={classes.subtitleText}
          ></Typography>
          {screen === 0 && (
            <>
              <div className={classes.imageDiv}>
                <img
                  src={ShiftImage}
                  alt="Shift desciption"
                  width={400}
                  height={150}
                />
              </div>
              <div className={classes.shiftDatesWrapper}>
                <div className={classes.dayFieldDiv}>
                  <div className={classes.flexDiv}>
                    <TextField
                      data-test="days-field"
                      onChange={e => handleShiftChange(e.target.value)}
                      value={daysShifted}
                      type={'number'}
                    ></TextField>
                    <Typography
                      style={{ marginTop: '10px', marginLeft: '4px' }}
                    >
                      {t('taskShifting.days')}
                    </Typography>
                    <ToggleButtonGroup
                      style={{
                        marginTop: ' -16px',
                        marginLeft: '20px',
                        marginBottom: '16px',
                      }}
                      orientation="vertical"
                      value={shiftType}
                      exclusive
                      onChange={e => {
                        setShiftType(e.target.value)
                      }}
                    >
                      <ToggleButton
                        data-test="forward-button"
                        style={
                          shiftType === DATE_SHIFT.FORWARD
                            ? {
                                backgroundColor:
                                  rawColours.primary.primary.main,
                                color: '#FFFFFF',
                                textTransform: 'none',
                              }
                            : {
                                backgroundColor: '#EAF4FC',
                                color: '#004D6D',
                                textTransform: 'none',
                              }
                        }
                        size="small"
                        value={DATE_SHIFT.FORWARD}
                      >
                        {t('taskShifting.forward')}
                      </ToggleButton>
                      <ToggleButton
                        data-test="backward-button"
                        style={
                          shiftType === DATE_SHIFT.BACKWARD
                            ? {
                                backgroundColor:
                                  rawColours.primary.primary.main,
                                color: '#FFFFFF',
                                textTransform: 'none',
                              }
                            : {
                                backgroundColor: '#EAF4FC',
                                color: '#004D6D',
                                textTransform: 'none',
                              }
                        }
                        size="small"
                        value={DATE_SHIFT.BACKWARD}
                      >
                        {t('taskShifting.backward')}
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </div>
                </div>
              </div>
            </>
          )}
          {screen === 1 && generateTable()}
        </DialogContent>
      </div>
    </JuralioDialog>
  )
}

export default BulkShiftDialog
