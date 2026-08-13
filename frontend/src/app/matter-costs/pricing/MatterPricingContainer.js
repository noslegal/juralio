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

import React, { useState, useEffect } from 'react'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'

import { TASK_STATUS } from '../../constants'
import MatterPricingView from './MatterPricingView'
import MatterPricingFirstFlow from './MatterPricingFirstFlow'
import AddIcon from '@mui/icons-material/AddCircleOutlined'

import Masonry from '@mui/lab/Masonry'
import { Button, Typography, Divider, Paper, Tooltip } from '@mui/material'
import DeleteIcon from '@mui/icons-material/DeleteForeverOutlined'
import matterCostsService from '../../../services/costs/matter-costs-service'
import PricingTypeForm from './PricingTypeForm'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'
import JurCoins from '../../../assets/images/JurCoins'
import { HelpIcon } from '../../../theme/navigation/CommonIcons'
import BigDataSpinner from '../../../components/feedback/big-data-spinner/BigDataSpinner'
import { useDispatch, useSelector } from 'react-redux'
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined'
import {
  getProjectionTotalCost,
  getRevenueTableData,
  filterValidTasks,
} from '../outcomes/revenueHelper'
import { fetchProjects } from '../../matter-details/projects/projects-actions'
import NewTaskChip from '../../../components/data-display/task-chip/NewTaskChip'
import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
import { setMatterProjections } from '../../../redux/ducks/matter-costs'

const useStyles = makeStyles()(theme => ({
  root: {
    margin: theme.spacing(2),
    padding: theme.spacing(2.5),
    width: '85%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  topDiv: {
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
    backgroundColor: 'pink',
    border: '1px solid',
    padding: theme.spacing(2),
    borderBottom: '4px solid',
    borderLeft: '4px solid',
    borderRight: '4px solid',
    borderRadius: '0px 0px 8px 8px',
    borderTop: '0px',
  },
  discardButton: {
    maxWidth: theme.spacing(5.25),
    maxHeight: theme.spacing(5.25),
    minWidth: theme.spacing(5.25),
    textTransform: 'none',
    color: juralioColours.darkText.secondary,
    borderColor: juralioColours.darkText.secondary,
    marginLeft: theme.spacing(1),
  },
  cancelButton: {
    textTransform: 'none',
    color: juralioColours.darkText.secondary,
    borderColor: juralioColours.darkText.secondary,
    marginLeft: 'auto',
    marginTop: theme.spacing(1.5),
    marginRight: theme.spacing(1),
  },
  saveButton: {
    marginTop: theme.spacing(1.5),
    marginLeft: 0,
    marginRight: theme.spacing(2),
    display: 'block',
    textTransform: 'none',
    color: juralioColours.darkText.primary,
    borderColor: juralioColours.darkText.secondary,
    backgroundColor: rawColours.primary.grey.main,
    '&:hover': {
      backgroundColor: rawColours.primary.grey[100],
    },
  },
  darkButton: {
    marginTop: theme.spacing(1.5),
    marginLeft: 'auto',
    marginRight: theme.spacing(2),
    display: 'block',
    textTransform: 'none',
    color: juralioColours.darkText.primary,
    borderColor: juralioColours.darkText.secondary,
    backgroundColor: rawColours.primary.grey.main,
    '&:hover': {
      backgroundColor: rawColours.primary.grey[100],
    },
  },
  confirmBox: {
    marginTop: theme.spacing(2),
    backgroundColor: 'rgba(16, 24, 40, 0.1)',
    borderRadius: theme.spacing(),
    padding: theme.spacing(1.25),
    display: 'flex',
  },
  confirmButton: {
    textTransform: 'none',
    marginRight: theme.spacing(1),
    color: rawColours.primary.grey.main,
    backgroundColor: rawColours.primary.black[200],
    '&:hover': {
      backgroundColor: rawColours.primary.black.black,
    },
  },
  coinIcon: {
    scale: '2',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    marginRight: theme.spacing(2.5),
  },
}))

