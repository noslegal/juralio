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

import { Button, Paper, Tooltip, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import CostsFlowDiagram from './CostsFlowDiagram'
import { useTranslation } from 'react-i18next'
import {
  getButtonClick,
  getButtonText,
  getCostsContent,
  getWelcomeBackScreen,
} from './CostsHelper'
import rawColours from '../../../../theme/raw-colours'
import costsService from '../../../../services/costs/costs-service'
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined'
import RateTable from './RateTable'
import GradeTable from './GradeTable'
import RateTypeTable from './RateTypeTable'
import OtherCostsTable from './OtherCostsTable'
import { POSITIONS, RATE_TABLE_TYPES } from '../../../constants'
import BigDataSpinner from '../../../../components/feedback/big-data-spinner/BigDataSpinner'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate } from 'react-router'
import OrgCostsSubHeader from '../../../../components/navigation/global-header/global-sub-header/OrgCostsSubHeader'
import PanelTitle from '../panels/PanelTitle'
import JurCosts from '../../../../assets/images/JurCostsIcon'
import { getClientCostsContent } from './CostsClientHelper'
import juralioColours from '../../../../theme/juralio-colours'
import OrgCostsDashboard from './OrgCostsDashboard'
import ClientRateTable from './ClientRateTable'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    width: '100%',
    marginTop: theme.spacing(3),
  },
  containerDiv: {
    margin: theme.spacing(2.5),
    height: '100%',
    width: 'auto',
  },
  header: {
    display: 'flex',
    marginBottom: theme.spacing(),
  },
  skeleton: {
    marginTop: 8,
  },
  textDiv: {
    marginBottom: theme.spacing(1.5),
  },
  greyBox: {
    backgroundColor: rawColours.primary.grey.main,
    borderRadius: theme.spacing(),
    padding: theme.spacing(1.25),
    display: 'flex',
  },
  confirmBox: {
    marginTop: theme.spacing(2),
    borderRadius: theme.spacing(),
    padding: theme.spacing(1.25),
  },
  confirmButton: {
    textTransform: 'none',
    marginRight: '8px',
    color: rawColours.primary.grey.main,
    backgroundColor: rawColours.primary.black[200],
    '&:hover': {
      backgroundColor: rawColours.primary.black.black,
    },
    '&:disabled': {
      color: rawColours.primary.black[100],
    },
  },
  skipButton: {
    borderColor: juralioColours.darkText.primary,
    textTransform: 'none',
    marginRight: '8px',
    color: juralioColours.darkText.primary,
    backgroundColor: juralioColours.whiteText.primary,
    '&:hover': {
      backgroundColor: rawColours.primary.grey[200],
    },
    '&:disabled': {
      color: rawColours.primary.black[100],
    },
  },
  buttonIcon: {
    marginLeft: theme.spacing(1.5),
  },
  greyBoxIcon: {
    scale: '1.5',
    marginRight: theme.spacing(1),
  },
  textField: {
    display: 'block',
  },
  rateCardDiv: {
    marginBottom: theme.spacing(2),
  },
  filterWrapper: {
    display: 'flex',
    marginBottom: theme.spacing(2.5),
  },
  outerContainer: {
    width: '100%',
    paddingTop: '8px',
    paddingBottom: '8px',
  },
  subHeaderWrapper: {
    marginBottom: '16px',
  },
  innerFullWidth: {
    width: '100%',
  },
  transparentPaper: {
    width: 'auto',
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
  paddedPaper: {
    padding: '0px 0px 0px 24px',
  },
  tableWrapper: {
    paddingTop: '10px',
  },
  gradeTableWrapper: {
    position: 'relative',
    height: 'fit-content',
  },
}))

