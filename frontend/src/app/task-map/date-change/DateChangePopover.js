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

import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import React, { useEffect, useState } from 'react'
import { withTranslation } from 'react-i18next'
import { connect, useDispatch, useSelector } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withStyles } from 'tss-react/mui'
import DatePicker from '../../../components/inputs/date-field/DatePicker'
import { replaceTask } from '../../../redux/ducks/improved-taskmap'
import { closeDatePicker } from '../../../redux/ducks/improved-taskmap-interactions'
import { getMilestoneDateLimits } from '../../../services/helpers/date-helper'
import juralioColours from '../../../theme/juralio-colours'
import { DATE_VARIABLES, TASK_STATUS } from '../../constants'
import { displaySnackbar } from '../../global-snackbar/global-snackbar-actions'
import { fetchProjectWithPostsAndTaskTeam } from '../../project/project-actions'
import { hideTaskmapDatePickerForTask } from '../../task-details/task-actions'
import { updateTaskDetails } from '../selected-task/selected-task-actions'
import { isInRoadmapContext } from '../../../services/helpers/route/route-context-helper'
const styles = theme => ({
  datePickerToolbarWrapper: {
    display: 'flex',
    backgroundColor: juralioColours.icon,
    height: theme.spacing(4),
  },
  datePickerToolbarText: {
    margin: 'auto',
  },
})

const generateMinMaxDates = (isStartDate, selectedTask) => {
  const getDateValue = date => (date ? date : new Date())
  let minDate = new Date(null)
  let maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 100))
  if (isStartDate) {
    if (selectedTask.status === TASK_STATUS.NOT_STARTED) {
      if (selectedTask.plannedEndDate) {
        maxDate = getDateValue(selectedTask.plannedEndDate?.replace('Z', ''))
      }
    } else {
      if (selectedTask.actualEndDate) {
        maxDate = getDateValue(selectedTask.actualEndDate?.replace('Z', ''))
      }
    }
  } else {
    minDate = selectedTask.plannedStartDate?.replace('Z', '')
  }
  if (selectedTask.status === TASK_STATUS.DONE && !isStartDate) {
    minDate = selectedTask.actualStartDate?.replace('Z', '')
  }
  return [minDate, maxDate]
}

