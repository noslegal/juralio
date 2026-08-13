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
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { Paper, Typography, Tabs, Tab, Tooltip } from '@mui/material'
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined'
import rawColours from '../../../theme/raw-colours'
import dayjs from 'dayjs'
import GradeRatioTable from './GradeRatioTable'
import PhaseDatesTable from './PhaseDatesTable'
import PhaseHoursTable from './PhaseHoursTable'
import matterCostsService from '../../../services/costs/matter-costs-service'
import ResourceTable from './ResourceTable'
import RevenueTable from './RevenueTable'
import { useDispatch, useSelector } from 'react-redux'
import { useUserPosition } from '../../../hooks/user-hooks'
import BigDataSpinner from '../../../components/feedback/big-data-spinner/BigDataSpinner'
import {
  getProjectionTotalCost,
  getRevenueTableData,
  filterValidTasks,
} from '../outcomes/revenueHelper'
import CostsTable from './CostsTable'
import GrossProfitTable from './GrossProfitTable'
import MarginTable from './MarginTable'
import LoadingButton from '@mui/lab/LoadingButton'
import juralioColours from '../../../theme/juralio-colours'
import { setMatterProjections } from '../../../redux/ducks/matter-costs'

const useStyles = makeStyles()(theme => ({
  paperContainer: {
    margin: theme.spacing(2),
  },
  paperContent: {
    padding: theme.spacing(1),
  },
  rateCardContainer: {
    marginTop: theme.spacing(2),
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
    marginRight: '8px',
    color: rawColours.primary.grey.main,
    backgroundColor: rawColours.primary.black[200],
    '&:hover': {
      backgroundColor: rawColours.primary.black.black,
    },
  },
  confirmButtonDisabled: {
    textTransform: 'none',
    marginRight: '8px',
    color: rawColours.primary.grey.main,
    backgroundColor: rawColours.primary.black[100],
  },
  buttonIcon: {
    marginLeft: theme.spacing(1.5),
  },
  subtitleText: {
    color: rawColours.primary.black.black,
    fontSize: 16,
    fontFamily: 'Montserrat',
    fontWeight: '400',
    letterSpacing: 0.15,
    wordWrap: 'break-word',
    marginBottom: '4px',
  },
  numberInput: {
    width: 'fit-content',
    display: 'contents',
  },
  unselectedRadio: {
    color: rawColours.primary.grey.main,
    opacity: 0.9,
  },
  periodSelect: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(3),
    marginLeft: theme.spacing(2),
    display: 'flex',
    alignItems: 'baseline',
  },
  subtitleWrapper: {
    width: '66%',
    margin: theme.spacing(1),
  },
  resourceTitle: {
    marginTop: theme.spacing(1),
  },
  phaseDatesWrapper: {
    zIndex: 999,
    position: 'relative',
  },
  tabsContainer: {
    marginBottom: theme.spacing(1),
  },
  tabPointerEvents: {
    pointerEvents: 'auto',
  },
  buttonWrapper: {
    width: 'fit-content',
  },
  loadingButtonActive: {
    paddingRight: '30px',
    color: juralioColours.whiteText.primary,
  },
  buttonContent: {
    display: 'flex',
  },
}))