const CostsContainer = props => {
  const { router, position } = props
  const organisation = useSelector(
    state => state.organisation?.selectedOrganisation
  )
  const userData = useSelector(state => state.auth.data.details)
  const instanceSettings = useSelector(state => state.instanceSettings)
  const isCostsEnabled =
    instanceSettings.settings?.costsEnabled && organisation?.costsEnabled
  const orgId = useSelector(state => state.auth.data.details.organisationId)
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [stage, setStage] = useState(
    router?.location?.state?.orgCostItem >= 0
      ? router?.location?.state?.orgCostItem
      : 0
  )

  const isOrgAdmin = useSelector(state =>
    state.auth?.data?.auth?.roles.includes('ROLE_ORG_ADMIN')
  )
  const [latestStage, setLatestStage] = useState(0)
  const [grades, setGrades] = useState([])
  const [gradeCategories, setGradeCategories] = useState([])
  const [rateTypes, setRateTypes] = useState([])
  const [otherCosts, setOtherCosts] = useState([])
  const [showWelcomeBack, setShowWelcomeBack] = useState(false)
  const [currency, setCurrency] = useState('')
  const [workType, setWorkType] = useState('')
  const [location, setLocation] = useState('')
  const [period, setPeriod] = useState(undefined)
  const [rateTableType, setRateTableType] = useState(
    RATE_TABLE_TYPES.ORGANISATION
  )
  const [clientName, setClientName] = useState('')
  const [rateTableTemplate, setRateTableTemplate] = useState('')
  const [fullPeriod, setFullPeriod] = useState()
  const [rateTableDetails, setRateTableDetails] = useState([])
  const [selectedRTD, setSelectedRTD] = useState([])
  const [dataExists, setDataExists] = useState(false)
  const [ratePayload, setRatePayload] = useState([])
  const [buttonDisabled, setButtonDisabled] = useState(true)
  const [rates, setRates] = useState([])
  const [showSpinner, setShowSpinner] = useState(true)
  const [finaliseRatesFailed, setFinaliseRatesFailed] = useState(false)

  const showButtonAdvisor =
    position.name === POSITIONS.ADVISOR.name &&
    (stage < 9 || stage === 13 || stage === 14)

  const showButtonClient =
    position.name === POSITIONS.CLIENT.name &&
    (stage <= 8 || stage === 13 || stage === 14)

  useEffect(() => {
    if (router?.location?.state?.orgCostItem >= 0) {
      setStage(router?.location?.state?.orgCostItem)
    }
  }, [router?.location?.state?.orgCostItem])

  useEffect(() => {
    if (stage === 6 || stage === 13 || stage === 14) {
      if (ratePayload.filter(x => x.rate !== null).length === 0) {
        setButtonDisabled(true)
      } else {
        setButtonDisabled(false)
      }
    } else if (stage !== 5) {
      setButtonDisabled(false)
    }
  }, [stage, ratePayload])

  useEffect(() => {
    //get current stage to be used in component
    costsService.getCostStageData(position.id).then(res => {
      if (res.status === 200) {
        if (res.body.isReturning) {
          setShowWelcomeBack(true)
        }
        if (res.body.stage === 0) {
          setShowSpinner(false)
        }
        if (
          !router?.location?.state?.orgCostItem ||
          router?.location?.state?.orgCostItem < 7
        ) {
          setStage(res.body.stage)
        }
        setLatestStage(res.body.stage)
      }
    })
    //eslint-disable-next-line
  }, [orgId])

  useEffect(() => {
    if (stage === 5) {
      if (currency !== '' && workType !== '' && location !== '') {
        setButtonDisabled(false)
      }
    }
    //eslint-disable-next-line
  }, [currency, workType, location])

  useEffect(() => {
    setFinaliseRatesFailed(false)
    //if stage is 1 and data is not current there get it
    if (stage >= 2 && grades.length === 0) {
      costsService.getGrades(position.id).then(res => {
        if (res.status === 200) {
          setGrades(res.body)
          setShowSpinner(false)
        }
      })
      costsService.getGradeCategories(position.id).then(res => {
        if (res.status === 200) {
          setGradeCategories(res.body)
          setShowSpinner(false)
        }
      })
    }
    if (stage >= 3 && rateTypes.length === 0) {
      costsService.getRateTypes(position.id).then(res => {
        if (res.status === 200) {
          setRateTypes(res.body)
          setShowSpinner(false)
        }
      })
    }
    if (stage >= 4 && otherCosts.length === 0) {
      costsService.getOtherCosts(position.id).then(res => {
        if (res.status === 200) {
          setOtherCosts(res.body)
          setShowSpinner(false)
        }
      })
    }
    if (
      stage >= 5 &&
      stage !== 9 &&
      stage !== 10 &&
      stage !== 11 &&
      location === ''
    ) {
      costsService.getRateTableDetail(position.id).then(res => {
        if (res.status === 200 && res.body.length === 1) {
          if (stage < 7) {
            setLocation(res.body[0].rateTableDetails.location)
            setWorkType(res.body[0].rateTableDetails.work_type)
            setCurrency(res.body[0].rateTableDetails.currency)
            setPeriod(new Date(res.body[0].periods[0].startDate))
            setRateTableDetails(res.body[0].rateTableDetails)
          }
          setFullPeriod(res.body[0].periods)
          setDataExists(true)
          setShowSpinner(false)
        } else {
          setDataExists(false)
          setShowSpinner(false)
        }
      })
    }
    //FTUE has been done
    if (stage === 7) {
      setButtonDisabled(false)
      setShowSpinner(true)
      costsService.getRateTableDetail(position.id).then(res => {
        if (res.status === 200) {
          setRateTableDetails(res.body)
          setShowSpinner(false)
        }
      })
    }
    //eslint-disable-next-line
  }, [stage])

  if (
    instanceSettings?.hasLoaded &&
    organisation?.isLoaded &&
    (!isCostsEnabled || !isOrgAdmin)
  ) {
    return <Navigate push to="/404" />
  }

  if (showSpinner) {
    return (
      <div className={classes.root}>
        <BigDataSpinner size={180} />
      </div>
    )
  }

  return (
    <Paper>
      <div
        data-test="organisation-costs-container"
        className={classes.outerContainer}
      >
        <div className={classes.containerDiv}>
          <PanelTitle
            icon={<JurCosts colour={juralioColours.darkText.primary} />}
            header={
              position.name === POSITIONS.CLIENT.name
                ? t('organisationAdmin.costs.clientHeader')
                : t('organisationAdmin.costs.advisorHeader')
            }
            caption={
              position.name === POSITIONS.CLIENT.name
                ? t('organisationAdmin.costs.clientSubheader')
                : t('organisationAdmin.costs.advisorSubheader')
            }
          />
          {stage >= 7 && (
            <div className={classes.subHeaderWrapper}>
              <OrgCostsSubHeader router={router} />
            </div>
          )}
          {stage === 7 && (
            <OrgCostsDashboard
              stage={stage}
              rateTableDetails={rateTableDetails}
              setSelectedRTD={setSelectedRTD}
              setRates={setRates}
              setStage={setStage}
              setFullPeriod={setFullPeriod}
              orgId={orgId}
              position={position}
            />
          )}
          {stage !== 7 && (
            <Paper
              elevation={0}
              className={
                stage > 7 && stage !== 8
                  ? classes.transparentPaper
                  : classes.paddedPaper
              }
            >
              <div className={`${classes.innerFullWidth} ${classes.root}`}>
                <div className={classes.innerFullWidth}>
                  {stage > 0 && stage < 7 && !showWelcomeBack && (
                    <CostsFlowDiagram
                      setStage={setStage}
                      stage={stage}
                      latestStage={latestStage}
                      noClick={false}
                      buttonDisabled={buttonDisabled}
                      showTitle={true}
                      position={position.name}
                    />
                  )}
                  {!showWelcomeBack &&
                    position.name === POSITIONS.ADVISOR.name &&
                    getCostsContent(
                      stage,
                      t,
                      classes,
                      currency,
                      setCurrency,
                      workType,
                      setWorkType,
                      location,
                      setLocation,
                      period,
                      setPeriod,
                      latestStage,
                      orgId,
                      grades,
                      gradeCategories,
                      rateTypes,
                      otherCosts,
                      setButtonDisabled,
                      rates,
                      rateTableDetails,
                      fullPeriod,
                      rateTableType,
                      setRateTableType,
                      rateTableTemplate,
                      setRateTableTemplate,
                      setRatePayload,
                      selectedRTD,
                      clientName,
                      setClientName,
                      setRates,
                      setGrades,
                      setRateTypes,
                      setOtherCosts,
                      setStage,
                      finaliseRatesFailed,
                      setFinaliseRatesFailed,
                      position
                    )}
                  {!showWelcomeBack &&
                    position.name === POSITIONS.CLIENT.name &&
                    getClientCostsContent(
                      stage,
                      t,
                      classes,
                      currency,
                      setCurrency,
                      workType,
                      setWorkType,
                      location,
                      setLocation,
                      period,
                      setPeriod,
                      latestStage,
                      orgId,
                      grades,
                      gradeCategories,
                      rateTypes,
                      otherCosts,
                      setButtonDisabled,
                      rates,
                      rateTableDetails,
                      fullPeriod,
                      rateTableType,
                      setRateTableType,
                      rateTableTemplate,
                      setRateTableTemplate,
                      setRatePayload,
                      selectedRTD,
                      clientName,
                      setClientName,
                      setRates,
                      setGrades,
                      setRateTypes,
                      setOtherCosts,
                      setStage,
                      finaliseRatesFailed,
                      setFinaliseRatesFailed,
                      position
                    )}
                  {showWelcomeBack &&
                    getWelcomeBackScreen(t, classes, stage, latestStage)}
                </div>
              </div>
            </Paper>
          )}
          <div className={classes.tableWrapper}>
            {stage === 2 && !showWelcomeBack && (
              <div className={classes.gradeTableWrapper}>
                <GradeTable
                  orgId={orgId}
                  grades={grades}
                  gradeCategories={gradeCategories}
                  setButtonDisabled={setButtonDisabled}
                  setGrades={setGrades}
                />
              </div>
            )}
            {stage === 3 && !showWelcomeBack && (
              <RateTypeTable
                rateTypes={rateTypes}
                orgId={orgId}
                setButtonDisabled={setButtonDisabled}
                setRateTypes={setRateTypes}
                position={position}
              />
            )}
            {stage === 4 && !showWelcomeBack && (
              <OtherCostsTable
                costs={otherCosts}
                orgId={orgId}
                setButtonDisabled={setButtonDisabled}
                setOtherCosts={setOtherCosts}
              />
            )}
            {stage === 6 &&
              !showWelcomeBack &&
              position.name === POSITIONS.ADVISOR.name && (
                <RateTable
                  isFirstTimeFlow={true}
                  setRatePayload={setRatePayload}
                  orgId={orgId}
                  period={fullPeriod}
                  grades={grades}
                  rateTypes={rateTypes}
                  rtd={rateTableDetails}
                  parentClasses={classes}
                  selectedRTD={selectedRTD}
                  finaliseFailed={finaliseRatesFailed}
                  setFinaliseFailed={setFinaliseRatesFailed}
                />
              )}
            {stage === 6 &&
              !showWelcomeBack &&
              position.name === POSITIONS.CLIENT.name && (
                <ClientRateTable
                  isFirstTimeFlow={true}
                  setRatePayload={setRatePayload}
                  orgId={orgId}
                  period={fullPeriod}
                  grades={grades}
                  rateTypes={rateTypes}
                  rtd={rateTableDetails}
                  parentClasses={classes}
                  selectedRTD={selectedRTD}
                  finaliseFailed={finaliseRatesFailed}
                  setFinaliseFailed={setFinaliseRatesFailed}
                />
              )}
          </div>
          {(showButtonAdvisor || showButtonClient) && (
            <div className={classes.confirmBox}>
              <Tooltip
                title={
                  (stage === 5 || stage === 8) && buttonDisabled
                    ? t('organisationAdmin.costs.fillAllFields')
                    : ''
                }
              >
                <span>
                  <Button
                    data-test="continue-flow"
                    disabled={buttonDisabled && !showWelcomeBack}
                    onClick={() => {
                      getButtonClick(
                        stage,
                        setStage,
                        showWelcomeBack,
                        setShowWelcomeBack,
                        orgId,
                        latestStage,
                        setLatestStage,
                        setShowSpinner,
                        setGrades,
                        setGradeCategories,
                        setRateTypes,
                        setOtherCosts,
                        currency,
                        workType,
                        clientName,
                        period,
                        setPeriod,
                        setFullPeriod,
                        location,
                        dataExists,
                        setRateTableDetails,
                        setRates,
                        ratePayload,
                        rateTableType,
                        setSelectedRTD,
                        rateTableTemplate,
                        dispatch,
                        setFinaliseRatesFailed,
                        position.id
                      )
                    }}
                    className={classes.confirmButton}
                  >
                    {getButtonText(stage, t, showWelcomeBack)}
                    <ArrowCircleRightOutlinedIcon
                      className={classes.buttonIcon}
                    />
                  </Button>
                </span>
              </Tooltip>
              {position.name === POSITIONS.CLIENT.name && stage === 5 && (
                <Button
                  variant="outlined"
                  className={classes.skipButton}
                  data-test="skip-flow"
                  onClick={() => {
                    setStage(7)
                  }}
                >
                  {t('common.skip')}
                </Button>
              )}
              {finaliseRatesFailed && (
                <Typography color={'error'}>
                  {t('organisationAdmin.costs.missingRates')}
                </Typography>
              )}
            </div>
          )}
        </div>
      </div>
    </Paper>
  )
}

export default CostsContainer
