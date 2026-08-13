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
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import JuralioDialog from '../../../../components/dialog/juralio-dialog/JuralioDialog'
import { getDateDisplayString } from '../../../../services/helpers/date-helper'
import dayjs, { utc } from 'dayjs'
import { DATE_SHIFT, TASK_MENU_CONTEXT } from '../../../constants'
import taskService from '../../../../services/task/task-service'
import { useDispatch } from 'react-redux'
import {
  fetchProjectOverview,
  fetchProjectWithPostsAndTaskTeam,
} from '../../../project/project-actions'
import {
  fetchTaskDetails,
  resetSelectedTask,
} from '../../../task-map/selected-task/selected-task-actions'
import JurShift from '../../../../assets/images/JurShift'
import ShiftImage from '../../../../assets/images/ShiftImage.png'
import { makeStyles } from 'tss-react/mui'
import InfoIcon from '@mui/icons-material/Info'
import juralioColours from '../../../../theme/juralio-colours'
import { displaySnackbar } from '../../../global-snackbar/global-snackbar-actions'
import rawColours from '../../../../theme/raw-colours'

const style = makeStyles()(theme => ({
  imageDiv: {
    textAlignLast: 'center',
    marginBottom: theme.spacing(1.5),
  },
  shiftDatesWrapper: {
    marginTop: theme.spacing(1.5),
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
  infoIcon: {
    color: juralioColours.darkText.secondary,
  },
}))

const ShiftTaskDialog = props => {
  const dispatch = useDispatch()
  const { classes } = style()
  dayjs.extend(utc)
  const { t } = useTranslation()
  const [errorText, setErrorText] = useState('')
  const unset = t('taskShifting.unset')
  const [minDateBound, setMinDateBound] = useState()
  const [maxDateBound, setMaxDateBound] = useState()
  const [daysShifted, setDaysShifted] = useState(0)
  const [shiftType, setShiftType] = useState(DATE_SHIFT.FORWARD)
  const [shiftedStart, setShiftedStart] = useState(
    props.task.plannedStartDate
      ? getDateDisplayString(dayjs(props.task.plannedStartDate))
      : unset
  )
  const [shiftedEnd, setShiftedEnd] = useState(
    props.task.plannedEndDate
      ? getDateDisplayString(dayjs.utc(props.task.plannedEndDate))
      : unset
  )

  useEffect(() => {
    taskService
      .getMinMaxBoundsUpTree(
        props.matterId,
        props.task.project?.id || props.task.projectId,
        props.task.id
      )
      .then(res => {
        if (res.status === 200) {
          setMinDateBound(dayjs.utc(res.body.minDate).startOf('D'))
          setMaxDateBound(dayjs.utc(res.body.maxDate).startOf('D'))
        }
      })
    //eslint-disable-next-line
  }, [])

  const handleShiftChange = value => {
    if (value > -1 && value <= 999) {
      setDaysShifted(parseInt(value))
      if (value.toString() !== '') {
        generateShiftedDates(parseInt(value), shiftType)
      }
    }
  }

  const generateShiftedDates = (value, shiftString) => {
    setErrorText('')
    if (props.task.plannedStartDate) {
      if (shiftString === DATE_SHIFT.FORWARD) {
        if (
          maxDateBound.diff(
            dayjs
              .utc(props.task.plannedStartDate)
              .startOf('D')
              .add(value, 'day'),
            'day'
          ) < 0 ||
          minDateBound.diff(
            dayjs
              .utc(props.task.plannedStartDate)
              .startOf('D')
              .add(value, 'day'),
            'day'
          ) > 0
        ) {
          setErrorText(t('taskShifting.outOfParentBounds'))
        }

        setShiftedStart(
          getDateDisplayString(
            dayjs
              .utc(props.task.plannedStartDate)
              .startOf('D')
              .add(value, 'day')
          )
        )
      } else {
        if (
          maxDateBound.diff(
            dayjs
              .utc(props.task.plannedStartDate)
              .startOf('D')
              .subtract(value, 'day'),
            'day'
          ) < 0 ||
          minDateBound.diff(
            dayjs
              .utc(props.task.plannedStartDate)
              .startOf('D')
              .subtract(value, 'day'),
            'day'
          ) > 0
        ) {
          setErrorText(t('taskShifting.outOfParentBounds'))
        }

        setShiftedStart(
          getDateDisplayString(
            dayjs
              .utc(props.task.plannedStartDate)
              .startOf('D')
              .subtract(value, 'day')
          )
        )
      }
    }

    if (props.task.plannedEndDate) {
      if (shiftString === DATE_SHIFT.FORWARD) {
        if (
          maxDateBound.diff(
            dayjs.utc(props.task.plannedEndDate).startOf('D').add(value, 'day'),
            'day'
          ) < 0 ||
          minDateBound.diff(
            dayjs.utc(props.task.plannedEndDate).startOf('D').add(value, 'day'),
            'day'
          ) > 0
        ) {
          setErrorText(t('taskShifting.outOfParentBounds'))
        }

        setShiftedEnd(
          getDateDisplayString(
            dayjs.utc(props.task.plannedEndDate).startOf('D').add(value, 'day')
          )
        )
      } else {
        if (
          maxDateBound.diff(
            dayjs
              .utc(props.task.plannedEndDate)
              .startOf('D')
              .subtract(value, 'day'),
            'day'
          ) < 0 ||
          minDateBound.diff(
            dayjs
              .utc(props.task.plannedEndDate)
              .startOf('D')
              .subtract(value, 'day'),
            'day'
          ) > 0
        ) {
          setErrorText(t('taskShifting.outOfParentBounds'))
        }

        setShiftedEnd(
          getDateDisplayString(
            dayjs.utc(props.task.plannedEndDate).subtract(value, 'day')
          )
        )
      }
    }
  }

  const handleAction = () => {
    taskService
      .shiftTaskDates(
        props.matterId,
        props.task.projectId,
        props.task.id,
        daysShifted,
        shiftType
      )
      .then(() => {
        const taskParentId =
          !props.task.parent || props.task.parent.type === 'PROJECT'
            ? null
            : props.task.parent.id

        dispatch(displaySnackbar(t('taskShifting.shiftSnackbar')))

        switch (props.taskMenuContext) {
          case (TASK_MENU_CONTEXT.TASK_MAP, TASK_MENU_CONTEXT.ROADMAP): {
            dispatch(
              fetchProjectWithPostsAndTaskTeam(
                props.matterId,
                props.task.projectId
              )
            )
            props.closeHandler()
            props.updateProjectTaskmap(
              props.matterId,
              props.task.projectId,
              true
            )
            dispatch(resetSelectedTask())
            return
          }
          case TASK_MENU_CONTEXT.SUBTASK_PANEL: {
            props.closeHandler()
            props.updateProjectTaskmap(
              props.matterId,
              props.task.projectId,
              true
            )
            return props.task.level > 1
              ? dispatch(
                  fetchTaskDetails(
                    props.matterId,
                    props.task.projectId,
                    taskParentId
                  )
                )
              : dispatch(
                  fetchProjectOverview(props.matterId, props.task.projectId)
                )
          }
          default: {
            props.closeHandler()
            props.updateProjectTaskmap(
              props.matterId,
              props.task.projectId,
              true
            )
            dispatch(
              fetchTaskDetails(
                props.matterId,
                props.task.projectId,
                props.task.id
              )
            )
          }
        }
      })
  }

  return (
    <JuralioDialog
      titleIcon={JurShift}
      titleText={t('taskShifting.title')}
      disabled={
        daysShifted === 0 || isNaN(daysShifted) || errorText || props.disabled
      }
      actionLabel={t('common.confirm')}
      handleAction={() => {
        handleAction()
      }}
      handleCancel={() => {
        props.closeHandler()
      }}
      open={props.display}
    >
      <div style={{ textAlignLast: 'center' }}>
        <DialogContent>
          <div className={classes.imageDiv}>
            <img
              src={ShiftImage}
              alt="Shift desciption"
              width={400}
              height={150}
            />
          </div>
          <div>
            <Typography
              data-test="current-planned-start"
              style={{ marginLeft: '60px' }}
              className={classes.flexDiv}
            >
              {t('taskShifting.currentDates')}
              {props.task.plannedStartDate
                ? getDateDisplayString(dayjs.utc(props.task.plannedStartDate))
                : t('taskShifting.unset')}
              {' -> '}
              <Typography
                data-test="shifted-planned-start"
                style={{ fontWeight: 'bold' }}
              >
                {shiftedStart}
              </Typography>
            </Typography>
            <Typography
              data-test="current-planned-end"
              style={{ marginLeft: '60px', marginTop: '8px' }}
              className={classes.flexDiv}
            >
              {t('taskShifting.newDates')}
              {props.task.plannedEndDate
                ? getDateDisplayString(dayjs.utc(props.task.plannedEndDate))
                : t('taskShifting.unset')}
              {' -> '}
              <Typography
                data-test="shifted-planned-end"
                style={{ fontWeight: 'bold' }}
              >
                {shiftedEnd}
              </Typography>
            </Typography>
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
                <Typography style={{ marginTop: '10px', marginLeft: '4px' }}>
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
                    generateShiftedDates(daysShifted, e.target.value)
                  }}
                >
                  <ToggleButton
                    data-test="forward-button"
                    style={
                      shiftType === DATE_SHIFT.FORWARD
                        ? {
                            backgroundColor: rawColours.primary.primary.main,
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
                            backgroundColor: rawColours.primary.primary.main,
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

              {errorText && (
                <Typography data-test="out-of-bounds" color={'error'}>
                  {errorText}
                </Typography>
              )}
            </div>
          </div>
          {props.task.tasks.length > 0 && (
            <div data-test="shift-subtask-info" className={classes.flexDiv}>
              <InfoIcon className={classes.infoIcon} />
              <Typography style={{ marginTop: '2px', marginLeft: '8px' }}>
                {t('taskShifting.shiftSubtasks')}
              </Typography>
            </div>
          )}
        </DialogContent>
      </div>
    </JuralioDialog>
  )
}

export default ShiftTaskDialog
