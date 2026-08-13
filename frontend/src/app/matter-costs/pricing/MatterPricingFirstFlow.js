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

import { Button, Divider, Paper, Tooltip, Typography } from '@mui/material'
import React, { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import PricingTypeForm from './PricingTypeForm'
import PricingPhaseDialog from './PricingPhaseDialog'
import InfoIcon from '@mui/icons-material/Info'
import AddIcon from '@mui/icons-material/AddCircleOutlined'
import DeleteIcon from '@mui/icons-material/DeleteForeverOutlined'
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined'
import NewTaskChip from '../../../components/data-display/task-chip/NewTaskChip'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'
import { useTranslation } from 'react-i18next'
import matterCostsService from '../../../services/costs/matter-costs-service'
import LoadingButton from '@mui/lab/LoadingButton'

const useStyles = makeStyles()(theme => ({
  paperContainer: {
    margin: theme.spacing(2),
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '85%',
  },
  paperContent: {
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(2),
  },
  buttonIcon: {
    marginLeft: theme.spacing(1.5),
  },
  confirmBox: {
    marginTop: theme.spacing(2),
    backgroundColor: 'rgba(16, 24, 40, 0.1)',
    borderRadius: theme.spacing(),
    padding: theme.spacing(1.25),
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
  confirmButtonLoading: {
    paddingRight: theme.spacing(3.75),
    color: juralioColours.whiteText.primary,
  },
  icon: {
    marginLeft: theme.spacing(0.75),
  },
  discardButton: {
    textTransform: 'none',
    color: juralioColours.darkText.secondary,
    borderColor: juralioColours.darkText.secondary,
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  cancelButton: {
    textTransform: 'none',
    color: juralioColours.darkText.secondary,
    borderColor: juralioColours.darkText.secondary,
    marginLeft: theme.spacing(1),
  },
  specifyPhaseButton: {
    marginLeft: theme.spacing(1),
    textTransform: 'none',
    color: juralioColours.whiteText.primary,
    borderColor: juralioColours.darkText.secondary,
    backgroundColor: rawColours.primary.black[200],
    '&:hover': {
      backgroundColor: rawColours.primary.black.black,
    },
  },
  darkButton: {
    marginLeft: 'auto',
    marginRight: theme.spacing(2),
    display: 'flex',
    textTransform: 'none',
    color: juralioColours.darkText.primary,
    borderColor: juralioColours.darkText.secondary,
    backgroundColor: rawColours.primary.grey.main,
    '&:hover': {
      backgroundColor: rawColours.primary.grey[100],
    },
  },
  title: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(3),
    color: juralioColours.darkText.disabled,
  },
  segmentHeader: {
    marginBottom: theme.spacing(1.5),
    display: 'flex',
  },
  deleteButtonWrapper: {
    marginLeft: 'auto',
  },
  dividerTopSpacing: {
    marginTop: theme.spacing(2.5),
  },
  scopeSection: {
    marginBottom: theme.spacing(2.5),
  },
  scopeLabel: {
    display: 'inline-flex',
  },
  scopeLabelTitle: {
    marginTop: theme.spacing(1),
  },
  scopeInfoIcon: {
    marginLeft: theme.spacing(0.5),
    marginTop: theme.spacing(1),
  },
  scopeRow: {
    display: 'flex',
  },
  scopeText: {
    display: 'flex',
    alignItems: 'center',
  },
  scopeActions: {
    marginLeft: 'auto',
    display: 'flex',
  },
  taskListContainer: {
    marginTop: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
  },
  taskChipWrapper: {
    marginTop: theme.spacing(0.75),
    width: '95%',
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(0.75),
  },
  addSegmentWrapper: {
    marginLeft: 'auto',
    width: 'fit-content',
    marginRight: 'auto',
  },
  continueButtonContent: {
    display: 'flex',
  },
}))

const MatterPricingFirstFlow = props => {
  const {
    payload,
    setPayload,
    matterId,
    isContinueDisabled,
    fullPeriod,
    tasks,
    currency,
  } = props
  const { classes } = useStyles()
  const { t } = useTranslation()
  const [showTaskDialog, setShowTaskDialog] = useState(0)
  const [pricingTypes, setPricingTypes] = useState([1])
  const [buttonClicked, setButtonClicked] = useState(false)

  const handleSaveMatterPricing = () => {
    if (payload.length === 1) {
      payload[0].taskList = tasks
    }
    matterCostsService.savePricing(matterId, payload).then(res => {
      if (res.status === 200) {
        matterCostsService
          .getCostProjectionStageData(fullPeriod.id)
          .then(res => {
            if (res.status === 200) {
              setButtonClicked(false)
              props.updateData(res.body)
              props.setSelectedArea(2)
            }
          })
      }
    })
  }

  return (
    <>
      {showTaskDialog !== 0 && (
        <PricingPhaseDialog
          setShowTaskDialog={setShowTaskDialog}
          taskList={tasks}
          payload={payload}
          setPayload={setPayload}
          index={showTaskDialog - 1}
          hasTasks={payload[showTaskDialog - 1].taskList.length > 0}
        />
      )}
      <div>
        <div className={classes.paperContainer}>
          {pricingTypes.map((pt, index) => {
            return (
              <div key={index}>
                <Typography variant="subtitle1" className={classes.title}>
                  {pricingTypes.length > 1
                    ? t('matterCosts.pricingSegment') + (index + 1)
                    : t('matterCosts.pricing')}
                </Typography>
                <Paper className={classes.paperContent}>
                  <div className={classes.segmentHeader}>
                    <div>
                      <div>
                        <Typography variant="subtitle1">
                          {pricingTypes.length > 1
                            ? t('matterCosts.newSegmentSubtitle')
                            : ''}
                        </Typography>
                      </div>
                    </div>
                    <div
                      className={classes.deleteButtonWrapper}
                      hidden={index === 0}
                    >
                      <Tooltip
                        title={
                          payload[index].taskList.length !== 0
                            ? t('matterCosts.pricingSegmentTooltip')
                            : ''
                        }
                      >
                        <div>
                          <Button
                            data-test="delete-new-segment"
                            className={classes.discardButton}
                            variant="outlined"
                            disabled={payload[index].taskList.length !== 0}
                            onClick={() => {
                              let currentPt = [...pricingTypes]
                              currentPt.pop()
                              setPricingTypes(currentPt)
                              let currentPayload = [...payload]
                              currentPayload.pop()
                              setPayload(currentPayload)
                            }}
                          >
                            <DeleteIcon />
                          </Button>
                        </div>
                      </Tooltip>
                    </div>
                  </div>

                  <>
                    <PricingTypeForm
                      index={index}
                      payload={payload}
                      setPayload={setPayload}
                      currency={currency}
                    />
                  </>
                  <Divider className={classes.dividerTopSpacing} />
                  <div className={classes.scopeSection}>
                    <div className={classes.scopeLabel}>
                      <Typography
                        className={classes.scopeLabelTitle}
                        variant="subtitle2"
                      >
                        {t('matterCosts.scope')}
                      </Typography>
                      <Tooltip title={t('matterCosts.outOfScopePhase')}>
                        <InfoIcon
                          fontSize="small"
                          className={classes.scopeInfoIcon}
                        />
                      </Tooltip>
                    </div>

                    <div className={classes.scopeRow}>
                      <Typography className={classes.scopeText} variant="body1">
                        {pricingTypes.length > 1 ? (
                          t('matterCosts.inScopePhase')
                        ) : (
                          <>
                            <Tooltip title={t('matterCosts.newPricingTooltip')}>
                              <span>{t('matterCosts.allPhaseInMatter')}</span>
                            </Tooltip>
                          </>
                        )}
                      </Typography>
                      <div
                        className={classes.scopeActions}
                        hidden={pricingTypes.length < 2}
                      >
                        <div hidden={index === 0}>
                          <Button
                            data-test="cancel-new-segment"
                            className={classes.cancelButton}
                            variant="outlined"
                            disabled={payload[index].taskList.length !== 0}
                            onClick={() => {
                              let currentPt = [...pricingTypes]
                              currentPt.pop()
                              setPricingTypes(currentPt)
                              let currentPayload = [...payload]
                              currentPayload.pop()
                              setPayload(currentPayload)
                            }}
                          >
                            {t('common.cancel')}
                          </Button>
                        </div>

                        {pricingTypes.length > 1 && (
                          <Button
                            data-test="assign-phases"
                            className={classes.specifyPhaseButton}
                            variant="outlined"
                            onClick={() => {
                              setShowTaskDialog(index + 1)
                              //open task list dialog
                            }}
                          >
                            {t('matterCosts.assignPhases')}
                          </Button>
                        )}
                      </div>
                    </div>
                    {payload[index].taskList.length > 0 && (
                      <div className={classes.taskListContainer}>
                        <Divider />
                        {payload[index].taskList.map(task => {
                          return (
                            <div className={classes.taskChipWrapper}>
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
                    )}
                  </div>
                </Paper>
              </div>
            )
          })}
        </div>
        <div className={classes.addSegmentWrapper}>
          <Tooltip
            title={
              payload[payload.length - 1]?.taskList?.length === 0 &&
              payload.length > 1
                ? t('matterCosts.pricingMustHaveScope')
                : ''
            }
          >
            <div>
              <Button
                data-test="new-pricing-segment"
                startIcon={<AddIcon />}
                disabled={
                  payload[payload.length - 1]?.taskList?.length === 0 &&
                  payload.length > 1
                }
                onClick={() => {
                  if (payload.length < 10) {
                    const currentPt = [...pricingTypes]
                    currentPt.push(1)
                    setPricingTypes(currentPt)
                    const currentPayload = [...payload]
                    currentPayload.push({
                      matterId: matterId,
                      value: 0,
                      type: '0',
                      reason: '',
                      period: fullPeriod.id,
                      taskList: [],
                      cap: '0',
                      fee: null,
                      fullReason: null,
                      type2control: '0',
                    })
                    setPayload(currentPayload)
                  }
                }}
                variant="outlined"
                className={classes.darkButton}
              >
                {t('matterCosts.newPricingSegment')}
              </Button>
            </div>
          </Tooltip>
        </div>
        <div className={classes.confirmBox}>
          <LoadingButton
            data-test="continue"
            loadingPosition="end"
            loading={buttonClicked}
            disabled={isContinueDisabled() || buttonClicked}
            className={`${classes.confirmButton}${
              buttonClicked ? ` ${classes.confirmButtonLoading}` : ''
            }`}
            onClick={() => {
              if (!buttonClicked) {
                setButtonClicked(true)
                handleSaveMatterPricing()
              }
            }}
          >
            <span>
              <div className={classes.continueButtonContent}>
                {t('common.continue')}
                {!buttonClicked && (
                  <ArrowCircleRightOutlinedIcon
                    className={classes.buttonIcon}
                  />
                )}
              </div>
            </span>
          </LoadingButton>
        </div>
      </div>
    </>
  )
}
export default MatterPricingFirstFlow