const DateChangePopover = props => {
  const inTaskDetails = props.isInTaskDetails || false

  let selectedTask = inTaskDetails
    ? props.task
    : props.taskmap.selectedTask || props.task

  selectedTask =
    props.ipTaskmap.tasks.length !== 0 && !inTaskDetails
      ? props.ipTaskmap.tasks.find(task => task.id === selectedTask.id)
      : selectedTask

  let selectedTaskInState = useSelector(state => state.selectedTask)
  if (isInRoadmapContext() && selectedTask.id === selectedTaskInState.id) {
    if (
      selectedTaskInState.plannedStartDate ||
      selectedTaskInState.plannedEndDate ||
      selectedTaskInState.actualStartDate ||
      selectedTaskInState.actualEndDate
    ) {
      selectedTask = selectedTaskInState
    }
  }

  const [dateType, setDateType] = useState(getDateType())
  const dispatch = useDispatch()
  const isStartDate = dateType === DATE_VARIABLES.START
  const startDate = selectedTask?.actualStartDate
    ? selectedTask?.actualStartDate?.replace('Z', '')
    : selectedTask?.plannedStartDate?.replace('Z', '')
  const endDate = selectedTask?.actualEndDate
    ? selectedTask?.actualEndDate?.replace('Z', '')
    : selectedTask?.plannedEndDate?.replace('Z', '')
  useEffect(() => {
    setIsOpen(true)
  }, [selectedTask?.id])
  const [selectedDate, setSelectedDate] = useState(getInitValue())
  const [isOpen, setIsOpen] = useState(true)
  const [fullType, setFullType] = useState(props.fullType)
  if (!selectedTask) {
    return null
  }

  const isCompletedMilestone =
    selectedTask?.isMilestone && selectedTask.status === TASK_STATUS.DONE

  const isActualStartDate = isStartDate && selectedTask.actualStartDate
  const isActualEndDate = !isStartDate && selectedTask.actualEndDate

  const minMaxDates = generateMinMaxDates(isStartDate, selectedTask)
  let minDate = new Date(minMaxDates[0])
  let maxDate = new Date(minMaxDates[1])

  if (isActualStartDate || isActualEndDate) {
    maxDate = new Date()
  } else if (maxDate instanceof Date && isNaN(maxDate)) {
    maxDate = new Date()
    maxDate.setFullYear(2099)
  }

  if (selectedTask.isMilestone) {
    const limits = getMilestoneDateLimits(selectedTask)
    minDate = limits.minDate
    maxDate = limits.maxDate
  }

  const projectId = props.forceFetch ? selectedTask.projectId : props.project.id
  const matterId = props.forceFetch
    ? selectedTask.matterId
    : props.project.matterId

  function getInitValue() {
    if (dateType === DATE_VARIABLES.START && startDate) {
      return new Date(Date.parse(startDate))
    } else if (dateType === DATE_VARIABLES.END && endDate) {
      return new Date(Date.parse(endDate))
    }
    return null
  }

  function getDateType() {
    if (props.taskmap?.dateType) {
      return props.taskmap.dateType
    } else {
      return props.dateType
    }
  }

  const swapDialogType = () => {
    //swap the type
    if (dateType === DATE_VARIABLES.START) {
      if (fullType === DATE_VARIABLES.ASD) {
        if (selectedTask.actualEndDate) {
          setFullType(DATE_VARIABLES.AED)
        } else {
          setFullType(DATE_VARIABLES.PED)
        }
      } else if (fullType === DATE_VARIABLES.PSD) {
        setFullType(DATE_VARIABLES.PED)
      }
      setDateType(DATE_VARIABLES.END)
      setSelectedDate(endDate ? new Date(Date.parse(endDate)) : null)
    } else {
      //end
      if (fullType === DATE_VARIABLES.PED) {
        if (selectedTask.actualStartDate && !selectedTask.actualEndDate) {
          setFullType(DATE_VARIABLES.ASD)
        } else {
          setFullType(DATE_VARIABLES.PSD)
        }
      } else if (fullType === DATE_VARIABLES.AED) {
        setFullType(DATE_VARIABLES.ASD)
      }
      setDateType(DATE_VARIABLES.START)
      setSelectedDate(startDate ? new Date(Date.parse(startDate)) : null)
    }
  }

  const updateDate = e => {
    setIsOpen(false)
    if (inTaskDetails) {
      props.onChange(e)
      return
    }
    let newDate
    if (e) {
      dayjs.extend(utc)
      dayjs.extend(timezone)
      newDate = dayjs(new Date(e.getFullYear(), e.getMonth(), e.getDate())).utc(
        true
      )
    } else {
      newDate = dayjs(e)
    }

    setSelectedDate(e !== null ? newDate.toDate().toISOString() : null)
    const properties = {}
    if (dateType === DATE_VARIABLES.START) {
      if (selectedTask.actualStartDate) {
        properties.actualStartDate = e ? newDate.toDate().toISOString() : null
      } else {
        newDate = newDate.startOf('day')
        properties.plannedStartDate = e ? newDate.toDate().toISOString() : null
      }
    } else if (
      isCompletedMilestone ||
      selectedTask.status === TASK_STATUS.DONE
    ) {
      properties.actualEndDate = e ? newDate.toDate().toISOString() : null
    } else {
      newDate = newDate.endOf('day')
      properties.plannedEndDate = e ? newDate.toDate().toISOString() : null
    }
    if (e === null) {
      properties.dateCleared = true
    }
    props.actions
      .updateTaskDetails(
        matterId,
        projectId,
        selectedTask.id,
        properties,
        false,
        props.inTaskMap
      )
      .then(resp => {
        if (
          resp &&
          resp.type ===
            'CONFIRM_HAS_PARENT_IN_PROGRESS_ASD_LATER_THAN_CHILD_DONE_AED'
        ) {
          props.actions.displaySnackBar(props.t('taskMapDates.ASDLaterThanAED'))
          getInitValue()
        } else {
          if (resp && resp.task) {
            dispatch(replaceTask(resp.task))
          }
        }
      })
  }

  const canBeCleared = () => {
    if (selectedTask.status === TASK_STATUS.DONE) {
      return false
    } else if (
      selectedTask.status === TASK_STATUS.IN_PROGRESS &&
      dateType === DATE_VARIABLES.START
    ) {
      return false
    }
    return true
  }

  const getAnchorEl = () => {
    return props.taskmap.showTaskPreview
      ? document.getElementById(`taskDatePicker-${dateType}-${selectedTask.id}`)
      : !props.forceFetch
        ? document.getElementById(
            `taskCellDatePicker-${dateType}-${selectedTask.id}`
          )
        : document.getElementById(`task-chip-due-date-${selectedTask.id}`)
  }
  const handleOnCloseCleanUp = () => {
    if (props.isInTaskDetails) {
      props.onCloseCleanUp()
    }
  }

  return (
    <div>
      <DatePicker
        dateType={dateType}
        fullType={fullType}
        selectedTask={selectedTask}
        isCompletedMilestone={isCompletedMilestone}
        minDate={minDate}
        maxDate={
          selectedTask.status === TASK_STATUS.DONE
            ? new Date()
            : selectedTask.status !== TASK_STATUS.IN_PROGRESS
              ? maxDate
              : new Date('2100-01-01')
        }
        data-test="task-date-picker"
        value={selectedDate}
        hideInput={true}
        onChange={e => updateDate(e)}
        disableFuture={props.disableFuture}
        clearable={canBeCleared()}
        getAnchorEl={getAnchorEl}
        isOpen={isOpen}
        onClose={() => {
          dispatch(closeDatePicker())
          props.actions.hideTaskDatePicker()
          handleOnCloseCleanUp()
        }}
        onSwap={() => {
          swapDialogType()
        }}
        inTaskDetails={props.isInTaskDetails}
      />
    </div>
  )
}

function mapStateToProps(state) {
  return {
    project: state.project,
    taskmap: state.taskmap,
    ipTaskmap: state.improvedTaskmap,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      fetchProjectWithPostsAndTaskTeam: bindActionCreators(
        fetchProjectWithPostsAndTaskTeam,
        dispatch
      ),
      updateTaskDetails: bindActionCreators(updateTaskDetails, dispatch),
      hideTaskDatePicker: bindActionCreators(
        hideTaskmapDatePickerForTask,
        dispatch
      ),
      displaySnackBar: bindActionCreators(displaySnackbar, dispatch),
    },
  }
}

export default withTranslation()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(DateChangePopover, styles))
)
