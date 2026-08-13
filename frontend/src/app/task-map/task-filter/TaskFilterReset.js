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

import { Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { taskFilterActions } from './task-filter-actions'
import juralioColours from '../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  resetButton: {
    color: juralioColours.whiteText.primary,
    paddingRight: theme.spacing(1),
    marginLeft: 'auto',
    cursor: 'pointer',
  },
}))

const TaskFilterReset = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const userSearch = useSelector(state => state.taskMapFilter.filterUserRecency)
  const [filterNumber, setFilterNumber] = useState(0)
  const statusMilestone = useSelector(
    state => state.taskMapFilter.statusMilestone
  )
  const statusDeliverable = useSelector(
    state => state.taskMapFilter.statusDeliverable
  )
  const statusDone = useSelector(state => state.taskMapFilter.statusDone)
  const statusNotStarted = useSelector(
    state => state.taskMapFilter.statusNotStarted
  )
  const selectionText = useSelector(
    state => state.taskMapFilter.filterSelectionText
  )
  const selectionLabels = useSelector(state => state.taskMapFilter.filterLabels)
  const statusNotRequired = useSelector(
    state => state.taskMapFilter.statusNotRequired
  )
  const statusAll = useSelector(state => state.taskMapFilter.statusAll)
  const detailedView = useSelector(state => state.taskMapFilter.detailedView)

  const setEmailToEveryone = () => {
    dispatch(taskFilterActions.resetEmailToFilterFor())
  }

  const handleMilestone = () => {
    dispatch(taskFilterActions.setStatusMilestone(statusMilestone))
  }
  const handleDeliverable = () => {
    dispatch(taskFilterActions.setStatusDeliverable(statusDeliverable))
  }
  const handleDone = () => {
    dispatch(taskFilterActions.setStatusDone(statusDone))
  }
  const handleNotRequired = () => {
    dispatch(taskFilterActions.setStatusNotRequired(statusNotRequired))
  }
  const handleNotStarted = () => {
    dispatch(taskFilterActions.setStatusNotStarted(statusNotStarted))
  }
  const handleAll = () => {
    dispatch(taskFilterActions.setStatusAll(statusAll))
  }

  const handleLabels = () => {
    dispatch(taskFilterActions.setCurrentLabels([]))
  }

  const handleTaskTypeSelectionText = () => {
    dispatch(
      taskFilterActions.setTaskTypeSelectionText(t('filter.allTaskTypes'))
    )
  }

  const handleReset = () => {
    if (selectionText !== t('filter.anyoneTasks')) {
      setEmailToEveryone()
    }
    if (statusDone) {
      handleDone()
    }
    if (statusNotRequired) {
      handleNotRequired()
    }
    if (!statusNotStarted) {
      handleNotStarted()
    }
    if (statusMilestone) {
      handleMilestone()
      handleTaskTypeSelectionText()
    }
    if (statusDeliverable) {
      handleDeliverable()
      handleTaskTypeSelectionText()
    }
    if (statusAll) {
      handleAll()
    }
    if (selectionLabels.length > 0) {
      handleLabels()
    }
    if (userSearch) {
      dispatch(taskFilterActions.resetFilterUserRecency())
    }
  }

  const showReset =
    statusDone ||
    !statusNotStarted ||
    statusNotRequired ||
    selectionLabels.length > 0 ||
    !detailedView.showRisk ||
    statusMilestone ||
    statusDeliverable ||
    selectionText !== t('filter.anyoneTasks')

  useEffect(() => {
    let filterNum = 0
    if (statusDone || !statusNotStarted || statusNotRequired) {
      filterNum = filterNum + 1
    }
    if (selectionLabels.length > 0 || !detailedView.showRisk) {
      filterNum = filterNum + 1
    }
    if (statusMilestone || statusDeliverable) {
      filterNum = filterNum + 1
    }
    if (selectionText !== t('filter.anyoneTasks')) {
      filterNum = filterNum + 1
    }

    setFilterNumber(filterNum)
    //eslint-disable-next-line
  }, [
    showReset,
    detailedView.showRisk,
    selectionLabels.length,
    selectionText,
    statusDeliverable,
    statusDone,
    statusMilestone,
    statusNotRequired,
    statusNotStarted,
  ])

  return (
    <>
      {showReset && (
        <Typography
          data-test="reset-filters"
          className={classes.resetButton}
          onClick={e => {
            handleReset()

            setFilterNumber(0)
            e.stopPropagation()
          }}
          variant="caption"
        >
          {'Reset (' + filterNumber + ')'}
        </Typography>
      )}
    </>
  )
}

export default TaskFilterReset