const MatterPricingContainer = props => {
  const projects = useSelector(state => state.projects.items)
  const dispatch = useDispatch()
  const dashboardProjections = useSelector(
    state => state.matterCosts.projections
  )
  const { matterId, currency, fullPeriod, liveMode, matterTasks } = props
  const { classes } = useStyles()
  const { t } = useTranslation()
  const [showNewSegment, setShowNewSegment] = useState(false)
  const [showSpinner, setShowSpinner] = useState(true)
  const validTaskCount = filterValidTasks(
    projects.map(x => x.tasks).flat(),
    fullPeriod.startDate,
    fullPeriod.endDate
  ).length

  const payloadZeroState = [
    {
      matterId: matterId,
      value: 0,
      type: '0',
      reason: '',
      period: fullPeriod.id,
      taskList: [],
      cap: '0',
      fee: null,
      fullReason: '',
      type2control: '0',
    },
  ]

  const [newPricingDetails, setNewPricingDetails] = useState(
    cloneDeep(payloadZeroState)
  )
  const [payload, setPayload] = useState(cloneDeep(payloadZeroState))
  const [tasks, setTasks] = useState([])
  const data = props.data.pricingDTOList

  useEffect(() => {
    dispatch(fetchProjects(props.matterId, false, false, true))
    setTasks(
      filterValidTasks(
        matterTasks.filter(task => task.status !== TASK_STATUS.NOT_REQUIRED),
        fullPeriod.startDate,
        fullPeriod.endDate
      )
    )
    setShowSpinner(false)
    //eslint-disable-next-line
  }, [matterTasks])

  const isContinueDisabled = () => {
    //ensure all pricing types have tasks
    let x = payload.map(p => p.taskList.length)
    if (x.includes(0) && payload.length > 1) {
      return true
    }
    //ensure all pricicng types have been through flow
    //Type 0 cap 1 value > 0
    //Type 1 value > 0
    //Type 2 has reason
    const isValid = []
    payload.forEach(p => {
      if (parseInt(p.type) === 0 && parseInt(p.cap) > 0 && p.value === 0) {
        isValid.push(true)
      }
      if (parseInt(p.type) === 1 && p.value === 0) {
        isValid.push(true)
      }
      if (parseInt(p.type) === 2 && p.fullReason === '') {
        isValid.push(true)
      }
    })
    if (isValid.includes(true)) {
      return true
    }
    return false
  }

  useEffect(() => {
    const unloadCallback = event => {
      if (!isEqual(payload, payloadZeroState)) {
        event.preventDefault()
        event.returnValue = ''
        return ''
      }
    }
    const isValidLeave = event => {
      if (!isEqual(payload, payloadZeroState)) {
        if (window.confirm(t('common.leavePage'))) {
          return true
        } else {
          return event.preventDefault()
        }
      }
    }
    window.addEventListener('beforeunload', unloadCallback)
    window.addEventListener('leavePage', isValidLeave)
    return () => {
      window.removeEventListener('beforeunload', unloadCallback)
      window.removeEventListener('leavePage', isValidLeave)
    }
    //eslint-disable-next-line
  }, [])

  const isValidSnapshot = () => {
    if (props.data) {
      if (props.data.pricingDTOList.length === 0) {
        return true
      }
      for (let x = 0; x < props.data.costTimeEstimateList.length; x++) {
        if (props.data.costTimeEstimateList[x].pricingId === 0) {
          return true
        }
      }
      for (let x = 0; x < props.data.pricingDTOList.length; x++) {
        if (props.data.pricingDTOList[x].taskList.length === 0) {
          return true
        }
      }
      if (props.data.costTimeEstimateList.length !== validTaskCount) {
        return true
      }
    }
    return false
  }

  const getDisabledButtonText = () => {
    if (props.data) {
      if (props.data.pricingDTOList.length === 0) {
        return t('matterCosts.pricingErrorPricing')
      }
      for (let x = 0; x < props.data.costTimeEstimateList.length; x++) {
        if (props.data.costTimeEstimateList[x].pricingId === 0) {
          return t('matterCosts.pricingErrorTasks')
        }
      }
      for (let x = 0; x < props.data.pricingDTOList.length; x++) {
        if (props.data.pricingDTOList[x].taskList.length === 0) {
          return t('matterCosts.pricingErrorAssigned')
        }
      }
      if (props.data.costTimeEstimateList.length !== validTaskCount) {
        return t('matterCosts.pricingErrorPhases')
      }
    }
    return ''
  }

  //this is some weird jank to get rid of a web error that only occurs on local host
  //searched online most people said it can be freely ignored thats what this does
  useEffect(() => {
    window.addEventListener('error', e => {
      if (
        e.message ===
        'ResizeObserver loop completed with undelivered notifications.'
      ) {
        const resizeObserverErrDiv = document.getElementById(
          'webpack-dev-server-client-overlay-div'
        )
        const resizeObserverErr = document.getElementById(
          'webpack-dev-server-client-overlay'
        )
        if (resizeObserverErr) {
          resizeObserverErr.setAttribute('style', 'display: none')
        }
        if (resizeObserverErrDiv) {
          resizeObserverErrDiv.setAttribute('style', 'display: none')
        }
      }
    })
  }, [])

  if (showSpinner) {
    return <BigDataSpinner size={80} />
  } else {
    if (data && data.length > 0) {
      return (
        <>
          {!props.isSnapshot && (
            <div
              style={
                liveMode
                  ? {
                      borderColor: 'rgb(223, 168, 55)',
                      backgroundColor: '#FCF8E8',
                    }
                  : props.isSnapshot
                    ? {
                        borderColor: 'rgb(99, 166, 169)',
                        backgroundColor: '#DDE5F2',
                      }
                    : {
                        borderColor: juralioColours.taskStatus.notStarted,
                        backgroundColor: '#FCF8E8',
                      }
              }
              className={classes.topDiv}
            >
              <Typography>{t('matterCosts.topDiv1')}</Typography>
              <Typography>{t('matterCosts.topDiv2')}</Typography>
            </div>
          )}
          <Masonry sequential columns={2} spacing={1}>
            {tasks.filter(task => {
              if (
                !data
                  .map(pp => pp.taskList)
                  .flatMap(x => x)
                  .map(x => x.id)
                  .includes(task.id)
              ) {
                return task
              }
            }).length > 0 &&
              liveMode && (
                <div>
                  <Paper
                    style={{ boxShadow: ' 0px 0px 5px 5px  #5B15DF' }}
                    className={classes.root}
                  >
                    <div style={{ marginTop: '8px' }}>
                      <Typography variant="subtitle2">
                        {t('matterCosts.unassigned')}
                      </Typography>
                      <Typography variant="caption">
                        {t('matterCosts.unassignedCaption')}
                      </Typography>
                      <Tooltip
                        style={{ marginLeft: '4px' }}
                        title={t('matterCosts.unassignedTooltip')}
                      >
                        <HelpIcon />
                      </Tooltip>
                    </div>

                    <div
                      style={{
                        marginTop: '12px',
                        borderRadius: '8px',
                      }}
                    >
                      <Divider />
                      <div style={{ marginTop: '12px' }}>
                        {tasks
                          .filter(task => {
                            if (
                              !data
                                .map(pp => pp.taskList)
                                .flatMap(x => x)
                                .map(x => x.id)
                                .includes(task.id)
                            ) {
                              return task
                            }
                          })
                          .map((task, i) => {
                            return (
                              <div
                                key={i}
                                style={{
                                  marginTop: '6px',
                                  width: '92%',
                                  marginLeft: '8px',
                                  marginBottom: '6px',
                                }}
                              >
                                <NewTaskChip
                                  task={task}
                                  noHover={true}
                                  showLevelLetter={false}
                                  displayDates={false}
                                  compact={true}
                                />
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  </Paper>
                </div>
              )}

            {data.map((pt, index) => {
              return (
                <MatterPricingView
                  pricingType={pt}
                  index={index + 1}
                  tasks={tasks}
                  assignedTasks={data.map(pp => pp.taskList).flatMap(x => x)}
                  periodId={props.fullPeriod.id}
                  updateData={props.updateData}
                  matterId={matterId}
                  currency={currency}
                  numOfPricingTypes={data.length}
                  isSnapshot={props.isSnapshot}
                  diffArray={props.diffArray}
                  durationStart={props.fullPeriod.startDate}
                  durationEnd={props.fullPeriod.endDate}
                  setPageInfo={props.setPageInfo}
                />
              )
            })}
          </Masonry>

          {!showNewSegment && (
            <div
              style={{
                marginLeft: 'auto',
                width: 'fit-content',
                marginRight: 'auto',
              }}
            >
              {!props.isSnapshot && (
                <div style={{ marginBottom: '16px' }}>
                  <Button
                    data-test="new-pricing-segment"
                    className={classes.darkButton}
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setShowNewSegment(true)
                    }}
                    variant="outlined"
                    style={{
                      marginLeft: 'auto',
                      width: '100%',
                      marginRight: 'auto',
                      textTransform: 'none',
                      display: 'flex',
                    }}
                  >
                    <Typography>
                      {t('matterCosts.newPricingSegment')}
                    </Typography>
                  </Button>
                </div>
              )}
            </div>
          )}

          {showNewSegment && (
            <>
              <Paper data-test="new-pricing-segment" className={classes.root}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex' }}>
                    <div className={classes.pricingIcon}>
                      <JurCoins className={classes.coinIcon} />
                    </div>
                    <div>
                      <Typography variant="h6">
                        {t('matterCosts.pricingSegment') + (data.length + 1)}
                      </Typography>
                      <Typography variant="subtitle1">
                        {t('matterCosts.newSegmentSubtitle')}
                      </Typography>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <Button
                        data-test="delete-new-segment"
                        className={classes.discardButton}
                        variant="outlined"
                        onClick={() => {
                          setShowNewSegment(false)
                        }}
                      >
                        {<DeleteIcon />}
                      </Button>
                    </div>
                  </div>
                </div>
                <Divider />
                <div style={{ marginBottom: '20px' }}>
                  <>
                    <PricingTypeForm
                      index={0}
                      payload={newPricingDetails}
                      setPayload={setNewPricingDetails}
                      currency={currency}
                    />
                    <div style={{ marginLeft: 'auto', display: 'flex' }}>
                      <Button
                        data-test="cancel-new-segment"
                        className={classes.cancelButton}
                        variant="outlined"
                        onClick={() => {
                          setShowNewSegment(false)
                        }}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                        data-test="save-pricing"
                        className={classes.saveButton}
                        variant="outlined"
                        disabled={
                          newPricingDetails[0].type === '2' &&
                          newPricingDetails[0].reason === '3' &&
                          newPricingDetails[0].fullReason === ''
                        }
                        onClick={() => {
                          matterCostsService
                            .savePricing(matterId, newPricingDetails)
                            .then(() => {
                              matterCostsService
                                .getCostStageData(matterId)
                                .then(res => {
                                  if (res.status === 200) {
                                    props.setPageInfo(res.body)
                                    setShowNewSegment(false)
                                  }
                                })
                            })
                        }}
                      >
                        {t('matterCosts.savePricing')}
                      </Button>
                    </div>
                  </>
                </div>
              </Paper>
            </>
          )}
          {props.liveMode && (
            <div className={classes.confirmBox}>
              <Tooltip title={getDisabledButtonText()}>
                <div style={{ width: 'fit-content' }}>
                  <Button
                    className={classes.confirmButton}
                    disabled={isValidSnapshot()}
                    onClick={() => {
                      matterCostsService
                        .saveCostSnapshot(matterId, {
                          projectionPeriod: fullPeriod.id,
                          cteRevenueList: Array.from(
                            getRevenueTableData(
                              props.data,
                              props.rates,
                              props.rtd,
                              props.isSnapshot,
                              false
                            )
                          ),
                          totalCost: parseInt(
                            getProjectionTotalCost(props.data, props.rates)
                          ),
                          matterId: matterId,
                        })
                        .then(res => {
                          if (res.status === 200) {
                            matterCostsService
                              .getCostStageData(matterId)
                              .then(res => {
                                if (res.status === 200) {
                                  dashboardProjections.find(
                                    p => p.id === fullPeriod.id
                                  ).live = false
                                  dispatch(
                                    setMatterProjections(dashboardProjections)
                                  )
                                  props.setLiveMode(false)
                                  props.setPageInfo(res.body)
                                  props.setIsExpanded(false)
                                  props.setCollapseData(false)
                                  props.setIsCardOpen(false)
                                  window.location.href =
                                    window.location.href.split('/projection')[0]
                                }
                              })
                          }
                        })
                    }}
                  >
                    {t('Finalise this projection')}
                    <ArrowCircleRightOutlinedIcon
                      className={classes.buttonIcon}
                    />
                  </Button>
                </div>
              </Tooltip>
            </div>
          )}
        </>
      )
    } else {
      return (
        <>
          <div
            data-test="pricing-top-div"
            style={
              props.isSnapshot
                ? {
                    borderColor: 'rgb(99, 166, 169)',
                    backgroundColor: '#DDE5F2',
                  }
                : {
                    borderColor: 'rgb(223, 168, 55)',
                    backgroundColor: '#FCF8E8',
                  }
            }
            className={classes.topDiv}
          >
            <Typography>{t('matterCosts.pricingExplainer1')}</Typography>
            <Typography>{t('matterCosts.pricingExplainer2')}</Typography>
          </div>
          <MatterPricingFirstFlow
            payload={payload}
            setPayload={setPayload}
            matterId={matterId}
            fullPeriod={fullPeriod}
            isContinueDisabled={isContinueDisabled}
            tasks={tasks}
            currency={currency}
            updateData={props.updateData}
            setSelectedArea={props.setSelectedArea}
          />
        </>
      )
    }
  }
}
export default MatterPricingContainer
