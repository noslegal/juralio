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

import React, { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'
import { Typography, Paper, Divider, Button, Tooltip } from '@mui/material'
import NewTaskChip from '../../../components/data-display/task-chip/NewTaskChip'
import juralioColours from '../../../theme/juralio-colours'
import PricingPhaseDialogView from './PricingPhaseDialogView'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/DeleteForeverOutlined'
import AddIcon from '@mui/icons-material/AddCircleOutlined'
import InfoIcon from '@mui/icons-material/Info'
import matterCostsService from '../../../services/costs/matter-costs-service'
import PricingTypeForm from './PricingTypeForm'
import { getPricingIcon } from '../outcomes/pricingCardHelper'
import isEqual from 'lodash/isEqual'
import rawColours from '../../../theme/raw-colours'
import dayjs from 'dayjs'

const useStyles = makeStyles()(theme => ({
  root: {
    margin: theme.spacing(1),
    padding: theme.spacing(2.5),
    width: '85%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  specifyPhaseButton: {
    maxWidth: theme.spacing(5.25),
    maxHeight: theme.spacing(5.25),
    minWidth: theme.spacing(5.25),
    display: 'block',
    textTransform: 'none',
    color: juralioColours.darkText.secondary,
    borderColor: juralioColours.darkText.secondary,
  },
  pricingIcon: { marginRight: theme.spacing(2) },
  discardButton: {
    maxWidth: theme.spacing(5.25),
    maxHeight: theme.spacing(5.25),
    minWidth: theme.spacing(5.25),
    textTransform: 'none',
    color: juralioColours.darkText.secondary,
    borderColor: juralioColours.darkText.secondary,
    marginLeft: theme.spacing(1),
  },
  title: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(3),
    color: juralioColours.darkText.disabled,
  },
  darkButton: {
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
  chipContainer: {
    marginTop: theme.spacing(0.75),
    width: '92%',
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(0.75),
  },
}))

const MatterPricingView = props => {
  const { t } = useTranslation()
  const {
    pricingType,
    tasks,
    index,
    currency,
    matterId,
    periodId,
    isSnapshot,
    durationStart,
    durationEnd,
  } = props
  const [showTaskDialog, setShowTaskDialog] = useState(0)
  const [showEditPricing, setShowEditPricing] = useState(false)

  const reasonFromString = reason => {
    if (reason === t('matterCosts.internalWork')) {
      return t('matterCosts.internalWork')
    } else if (reason === 'Marketing or sales') {
      return 'Marketing or sales'
    } else if (reason === 'Charitable or pro bono') {
      return 'Charitable or pro bono'
    } else {
      return '3'
    }
  }

  const ogPricing = [
    {
      matterId: matterId,
      value: pricingType.value,
      type: pricingType.type.toString(),
      reason: pricingType.reason
        ? pricingType.reason
        : reasonFromString(pricingType.fullReason),
      period: periodId,
      taskList: pricingType.taskList,
      cap: pricingType.cap ? '1' : '0',
      fee: pricingType.value > 0 ? pricingType.value : 0,
      fullReason: pricingType.fullReason ? pricingType.fullReason : '',
      type2control: '0',
    },
  ]

  const [pricingTypeDetails, setPricingTypeDetails] = useState(ogPricing)

  const isDisabled = () => {
    const activePayload = pricingTypeDetails[0]
    if (activePayload.type === '1' && activePayload.value === 0) {
      return true
    }
    if (isEqual(ogPricing, pricingTypeDetails)) {
      return true
    }
    if (
      activePayload.type === '0' &&
      activePayload.cap === '1' &&
      activePayload.value === 0
    ) {
      return true
    }
    if (
      activePayload.type === '2' &&
      activePayload.reason === '3' &&
      activePayload.fullReason === ''
    ) {
      return true
    }
    if (activePayload.type === '2' && activePayload.reason === '0') {
      return true
    }
    return false
  }

  const { classes } = useStyles()
  const pricingSegment = () => {
    if (pricingType.type === 0) {
      if (pricingType.cap) {
        return (
          <div>
            <Typography variant="h6">
              {'Capped at ' +
                props.currency.substring(0, 3) +
                ' ' +
                pricingType.value
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </Typography>
            <Typography data-test="segment-name" variant="subtitle1">
              {t('matterCosts.timeBased')}
            </Typography>
          </div>
        )
      } else {
        return (
          <div>
            <Typography data-test="segment-name" variant="h6">
              {t('matterCosts.timeBased')}
            </Typography>
            <Typography variant="subtitle1">
              {pricingType.cap
                ? 'Capped at ' +
                  props.currency.substring(0, 3) +
                  ' ' +
                  pricingType.value
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                : 'Uncapped'}
            </Typography>
          </div>
        )
      }
    } else if (pricingType.type === 1) {
      return (
        <div>
          <Typography data-test="segment-name" variant="h6">
            {'Fixed fee / ' +
              props.currency.substring(0, 3) +
              ' ' +
              pricingType.value
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          </Typography>
          <Typography variant="subtitle1"></Typography>
        </div>
      )
    } else if (pricingType.type === 2) {
      return (
        <div>
          <Typography data-test="segment-name" variant="h6">
            No fee pricing
          </Typography>
          <Typography variant="subtitle1">
            {'No fee / ' + pricingType.fullReason}
          </Typography>
        </div>
      )
    }
  }

  return (
    <>
      {showTaskDialog !== 0 && (
        <PricingPhaseDialogView
          setShowTaskDialog={setShowTaskDialog}
          taskList={tasks}
          pricingType={pricingType}
          index={showTaskDialog - 1}
          hasTasks={true}
          setupFlow={false}
          assignedTasks={props.assignedTasks}
          periodId={periodId}
          updateData={props.updateData}
          matterId={matterId}
          setPageInfo={props.setPageInfo}
        />
      )}
      <div key={index}>
        <Typography variant="subtitle1" className={classes.title}>
          {'Pricing segment ' + index}
        </Typography>
        <Paper data-test="pricing-segment" className={classes.root}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex' }}>
              <div className={classes.pricingIcon}>
                <div
                  style={{
                    marginLeft: '8px',
                    scale: '2',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                  }}
                >
                  {getPricingIcon(
                    pricingType.type,
                    pricingType.cap,
                    pricingType.fullReason,
                    t
                  )}
                </div>
              </div>
              <div>
                <Typography style={{ marginLeft: '8px' }} variant="h6">
                  {pricingSegment()}
                </Typography>
              </div>
              {!isSnapshot && (
                <>
                  <div style={{ marginLeft: 'auto', display: 'flex' }}>
                    {!showEditPricing && !isSnapshot && (
                      <Button
                        data-test="edit-segment"
                        className={classes.specifyPhaseButton}
                        variant="outlined"
                        onClick={() => {
                          setShowEditPricing(true)
                        }}
                      >
                        {
                          <EditIcon
                            style={{ marginTop: '2px', marginLeft: '-6px' }}
                          />
                        }
                      </Button>
                    )}
                    <Tooltip
                      title={
                        pricingType.taskList.length > 0
                          ? `You can't discard a segment which has phases assigned to it`
                          : ''
                      }
                    >
                      <Button
                        data-test="delete-segment"
                        disabled={pricingType.taskList.length > 0}
                        className={classes.discardButton}
                        variant="outlined"
                        onClick={() => {
                          matterCostsService
                            .deletePricing(pricingType.id, matterId)
                            .then(() => {
                              matterCostsService
                                .getCostStageData(matterId)
                                .then(res => {
                                  if (res.status === 200) {
                                    props.setPageInfo(res.body)
                                  }
                                })
                            })
                        }}
                      >
                        {<DeleteIcon />}
                      </Button>
                    </Tooltip>
                  </div>
                </>
              )}
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            {showEditPricing && (
              <>
                <PricingTypeForm
                  index={0}
                  payload={pricingTypeDetails}
                  setPayload={setPricingTypeDetails}
                  currency={currency}
                />

                <div
                  style={{
                    backgroundColor: rawColours.primary.grey.main,
                    width: '80%',
                    borderRadius: '0px 0px 8px 8px',
                    boxShadow: 'none',
                    marginLeft: 'auto',
                    display: 'flex',
                    paddingBottom: '8px',
                  }}
                >
                  <Button
                    className={classes.darkButton}
                    variant="outlined"
                    onClick={() => {
                      setShowEditPricing(false)
                      setPricingTypeDetails(ogPricing)
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    data-test="save-pricing"
                    style={{ marginLeft: '0px' }}
                    className={classes.darkButton}
                    variant="outlined"
                    disabled={isDisabled()}
                    onClick={() => {
                      matterCostsService
                        .updatePricing(
                          matterId,
                          pricingType.id,
                          pricingTypeDetails[0]
                        )
                        .then(() => {
                          matterCostsService
                            .getCostStageData(matterId)
                            .then(res => {
                              if (res.status === 200) {
                                props.setPageInfo(res.body)
                                setShowEditPricing(false)
                              }
                            })
                        })
                    }}
                  >
                    {t('matterCosts.savePricing')}
                  </Button>
                </div>
              </>
            )}
          </div>
          <Divider />
          <div style={{ display: 'flex', marginTop: '8px' }}>
            <div style={{ display: 'inline-flex' }}>
              <Typography variant="subtitle2">{t('Scope')}</Typography>
              <Tooltip
                style={{ marginLeft: '8px' }}
                title={t('matterCosts.outOfScopePhase')}
              >
                <InfoIcon fontSize="small" style={{ marginTop: '2px' }} />
              </Tooltip>
            </div>

            {!isSnapshot && props.numOfPricingTypes > 0 && (
              <Button
                data-test="assign-phases"
                style={{ display: 'flex' }}
                startIcon={<AddIcon />}
                className={classes.darkButton}
                variant="outlined"
                onClick={() => {
                  setShowTaskDialog(index)
                }}
              >
                <Typography>{t('matterCosts.assignPhases')}</Typography>
              </Button>
            )}
          </div>

          {pricingType.taskList.length > 0 && (
            <div
              style={{
                marginTop: '12px',
                borderRadius: '8px',
              }}
            >
              <Divider />
              <div style={{ marginTop: '12px' }}>
                {pricingType.taskList.map((task, i) => {
                  let diff = props.diffArray.find(item => {
                    return item.taskId === task.id
                  })
                  let durationDiff = null
                  let durationPercent = null
                  let durationShift = null
                  if (
                    diff &&
                    diff.task &&
                    (diff.task.startDate || diff.task.endDate)
                  ) {
                    let originalStartDate = diff.task.startDate
                      ? diff.task.startDate.__old
                        ? diff.task.startDate.__old
                        : durationStart
                      : durationStart
                    let originalEndDate = diff.task.endDate
                      ? diff.task.endDate.__old
                        ? diff.task.endDate.__old
                        : durationEnd
                      : durationEnd
                    originalStartDate =
                      originalStartDate < durationStart
                        ? durationStart
                        : originalStartDate
                    originalEndDate =
                      originalEndDate > durationEnd
                        ? durationEnd
                        : originalEndDate

                    let originalDuration =
                      dayjs(originalEndDate).diff(
                        dayjs(originalStartDate),
                        'd'
                      ) + 1
                    let newDuration = 0
                    if (diff.task.startDate && diff.task.endDate) {
                      let s =
                        diff.task.startDate.__new < durationStart
                          ? durationStart
                          : diff.task.startDate.__new
                      let e =
                        diff.task.endDate.__new > durationEnd
                          ? durationEnd
                          : diff.task.endDate.__new
                      newDuration = dayjs(e).diff(dayjs(s), 'd') + 1
                    } else if (diff.task.startDate) {
                      if (diff.task.startDate.__new < durationStart) {
                        newDuration =
                          dayjs(originalEndDate).diff(
                            dayjs(durationStart),
                            'd'
                          ) + 1
                      } else {
                        newDuration =
                          dayjs(originalEndDate).diff(
                            dayjs(diff.task.startDate.__new),
                            'd'
                          ) + 1
                      }
                    } else if (diff.task.endDate) {
                      if (diff.task.endDate.__new > durationEnd) {
                        newDuration =
                          dayjs(durationEnd).diff(
                            dayjs(originalStartDate),
                            'd'
                          ) + 1
                      } else {
                        newDuration =
                          dayjs(diff.task.endDate.__new).diff(
                            dayjs(originalStartDate),
                            'd'
                          ) + 1
                      }
                    }
                    durationDiff = newDuration - originalDuration
                    durationPercent = (durationDiff / originalDuration) * 100
                    if (durationDiff === 0) {
                      //there is a diff but duration hasnt changed so must be a shift
                      durationShift = dayjs(diff.task.startDate.__new).diff(
                        dayjs(originalStartDate),
                        'd'
                      )
                    }
                  }
                  return (
                    <Tooltip
                      disableFocusListener={!diff || (diff && !diff.removed)}
                      disableHoverListener={!diff || (diff && !diff.removed)}
                      title={
                        'In the live matter, this phase has been changed or moved within this projection period'
                      }
                      placement="bottom-start"
                    >
                      <span>
                        <div
                          key={i}
                          className={classes.chipContainer}
                          style={
                            diff && diff.removed
                              ? {
                                  boxShadow: ' 0px 0px 5px 3px  grey',
                                  backgroundColor: 'rgba(209, 206, 208, 0.80)',
                                }
                              : diff && diff.new
                                ? {
                                    boxShadow: ' 0px 0px 5px 3px  #5B15DF',
                                    backgroundColor: 'rgba(91, 21, 223, 0.20)',
                                  }
                                : {}
                          }
                        >
                          <NewTaskChip
                            task={task}
                            noHover={true}
                            showLevelLetter={false}
                            displayDates={false}
                            compact={true}
                            isSnapshot={isSnapshot}
                            diffDuration={durationDiff}
                            diffPercent={durationPercent}
                            durationShift={diff ? durationShift : null}
                          />
                        </div>
                      </span>
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          )}
        </Paper>
      </div>
    </>
  )
}
export default MatterPricingView