const MatterResourceCosts = props => {
  const { stage, fullPeriod, data, matterId, matterTasks } = props
  const dashboardProjections = useSelector(
    state => state.matterCosts.projections
  )
  const matter = useSelector(state => state.matterDetails.matter)
  const userPosition = useUserPosition(matter)
  const isClientUser = userPosition.isClient && !userPosition.isInternalGroup
  const dispatch = useDispatch()
  const { classes } = useStyles()
  const [showSpinner, setShowSpinner] = useState(false)
  const [disabled, setDisabled] = useState()
  const startDate = fullPeriod?.startDate
    ? fullPeriod?.startDate
    : dayjs().startOf('month').toDate()

  const endDate = fullPeriod?.endDate
    ? fullPeriod?.endDate
    : dayjs().endOf('month').toDate()

  const [totalHours, setTotalHours] = useState()
  const [gradeHourPayload, setGradeHourPayload] = useState(
    data.costRatioList ? data.costRatioList : []
  )
  const [phaseHourPayload, setPhaseHourPayload] = useState(
    data.costTimeEstimateList ? data.costTimeEstimateList : []
  )
  const { t } = useTranslation()
  const [selectedTab, setSelectedTab] = useState(0)
  const projects = useSelector(state => state.projects.items)
  const validTaskCount = filterValidTasks(
    projects.map(x => x.tasks).flat(),
    fullPeriod.startDate,
    fullPeriod.endDate
  ).length
  const [revenueData, setRevenueData] = useState()
  const [buttonClicked, setButtonClicked] = useState(false)
  const [tableLoaded, setTableLoaded] = useState(false)
  const [assumptions, setAssumptions] = useState(data?.assumptionList || [])

  useEffect(() => {
    if (!props.isSnapshot) {
      matterCostsService.getAssumptions(matterId).then(res => {
        if (res.status === 200) {
          setAssumptions(res.body)
        }
      })
    }
  }, [matterId, props.isSnapshot])

  const getButtonDisabled = () => {
    switch (stage) {
      case 1:
        if (totalHours !== 100) {
          return true
        } else {
          return false
        }
      case 2:
        return false
      case 3:
        return phaseHourPayload.length === 0
      case 4:
        return true
      default:
        break
    }
  }

  const handleButtonClick = () => {
    switch (stage) {
      case 0:
        break
      case 1:
        setShowSpinner(true)
        matterCostsService
          .saveCostRatioData(matterId, gradeHourPayload)
          .then(res => {
            if (res.status === 200) {
              matterCostsService.getCostStageData(props.matterId).then(res => {
                if (res.status === 200) {
                  props.setPageInfo(res.body)
                  props.setStage(2)
                  setDisabled(true)
                  setShowSpinner(false)
                }
              })
            }
          })
        break
      case 2:
        props.setStage(3)
        break
      case 3:
        setShowSpinner(true)
        setDisabled(true)
        if (data.costTimeEstimateList.length > 0) {
          matterCostsService
            .bulkUpdateCostTimeEstimate(fullPeriod.id, phaseHourPayload)
            .then(res => {
              if (res.status === 200) {
                matterCostsService
                  .getCostStageData(props.matterId)
                  .then(res => {
                    if (res.status === 200) {
                      props.setPageInfo(res.body)
                      props.setStage(4)
                      setDisabled(true)
                      setShowSpinner(false)
                    } else {
                      setDisabled(false)
                    }
                  })
              }
            })
        } else {
          matterCostsService
            .saveCostTimeEstimateData(matterId, phaseHourPayload)
            .then(res => {
              if (res.status === 200) {
                matterCostsService.getCostStageData(matterId).then(res => {
                  if (res.status === 200) {
                    props.setPageInfo(res.body)
                    props.setStage(4)
                    setDisabled(true)
                    setShowSpinner(false)
                  } else {
                    setDisabled(false)
                  }
                })
              }
            })
        }
        break
      case 4:
        setButtonClicked(true)
        matterCostsService
          .saveCostSnapshot(matterId, {
            projectionPeriod: fullPeriod.id,
            cteRevenueList: Array.from(revenueData),
            totalCost: parseInt(
              getProjectionTotalCost(props.data, props.rates)
            ),
            matterId: matterId,
          })
          .then(res => {
            if (res.status === 200) {
              matterCostsService.getCostStageData(matterId).then(res => {
                if (res.status === 200) {
                  //live mode resnapshotting
                  if (
                    dashboardProjections.find(p => p.id === fullPeriod.id) !==
                    undefined
                  ) {
                    dashboardProjections.find(
                      p => p.id === fullPeriod.id
                    ).live = false
                    dispatch(setMatterProjections(dashboardProjections))
                  }
                  props.setLiveMode(false)
                  setButtonClicked(false)
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
        break
      default:
        break
    }
  }

  useEffect(() => {
    setDisabled(getButtonDisabled())
    //eslint-disable-next-line
  }, [
    stage,
    startDate,
    endDate,
    totalHours,
    gradeHourPayload,
    phaseHourPayload,
  ])
  useEffect(() => {
    if (props.rates || data.matterRatesList) {
      setRevenueData(
        getRevenueTableData(
          props.data,
          props.rates ? props.rates : data.matterRatesList,
          data.rtd,
          props.isSnapshot,
          false
        )
      )
    }
    //eslint-disable-next-line
  }, [
    props.rates,
    data.matterRatesList,
    JSON.stringify(props.data.costTimeEstimateList), //eslint-disable-line
  ])

  useEffect(() => {
    setTableLoaded(false)
  }, [selectedTab])

  const renderTitle = () => {
    switch (stage) {
      case 1:
        return t('matterResource.title1')
      case 2:
        return t('matterResource.title2')
      case 3:
        return t('matterResource.title3')
      case 4:
        return t('common.resource')
      default:
        return ''
    }
  }

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
      if (data.costTimeEstimateList.length !== validTaskCount) {
        return true
      }
    }
    return false
  }

  const getDisabledButtonText = () => {
    if (props.data) {
      if (props.data.pricingDTOList.length === 0) {
        return t('matterResource.tooltipStage31')
      }
      for (let x = 0; x < props.data.costTimeEstimateList.length; x++) {
        if (props.data.costTimeEstimateList[x].pricingId === 0) {
          return t('matterResource.tooltipStage32')
        }
      }
      for (let x = 0; x < props.data.pricingDTOList.length; x++) {
        if (props.data.pricingDTOList[x].taskList.length === 0) {
          return t('matterResource.tooltipStage33')
        }
      }
      if (data.costTimeEstimateList.length !== validTaskCount) {
        return t('matterResource.tooltipStage34')
      }
    }

    return ''
  }

  const getButtonStyling = () => {
    if (stage === 4) {
      if (!isValidSnapshot()) {
        return classes.confirmButton
      } else {
        return classes.confirmButtonDisabled
      }
    } else {
      if (!disabled) {
        return classes.confirmButton
      } else {
        return classes.confirmButtonDisabled
      }
    }
  }

  const renderSubtitle = () => {
    switch (stage) {
      case 1:
        return (
          <div className={classes.subtitleWrapper}>
            <ul>
              <li>
                <Typography
                  className={classes.subtitleText}
                  dangerouslySetInnerHTML={{
                    __html: t('matterResource.stage1SubtitleP1', {
                      grades: gradeHourPayload.length,
                    }),
                  }}
                ></Typography>
              </li>
              <li>
                <Typography
                  className={classes.subtitleText}
                  dangerouslySetInnerHTML={{
                    __html: t('matterResource.stage1SubtitleP2'),
                  }}
                ></Typography>
              </li>
            </ul>
          </div>
        )
      case 2:
        return (
          <div className={classes.subtitleWrapper}>
            <ul>
              <li>
                <Typography
                  className={classes.subtitleText}
                  dangerouslySetInnerHTML={{
                    __html: t('matterResource.stage2Subtitle1'),
                  }}
                ></Typography>
              </li>
              {/* <li>
                <Typography className={classes.subtitleText}>
                  {t('matterResource.stage2Subtitle2')}
                </Typography>
              </li> */}
              <li>
                <Typography className={classes.subtitleText}>
                  {t('matterResource.stage2Subtitle3')}
                </Typography>
              </li>
            </ul>
          </div>
        )
      case 3:
        return (
          <div className={classes.subtitleWrapper}>
            <ul>
              <li>
                <Typography
                  className={classes.subtitleText}
                  dangerouslySetInnerHTML={{
                    __html: t('matterResource.stage3SubtitleP1'),
                  }}
                ></Typography>
              </li>
              <li>
                <Typography className={classes.subtitleText}>
                  {t('matterResource.stage3SubtitleP2')}
                </Typography>
              </li>
            </ul>
          </div>
        )
      case 4:
        return <></>
      default:
        break
    }
    return <div>{t('matterResource.errorFallback')}</div>
  }

  if (showSpinner) {
    return <BigDataSpinner size={80} />
  } else {
    return (
      <div>
        <div className={classes.paperContainer}>
          <Paper className={classes.paperContent}>
            {/*Flow diagram goes here*/}
            <div>
              <Typography
                data-test="resource-title"
                className={classes.resourceTitle}
                variant="h5"
              >
                {renderTitle()}
              </Typography>
              <div>{renderSubtitle()}</div>
            </div>
            {stage === 1 && (
              <div>
                <GradeRatioTable
                  matterId={matterId}
                  orgId={props.orgId}
                  setTotalHours={setTotalHours}
                  startDate={dayjs(startDate).format('MMM YYYY')}
                  endDate={dayjs(endDate).format('MMM YYYY')}
                  setGradeHourPayload={setGradeHourPayload}
                  fullPeriod={fullPeriod}
                />
              </div>
            )}
            {stage === 2 && (
              <div className={classes.phaseDatesWrapper}>
                <PhaseDatesTable
                  matterId={matterId}
                  durationStart={dayjs(startDate)}
                  durationEnd={dayjs(endDate)}
                  fullPeriod={fullPeriod}
                  setMatterTasks={props.setMatterTasks}
                />
              </div>
            )}
            {stage === 3 && (
              <div>
                <PhaseHoursTable
                  matterId={matterId}
                  fullPeriod={fullPeriod}
                  data={data}
                  setPhaseHourPayload={setPhaseHourPayload}
                  durationStart={dayjs(startDate)}
                  durationEnd={dayjs(endDate)}
                />
              </div>
            )}
            {stage === 4 && (
              <div>
                <Tabs
                  className={classes.tabsContainer}
                  value={selectedTab}
                  onChange={(event, value) => setSelectedTab(parseInt(value))}
                  aria-label="basic tabs example"
                >
                  <Tab label={t('common.hours')} value={0} />
                  <Tab
                    className={classes.tabPointerEvents}
                    disabled={
                      data?.pricingDTOList?.length === 0 && !props.isSnapshot
                    }
                    label={
                      <Tooltip
                        title={t('matterResource.pricingUnavailableTooltip')}
                        disableHoverListener={
                          !(
                            data?.pricingDTOList?.length === 0 &&
                            !props.isSnapshot
                          )
                        }
                      >
                        <span> {t('common.fees')}</span>
                      </Tooltip>
                    }
                    value={1}
                  />
                  {!isClientUser && (
                    <Tab
                      className={classes.tabPointerEvents}
                      disabled={
                        data?.pricingDTOList?.length === 0 && !props.isSnapshot
                      }
                      label={
                        <Tooltip
                          title={t('matterResource.pricingUnavailableTooltip')}
                          disableHoverListener={
                            !(
                              data?.pricingDTOList?.length === 0 &&
                              !props.isSnapshot
                            )
                          }
                        >
                          <span>{t('matterResource.tabCost')}</span>
                        </Tooltip>
                      }
                      value={2}
                    />
                  )}
                  {!isClientUser && (
                    <Tab
                      className={classes.tabPointerEvents}
                      disabled={
                        data?.pricingDTOList?.length === 0 && !props.isSnapshot
                      }
                      label={
                        <Tooltip
                          title={t('matterResource.pricingUnavailableTooltip')}
                          disableHoverListener={
                            !(
                              data?.pricingDTOList?.length === 0 &&
                              !props.isSnapshot
                            )
                          }
                        >
                          <span>{t('matterResource.tabGrossProfit')}</span>
                        </Tooltip>
                      }
                      value={3}
                    />
                  )}
                  {!isClientUser && (
                    <Tab
                      className={classes.tabPointerEvents}
                      disabled={
                        data?.pricingDTOList?.length === 0 && !props.isSnapshot
                      }
                      label={
                        <Tooltip
                          title={t('matterResource.pricingUnavailableTooltip')}
                          disableHoverListener={
                            !(
                              data?.pricingDTOList?.length === 0 &&
                              !props.isSnapshot
                            )
                          }
                        >
                          <span>{t('matterResource.tabMargin')}</span>
                        </Tooltip>
                      }
                      value={4}
                    />
                  )}
                </Tabs>
                {selectedTab === 0 && (
                  <ResourceTable
                    pricingDTOList={data.pricingDTOList}
                    matterId={props.matterId}
                    durationStart={dayjs(startDate)}
                    durationEnd={dayjs(endDate)}
                    data={data}
                    setPageInfo={props.setPageInfo}
                    updateData={props.updateData}
                    setTotalHours={props.setTotalHours}
                    isSnapshot={props.isSnapshot}
                    matterTasks={matterTasks}
                    diffArray={props.diffArray}
                    setTableLoaded={setTableLoaded}
                    fullPeriod={fullPeriod}
                    assumptions={assumptions}
                  />
                )}
                {selectedTab === 1 && (
                  <RevenueTable
                    pricingDTOList={data.pricingDTOList}
                    matterId={props.matterId}
                    durationStart={dayjs(startDate)}
                    durationEnd={dayjs(endDate)}
                    data={data}
                    rtd={props.rtd}
                    rates={
                      !props.isSnapshot ? props.rates : data.matterRatesList
                    }
                    isSnapshot={props.isSnapshot}
                    setTableLoaded={setTableLoaded}
                    fullPeriod={fullPeriod}
                    diffArray={props.diffArray}
                    assumptions={assumptions}
                    matterTasks={matterTasks}
                  />
                )}
                {!isClientUser && selectedTab === 2 && (
                  <CostsTable
                    pricingDTOList={data.pricingDTOList}
                    matterId={props.matterId}
                    durationStart={dayjs(startDate)}
                    durationEnd={dayjs(endDate)}
                    data={data}
                    rtd={props.rtd}
                    rates={props.rates ? props.rates : data.matterRatesList}
                    isSnapshot={props.isSnapshot}
                    setTableLoaded={setTableLoaded}
                    fullPeriod={fullPeriod}
                    diffArray={props.diffArray}
                    assumptions={assumptions}
                    matterTasks={matterTasks}
                  />
                )}
                {!isClientUser && selectedTab === 3 && (
                  <GrossProfitTable
                    pricingDTOList={data.pricingDTOList}
                    matterId={props.matterId}
                    durationStart={dayjs(startDate)}
                    durationEnd={dayjs(endDate)}
                    data={data}
                    rtd={props.rtd}
                    rates={
                      !props.isSnapshot ? props.rates : data.matterRatesList
                    }
                    isSnapshot={props.isSnapshot}
                    setTableLoaded={setTableLoaded}
                    fullPeriod={fullPeriod}
                    diffArray={props.diffArray}
                    assumptions={assumptions}
                    matterTasks={matterTasks}
                  />
                )}
                {!isClientUser && selectedTab === 4 && (
                  <MarginTable
                    pricingDTOList={data.pricingDTOList}
                    matterId={props.matterId}
                    durationStart={dayjs(startDate)}
                    durationEnd={dayjs(endDate)}
                    data={data}
                    rtd={props.rtd}
                    rates={
                      !props.isSnapshot ? props.rates : data.matterRatesList
                    }
                    isSnapshot={props.isSnapshot}
                    setTableLoaded={setTableLoaded}
                    fullPeriod={fullPeriod}
                    diffArray={props.diffArray}
                    assumptions={assumptions}
                    matterTasks={matterTasks}
                  />
                )}
              </div>
            )}
          </Paper>
          {stage === 2 && <div className={classes.rateCardContainer}></div>}
          {!isClientUser &&
            ((!props.isSnapshot && stage !== 4) ||
              (!props.isSnapshot && stage === 4 && tableLoaded)) && (
              <div className={classes.confirmBox}>
                <Tooltip
                  title={
                    stage === 4
                      ? getDisabledButtonText()
                      : disabled
                        ? t('matterResource.tooltipRatioDisabled')
                        : ''
                  }
                >
                  <div className={classes.buttonWrapper}>
                    <LoadingButton
                      data-test="continue"
                      loadingPosition="end"
                      loading={buttonClicked}
                      className={[
                        getButtonStyling(),
                        buttonClicked ? classes.loadingButtonActive : '',
                      ].join(' ')}
                      disabled={stage === 4 ? isValidSnapshot() : disabled}
                      onClick={() => {
                        if (!buttonClicked) {
                          handleButtonClick()
                        }
                      }}
                    >
                      <span>
                        <div className={classes.buttonContent}>
                          {stage === 4
                            ? t('matterResource.finaliseButton')
                            : t('common.continue')}
                          {!buttonClicked && (
                            <ArrowCircleRightOutlinedIcon
                              className={classes.buttonIcon}
                            />
                          )}
                        </div>
                      </span>
                    </LoadingButton>
                  </div>
                </Tooltip>
              </div>
            )}
        </div>
      </div>
    )
  }
}
export default MatterResourceCosts
