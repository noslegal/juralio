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
import { makeStyles } from 'tss-react/mui'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FilterListIcon from '@mui/icons-material/FilterList'
import rawColours from '../../../theme/raw-colours'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  ClickAwayListener,
  Grow,
  Tooltip,
  Typography,
} from '@mui/material'
import juralioColours from '../../../theme/juralio-colours'
import TaskStatusFilterContainer from '../../task-map/task-filter/TaskStatusFilterContainer'
import TaskTypeFilterContainer from '../../task-map/task-filter/TaskTypeFilterContainer'
import TaskFilterContainer from '../../task-map/task-filter/TaskFilterContainer'
import LabelFilterContainer from '../../task-map/task-filter/LabelFilterContainer'
import TaskFilterReset from '../../task-map/task-filter/TaskFilterReset'
import { flatTaskListFromTree } from '../../../services/task/data-provider/task-list-data-provider'
import { statusFilterSteps } from '../../../services/tour/steps/status-filter-steps'
import {
  clearTour,
  setAvailableTours,
  setTour,
} from '../../../services/tour/tour-actions'
import tourService from '../../../services/tour/tour-service'
import { TASK_MAP_VIEW_MODE_ENUM } from '../../constants'
import MinimisedFilters from './MinimisedFilters'
import CloseIcon from '@mui/icons-material/Close'

const styles = makeStyles()(theme => ({
  filterContainer: {
    position: 'absolute',
    right: theme.spacing(1.25),
    width: '240px', //'192px',
    zIndex: 1000,
    top: '40px',
  },
  filterContainerHeader: {
    backgroundColor: rawColours.primary.black[200],
    color: juralioColours.whiteText.primary,
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5),
  },
  closeIcon: {
    cursor: 'pointer',
  },
}))

