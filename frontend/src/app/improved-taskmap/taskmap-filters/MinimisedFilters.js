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

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import FilterListIcon from '@mui/icons-material/FilterList'
import rawColours from '../../../theme/raw-colours'
import juralioColours from '../../../theme/juralio-colours'
import { Typography } from '@mui/material'
import { taskFilterActions } from '../../task-map/task-filter/task-filter-actions'
import JurMilestone from '../../../assets/images/JurMilestone'
import JurDeliverable from '../../../assets/images/JurDeliverable'
import UserAvatar from '../../../components/data-display/user/user-avatar/UserAvatar'
import { useUserDetailsData } from '../../../hooks/user-hooks'
import JurLabels from '../../../assets/images/JurLabels'
import { isInRoadmapContext } from '../../../services/helpers/route/route-context-helper'

const useStyles = makeStyles()(theme => ({
  minimisedFilterContainer: {
    cursor: 'pointer',
    width: 'fit-content',
    minHeight: theme.spacing(4),
    textAlign: 'center',
    alignContent: 'center',
    position: 'absolute',
    right: theme.spacing(1.25),
    zIndex: 1000,
    borderRadius: theme.spacing(1),
    alignItems: 'center',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  filterHover: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px',
    marginTop: '4px',
    justifyContent: 'center',
  },
  donePip: {
    marginLeft: theme.spacing(0.25),
    marginRight: theme.spacing(1),
    color: juralioColours.darkText.secondary,
    backgroundColor: rawColours.status.done.dark,
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
    textAlign: 'center',
  },
  inProgressPip: {
    marginLeft: theme.spacing(0.25),
    marginRight: theme.spacing(0.25),
    color: juralioColours.darkText.secondary,
    backgroundColor: rawColours.status.inProgress.dark,
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
    textAlign: 'center',
  },
  notStartedPip: {
    marginLeft: theme.spacing(0.25),
    marginRight: theme.spacing(0.25),
    color: juralioColours.darkText.secondary,
    backgroundColor: rawColours.status.notStarted.dark,
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
    textAlign: 'center',
  },
  notRequiredPip: {
    backgroundColor: '#616161',
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
    textAlign: 'center',
  },
}))

const MinimisedFilters = props => {
  const { setShowMinimised, showMinimised } = props
  const { classes } = useStyles()
  const userDetailsData = useUserDetailsData()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [filterNumber, setFilterNumber] = useState(0)
  const [filterHover, setFilterHover] = useState(false)
  const taskCounts = useSelector(state => state.project.taskCounts)

  const userSearch = useSelector(state => state.taskMapFilter.filterUserRecency)
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
      <div
        onMouseEnter={() => {
          if (filterNumber > 0) {
            setFilterHover(true)
          }
        }}
        onMouseLeave={() => setFilterHover(false)}
        data-test={'minimised-filters'}
        onClick={() => setShowMinimised(!showMinimised)}
        className={classes.minimisedFilterContainer}
        style={
          props.project?.selectionMode
            ? {
                visibility: 'collapse',
              }
            : showReset
              ? {
                  top: isInRoadmapContext() ? '44px' : '104px',
                  border: '1px solid',
                  borderColor: rawColours.primary.black[200],
                  color: juralioColours.whiteText.primary,
                  backgroundColor: juralioColours.darkText.secondary,
                }
              : {
                  top: isInRoadmapContext() ? '44px' : '104px',
                  color: juralioColours.whiteText.primary,
                  backgroundColor: rawColours.primary.black[200],
                  '&:hover': {
                    backgroundColor: rawColours.primary.black[100],
                  },
                }
        }
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifySelf: 'center',
          }}
        >
          {showReset && (
            <Typography
              style={{
                color: juralioColours.whiteText.primary,
                paddingRight: '8px',
              }}
              onClick={e => {
                dispatch(taskFilterActions.resetAllFilter())
                setFilterHover(false)
                setFilterNumber(0)
                e.stopPropagation()
              }}
              variant="caption"
            >
              {'Reset (' + filterNumber + ')'}
            </Typography>
          )}

          <FilterListIcon />
          <Typography variant="caption">{t('common.filters')}</Typography>
        </div>
        {filterHover && (
          <div className={classes.filterHover}>
            {(statusDone || !statusNotStarted || statusNotRequired) && (
              <div style={{ display: 'flex' }}>
                {statusNotStarted && (
                  <div className={classes.notStartedPip}>
                    <Typography>{taskCounts.notStartedCount}</Typography>
                  </div>
                )}
                <div className={classes.inProgressPip}>
                  <Typography>{taskCounts.inProgressCount}</Typography>
                </div>
                {statusDone && (
                  <div className={classes.donePip}>
                    <Typography>{taskCounts.doneCount}</Typography>
                  </div>
                )}
                {statusNotRequired && (
                  <div className={classes.notRequiredPip}>
                    <Typography>{taskCounts.notRequiredCount}</Typography>
                  </div>
                )}
              </div>
            )}
            {statusDeliverable && <JurDeliverable />}
            {statusMilestone && <JurMilestone />}
            {selectionText !== t('filter.anyoneTasks') && (
              <div
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  scale: '0.75',
                }}
              >
                <UserAvatar
                  small
                  user={
                    selectionText === t('filter.yourTasks')
                      ? userDetailsData
                      : userSearch
                  }
                />
              </div>
            )}
            {(selectionLabels.length > 0 || !detailedView.showRisk) && (
              <JurLabels />
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default MinimisedFilters