const RoadmapFilters = props => {
  const dispatch = useDispatch()
  const { matterId, workstreamId, showMinimisedMinimap } = props
  const { t } = useTranslation()
  const { isRoadmap } = props
  const { classes } = styles()
  const isExternal = useSelector(state => state.auth.data.details?.isExternal)
  const [showMinimised, setShowMinimised] = useState(true)
  const project = useSelector(state => state.project)
  const [labels, setLabels] = useState([])
  const noLabels = labels.length === 0
  const statusDone = useSelector(state => state.taskMapFilter.statusDone)
  const statusNotStarted = useSelector(
    state => state.taskMapFilter.statusNotStarted
  )
  const statusNotRequired = useSelector(
    state => state.taskMapFilter.statusNotRequired
  )
  const selectionText = useSelector(
    state => state.taskMapFilter.filterSelectionText
  )
  const taskTypeSelectionText = useSelector(
    state => state.taskMapFilter.taskTypeSelectionText
  )

  const taskCounts = useSelector(state => state.project.taskCounts)
  const tours = useSelector(state => state.tour.tours)
  const currentTour = useSelector(state => state.tour.currentTour)
  const detailedView = useSelector(state => state.taskMapFilter.detailedView)
  const selectionLabels = useSelector(state => state.taskMapFilter.filterLabels)
  const statusMilestone = useSelector(
    state => state.taskMapFilter.statusMilestone
  )

  const filtersEnabled =
    statusDone ||
    !statusNotStarted ||
    statusNotRequired ||
    selectionLabels.length > 0 ||
    detailedView.viewMode === TASK_MAP_VIEW_MODE_ENUM.DETAILED ||
    !detailedView.showRisk ||
    statusMilestone ||
    selectionText !== t('filter.anyoneTasks')

  const closeTourForever = () => {
    tourService.completeTour('statusFilter').then(() => {
      dispatch(clearTour())
      tourService.getTours().then(res => {
        if (res.status === 200) {
          dispatch(setAvailableTours(res.body))
        }
      })
    })
  }
  useEffect(() => {
    return () => dispatch(clearTour())
  }, []) //eslint-disable-line
  useEffect(() => {
    const sessionTours = JSON.parse(
      window.sessionStorage.getItem('juralio_tours')
    )
    const hiddenForSession = sessionTours && sessionTours['statusFilter']

    if (
      !tours.statusFilter &&
      taskCounts?.doneCount > 0 &&
      !statusDone &&
      !hiddenForSession &&
      !props.isMobile
    ) {
      dispatch(setTour('statusFilter', statusFilterSteps(t, closeTourForever)))
    } else if (currentTour === 'statusFilter') {
      dispatch(clearTour())
    }
  }, [taskCounts, statusDone]) //eslint-disable-line

  useEffect(() => {
    const tasks = flatTaskListFromTree(project)
    const l = [...new Set(tasks.map(task => task.labels).flat())]
      .filter(l => l !== undefined)
      .filter((v, i, a) => a.findIndex(t => t.labelId === v.labelId) === i)
    setLabels(l)
  }, [project])

  return (
    <>
      <MinimisedFilters
        setShowMinimised={setShowMinimised}
        showMinimised={showMinimised}
      />

      {!showMinimised && (
        <ClickAwayListener onClickAway={() => setShowMinimised(true)}>
          <Grow in={!showMinimised}>
            <div
              style={
                showMinimisedMinimap
                  ? { height: 'calc(100% - 100px)' }
                  : { height: 'calc(100% - 330px)' }
              }
              className={classes.filterContainer}
            >
              <div className={classes.filterContainerHeader}>
                <FilterListIcon />
                <Typography variant="caption">{t('common.filters')}</Typography>
                <TaskFilterReset setShowMinimised={setShowMinimised} />
                <CloseIcon
                  style={filtersEnabled ? {} : { marginLeft: 'auto' }}
                  className={classes.closeIcon}
                  onClick={() => setShowMinimised(true)}
                />
              </div>
              <div
                style={
                  showMinimisedMinimap
                    ? { overflow: 'scroll', height: 'calc(100% - 32px)' }
                    : { overflow: 'scroll', height: 'calc(100% - 32px)' }
                }
              >
                <Accordion defaultExpanded={true} disableGutters={true}>
                  <AccordionSummary
                    data-test={'status-filter-selected-text'}
                    style={{
                      padding: '0px 16px 0px 4px',
                      backgroundColor: rawColours.primary.grey[200],
                    }}
                    expandIcon={<ExpandMoreIcon />}
                  >
                    <Typography>
                      {'Status: '}
                      {!statusDone &&
                        statusNotStarted &&
                        !statusNotRequired &&
                        t('filter.incomplete')}
                      {!statusDone &&
                        statusNotStarted &&
                        statusNotRequired &&
                        t('filter.notStartedInprogressNotrequired')}
                      {!statusDone &&
                        !statusNotStarted &&
                        t('filter.in-progress')}
                      {statusDone && !statusNotStarted && t('filter.selected')}
                      {statusDone &&
                        statusNotStarted &&
                        !statusNotRequired &&
                        t('filter.allRequired')}
                      {statusDone &&
                        statusNotStarted &&
                        statusNotRequired &&
                        t('filter.all')}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails
                    style={{
                      overflowY: 'scroll',
                      overflowX: 'hidden',
                      padding: '4px 8px 4px',
                    }}
                  >
                    <TaskStatusFilterContainer
                      shouldShowNotRequired={!isExternal}
                    />
                  </AccordionDetails>
                </Accordion>

                <Accordion defaultExpanded={true} disableGutters={true}>
                  <AccordionSummary
                    data-test={'task-type-filter-selected-text'}
                    style={{
                      padding: '0px 16px 0px 4px',
                      backgroundColor: rawColours.primary.grey[200],
                    }}
                    expandIcon={<ExpandMoreIcon />}
                  >
                    <Typography> {taskTypeSelectionText}</Typography>
                  </AccordionSummary>
                  <AccordionDetails
                    style={{
                      overflowY: 'scroll',
                      overflowX: 'hidden',
                      padding: '4px 8px 4px',
                    }}
                  >
                    <TaskTypeFilterContainer />
                  </AccordionDetails>
                </Accordion>

                <Accordion defaultExpanded={true} disableGutters={true}>
                  <AccordionSummary
                    data-test={'person-filter-selected-text'}
                    style={{
                      padding: '0px 16px 0px 4px',
                      backgroundColor: rawColours.primary.grey[200],
                    }}
                    expandIcon={<ExpandMoreIcon />}
                  >
                    <Typography> {selectionText}</Typography>
                  </AccordionSummary>
                  <AccordionDetails
                    style={{
                      overflowY: 'scroll',
                      overflowX: 'hidden',
                      padding: '4px 8px 4px',
                    }}
                  >
                    <TaskFilterContainer
                      matterId={matterId}
                      projectId={workstreamId}
                    />
                  </AccordionDetails>
                </Accordion>
                <Accordion disableGutters={true}>
                  <Tooltip
                    title={
                      noLabels ? 'There are no labels in this matter yet' : ''
                    }
                  >
                    <div>
                      <AccordionSummary
                        disabled={noLabels}
                        style={{
                          padding: '0px 16px 0px 4px',
                          backgroundColor: rawColours.primary.grey[200],
                        }}
                        expandIcon={<ExpandMoreIcon />}
                      >
                        <Typography>{t('entity.labels')}</Typography>
                      </AccordionSummary>
                    </div>
                  </Tooltip>

                  <AccordionDetails
                    style={{
                      overflowY: 'scroll',
                      overflowX: 'hidden',
                      padding: '4px 8px 4px',
                    }}
                  >
                    <LabelFilterContainer />
                  </AccordionDetails>
                </Accordion>
              </div>
            </div>
          </Grow>
        </ClickAwayListener>
      )}
    </>
  )
}
export default RoadmapFilters
