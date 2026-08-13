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
import {
  Paper,
  Typography,
  MenuItem,
  Menu,
  Button,
  Radio,
  TextField,
  InputAdornment,
} from '@mui/material'
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined'
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import costsService from '../../../services/costs/costs-service'
import { useSelector } from 'react-redux'
import RateCard from '../../organisation/users/costs/RateCard'
import SearchFilter from '../../template-list/SearchFilter'
import uniqBy from 'lodash/uniqBy'
import rawColours from '../../../theme/raw-colours'
import MatterRatesTable from './MatterRatesTable'
import CalculationTypeSelector from './CalculationTypeSelector'
import JurCosts from '../../../assets/images/JurCostsIcon'
import BigDataSpinner from '../../../components/feedback/big-data-spinner/BigDataSpinner'
import matterCostsService from '../../../services/costs/matter-costs-service'
import LoadingButton from '@mui/lab/LoadingButton'
import juralioColours from '../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  paperContainer: {
    margin: theme.spacing(2),
  },
  paperContent: {
    padding: theme.spacing(1),
  },
  rateCardDiv: {
    display: 'grid',
    gridTemplateColumns: '5% 95%',
    marginBottom: theme.spacing(2),
    borderRadius: '5px',
    '&:hover': {
      backgroundColor: rawColours.primary.grey.main,
      cursor: 'pointer',
    },
  },
  rateCardContainer: {
    marginTop: theme.spacing(2),
  },
  filterWrapper: {
    marginBottom: theme.spacing(2.5),
    display: 'flex',
    marginTop: theme.spacing(2),
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
    '&:disabled': {
      color: rawColours.primary.black[100],
    },
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
}))

const MatterRatesSetupFlow = props => {
  const { isViewOnly, stage, rateTypes, userPosition } = props
  const { classes } = useStyles()
  const { t } = useTranslation()
  const matterId = parseInt(props.matterId)
  const [rateTableDetails, setRateTableDetails] = useState()
  const [availableRTDs, setAvailableRTDs] = useState()
  const [showSpinner, setShowSpinner] = useState(true)
  const [rates, setRates] = useState()
  const [newRates, setNewRates] = useState()
  const [fullPeriod, setFullPeriod] = useState()
  const [filterString, setFilterString] = useState('')
  const [selectedRTD, setSelectedRTD] = useState({ id: 'x' })
  const [selectedRTDPeriods, setSelectedRTDPeriods] = useState([])
  const [currency, setCurrency] = useState('All')
  const [tablePayload, setTablePayload] = useState()
  const [disabled, setDisabled] = useState(true)
  const [buttonString, setButtonString] = useState(
    t('matterRates.stage0Button')
  )
  const [stageTitle, setStageTitle] = useState(t('matterRates.stage0Title'))
  const [manualValues, setManualValues] = useState(0)
  const [selectedCalculationType, setSelectedCalculationType] = useState(0)
  const [calculationValue, setCalculationValue] = useState(0)
  const calculationTypeEnum = {
    0: t('no discount'),
    1: t('discount'),
    2: t('premium'),
  }
  const orgId = useSelector(state => state.auth.data.details.organisationId)
  const [createdMatterRTD, setCreatedMatterRTD] = useState()
  const [createdPeriod, setCreatedPeriod] = useState()
  const [calcValueError, setCalcValueError] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const [buttonClicked, setButtonClicked] = useState(false)
  const open = Boolean(anchorEl)
  const handleBeforeUnload = event => {
    event.preventDefault()
    return (event.returnValue = '')
  }

  useEffect(() => {
    if (selectedRTD.id === 'x') return
    window.addEventListener('beforeunload', handleBeforeUnload, {
      capture: true,
    })
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload, {
        capture: true,
      })
    }
  }, [selectedRTD])

  useEffect(() => {
    costsService
      .getFilteredRateTableDetails({
        removeDraft: true,
        position: userPosition?.positionData?.id,
      })
      .then(res => {
        if (res.status === 200) {
          setRateTableDetails(res.body)
          setAvailableRTDs(res.body)
          setShowSpinner(false)
        }
      })
  }, [])

  const getButtonDisabled = () => {
    switch (stage) {
      case 0:
        if (selectedRTD && selectedRTD.id !== 'x') {
          return false
        } else {
          return true
        }
      case 1:
        if (
          tablePayload?.length > 0 &&
          errorText !== 'Value must be between 1 and 100'
        ) {
          return false
        } else {
          return true
        }
      case 2:
        break

      default:
        break
    }
  }

  const handleButtonClick = () => {
    setButtonClicked(true)
    switch (stage) {
      case 0:
        costsService
          .getMatterRateTable(selectedRTD.id, matterId, true)
          .then(res => {
            setFullPeriod(selectedRTDPeriods[selectedRTDPeriods.length - 1])
            setRates(res.body)
            setButtonString(t('matterRates.stage2Button'))
            setStageTitle(t('matterRates.stage2Title'))
            setButtonClicked(false)
            props.setStage(1)
          })
        break
      case 1:
        var rtdPayload = {
          location: selectedRTD.location,
          currency: selectedRTD.currency,
          work_type: selectedRTD.work_type,
          draft: false,
          client: false,
          matter: matterId,
          rateTableDetails: selectedRTD.id,
          position: userPosition.positionData.id,
        }
        if (props.doReplace) {
          setShowSpinner(true)
          costsService.deleteMatterRateTableDetails(matterId).then(res => {
            if (res.status === 200) {
              costsService.createRateTableDetail(rtdPayload).then(res => {
                if (res.status === 200) {
                  //pump new rtd id into rates payload
                  res.body.initalPeriod = {
                    startDate:
                      selectedRTDPeriods[selectedRTDPeriods.length - 1]
                        .startDate,
                  }
                  setCreatedMatterRTD(res.body)
                  const newId = res.body.id
                  costsService
                    .createPeriod({
                      name: 'initial period',
                      startDate:
                        selectedRTDPeriods[selectedRTDPeriods.length - 1]
                          .startDate,
                      endDate: null,
                      rateTableDetailId: res.body.id,
                      matterId: matterId,
                    })
                    .then(res => {
                      if (res.status === 200) {
                        setCreatedPeriod(res.body)
                        const newPeriodId = res.body.id
                        var ratesPayload = tablePayload
                        ratesPayload.forEach(rateObj => {
                          rateObj.periodId = newPeriodId
                          rateObj.rate_table_detailsId = newId
                          rateObj.matterId = matterId
                        })
                        costsService.bulkCreateRates(ratesPayload).then(res => {
                          if (res.status === 200) {
                            costsService
                              .getMatterRateTable(newId, matterId, false)
                              .then(res => {
                                setNewRates(res.body)
                                props.setRates(res.body)
                                setButtonString(t('matterRates.stage3Button'))
                                setStageTitle(t('matterRates.stage3Title'))
                                props.refetchCostsData()
                                setCalculationValue(0)
                                setSelectedCalculationType(0)
                                setCurrency('')
                                props.setInReplaceFlow(false)
                                setButtonClicked(false)
                                props.setSelectedPage(2)
                                setShowSpinner(false)
                              })
                          }
                        })
                      }
                    })
                }
              })
            }
          })
        } else {
          setShowSpinner(true)
          costsService.createRateTableDetail(rtdPayload).then(res => {
            if (res.status === 200) {
              //pump new rtd id into rates payload
              res.body.initalPeriod = {
                startDate:
                  selectedRTDPeriods[selectedRTDPeriods.length - 1].startDate,
              }
              setCreatedMatterRTD(res.body)
              const newId = res.body.id
              costsService
                .createPeriod({
                  name: 'initial period',
                  startDate: null,
                  endDate: null,
                  rateTableDetailId: res.body.id,
                  matterId: matterId,
                })
                .then(res => {
                  if (res.status === 200) {
                    setCreatedPeriod(res.body)
                    const newPeriodId = res.body.id
                    var ratesPayload = tablePayload
                    ratesPayload.forEach(rateObj => {
                      rateObj.periodId = newPeriodId
                      rateObj.rate_table_detailsId = newId
                      rateObj.matterId = matterId
                    })
                    costsService.bulkCreateRates(ratesPayload).then(res => {
                      if (res.status === 200) {
                        costsService
                          .getMatterRateTable(newId, matterId, false)
                          .then(res => {
                            setNewRates(res.body)
                            props.setRates(res.body)
                            setButtonString(t('matterRates.stage3Button'))
                            setStageTitle(t('matterRates.stage3Title'))
                            setCalculationValue(0)
                            setSelectedCalculationType(0)
                            setCurrency('')
                            matterCostsService
                              .getCostStageData(matterId)
                              .then(res => {
                                if (res.status === 200) {
                                  props.setPageInfo(res.body)
                                  setButtonClicked(false)
                                  props.setSelectedPage(0)
                                  setShowSpinner(false)
                                }
                              })
                          })
                      }
                    })
                  }
                })
            }
          })
        }
        break
      default:
        break
    }
  }

  const filterRateCardsBySearchString = rateCard => {
    return (
      rateCard?.location?.toLowerCase().includes(filterString.toLowerCase()) ||
      rateCard?.work_type?.toLowerCase().includes(filterString.toLowerCase()) ||
      rateCard?.client_name?.toLowerCase().includes(filterString.toLowerCase())
    )
  }

  const rateCards =
    availableRTDs?.length !== undefined
      ? availableRTDs?.filter(rtd =>
          filterRateCardsBySearchString(rtd.rateTableDetails)
        )
      : []

  const handleCurrencyClick = e => {
    setAnchorEl(e.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const renderCurrency = () => {
    let validCurr = []
    if (rateTableDetails) {
      const validRTDs = rateTableDetails.filter(rtd => {
        if (
          !rtd.rateTableDetails.client &&
          !rtd.rateTableDetails.draft &&
          !rtd.rateTableDetails.is_retired
        ) {
          return rtd.rateTableDetails.currency
        }
      })
      validCurr.push({ name: 'All', id: 'x' })
      const uniqRTD = uniqBy(
        validRTDs.map(rtd => {
          if (!rtd.rateTableDetails.client && !rtd.rateTableDetails.draft) {
            return { name: rtd.rateTableDetails.currency }
          }
        }),
        'name'
      )

      validCurr = validCurr.concat(uniqRTD)
      return (
        <div style={{ display: 'flex' }}>
          <Button
            style={{
              color: rawColours.primary.black[200],
              borderColor: rawColours.primary.black[200],
              textTransform: 'none',
            }}
            variant="outlined"
            startIcon={<JurCosts colour={rawColours.primary.black[200]} />}
            endIcon={<KeyboardArrowDownIcon />}
            onClick={handleCurrencyClick}
          >
            {currency ? currency : 'Select a currency'}
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            {validCurr.map(curr => {
              return (
                <MenuItem
                  value={curr.name}
                  onClick={() => {
                    if (curr.id === 'x') {
                      setCurrency(curr.name)
                      const onlyClientOrgRtd = rateTableDetails.filter(
                        rtd => rtd.rateTableDetails.matter === false
                      )
                      setAvailableRTDs(onlyClientOrgRtd)
                    } else {
                      setCurrency(curr.name)
                      const rtdWithValidCurrency = rateTableDetails.filter(
                        rtd => rtd.rateTableDetails.currency === curr.name
                      )
                      const onlyClientOrgRtd = rtdWithValidCurrency.filter(
                        rtd => rtd.rateTableDetails.matter === false
                      )
                      setAvailableRTDs(onlyClientOrgRtd)
                    }
                    setSelectedRTD({ id: 'x' })
                    handleClose()
                  }}
                >
                  {curr.name}
                </MenuItem>
              )
            })}
          </Menu>
        </div>
      )
    } else {
      return <></>
    }
  }

  useEffect(() => {
    setDisabled(getButtonDisabled())
    //eslint-disable-next-line
  }, [stage, currency, selectedRTD, tablePayload])

  const handleRTDSelection = rtd => {
    if (!selectedRTD) {
      setSelectedRTD(rtd.rateTableDetails)
      setSelectedRTDPeriods(rtd.periods)
    } else if (selectedRTD.id !== rtd.rateTableDetails.id) {
      setSelectedRTD(rtd.rateTableDetails)
      setSelectedRTDPeriods(rtd.periods)
    } else {
      setSelectedRTD({ id: 'x' })
    }
  }
  const renderSubtitle = () => {
    switch (stage) {
      case 0:
        return (
          <div style={{ width: '66%', margin: '8px' }}>
            <Typography className={classes.subtitleText}>
              {t('matterRates.stage1Subtitle1')}
            </Typography>
            <Typography className={classes.subtitleText}>
              {t('matterRates.stage1Subtitle2')}
            </Typography>
          </div>
        )
      case 1:
        return (
          <div style={{ width: '66%', margin: '8px' }}>
            <Typography className={classes.subtitleText}>
              {t('matterRates.stage2SubtitleP1')}
              <b>
                {' ' +
                  selectedRTD.location +
                  ' | ' +
                  selectedRTD.work_type +
                  ' '}
              </b>
              {t('matterRates.stage2SubtitleP2')}
            </Typography>
          </div>
        )
      case 2:
        return (
          <div style={{ width: '66%', margin: '8px' }}>
            <Typography className={classes.subtitleText}>
              {t('matterRates.stage3Subtitle')}
            </Typography>
          </div>
        )
      default:
        break
    }
    return <div> Somethings gone wrong</div>
  }
  if (showSpinner) {
    return <BigDataSpinner size={180} />
  } else {
    return (
      <div className={classes.paperContainer}>
        <Paper className={classes.paperContent}>
          <div style={{ display: 'flex' }}>
            {stage === 1 && (
              <>
                <div>
                  <Button
                    style={{ marginLeft: '16px', marginRight: 'auto' }}
                    onClick={() => {
                      props.setStage(stage - 1)
                      setSelectedRTD({ id: 'x' })
                    }}
                    startIcon={<ArrowCircleLeftOutlinedIcon />}
                    data-test={'change-reference'}
                  >
                    {'Change reference table'}
                  </Button>
                </div>
              </>
            )}
            {stage < 2 && props.doReplace && (
              <div style={{ marginLeft: 'auto', marginRight: '16px' }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    props.setInReplaceFlow(false)
                    props.setSelectedPage(2)
                  }}
                >
                  {'Cancel Replace'}
                </Button>
              </div>
            )}
          </div>

          <div>
            <Typography variant="h5">{stageTitle}</Typography>
            <div>{renderSubtitle()}</div>
          </div>
          {stage === 0 && (
            <div>
              <div>
                <div className={classes.filterWrapper}>
                  {renderCurrency()}
                  <div style={{ placeSelf: 'center' }}>
                    <SearchFilter
                      filterString={filterString}
                      setFilterString={setFilterString}
                      helperText={t('Search client, location or work type')}
                    />
                  </div>
                </div>
              </div>
              {availableRTDs?.length > 0 &&
                rateCards.map(rtd => (
                  <div
                    className={classes.rateCardDiv}
                    onClick={() => {
                      handleRTDSelection(rtd)
                    }}
                  >
                    <div style={{ display: 'contents' }}>
                      <Radio
                        checked={
                          selectedRTD &&
                          selectedRTD?.id === rtd.rateTableDetails.id
                        }
                        value={rtd.rateTableDetails.id}
                      />
                    </div>
                    <div>
                      <RateCard
                        disabled={
                          selectedRTD
                            ? selectedRTD.id !== 'x'
                              ? rtd.rateTableDetails.id === selectedRTD.id
                                ? false
                                : true
                              : false
                            : false
                        }
                        setRates={setRates}
                        rate={rtd.rateTableDetails}
                        periods={rtd.periods}
                        setStage={props.setStage}
                        setFullPeriod={setFullPeriod}
                        orgId={orgId}
                        setSelectedRTD={setSelectedRTD}
                        noClick={true}
                        position={userPosition.positionData}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
          {stage === 1 && !showSpinner && (
            <div style={{ zIndex: 999, position: 'relative' }}>
              <div
                onClick={() => {
                  if (manualValues !== 0) {
                    setManualValues(0)
                    setTablePayload(null)
                  }
                }}
                style={{
                  display: 'flex',
                  height: '24px',
                  cursor: 'pointer',
                  marginBottom: '16px',
                }}
              >
                <Radio
                  data-test={'rate-percentage-values'}
                  checked={manualValues === 0}
                  value={0}
                  name="radio-buttons"
                  slotProps={{
                    input: { 'aria-label': '0' },
                  }}
                />
                <Typography
                  className={manualValues === 1 ? classes.unselectedRadio : ''}
                >
                  {t('matterRates.adoptRates')}
                </Typography>
                <CalculationTypeSelector
                  calculationTypeEnum={calculationTypeEnum}
                  selectedCalculationType={selectedCalculationType}
                  setSelectedCalculationType={setSelectedCalculationType}
                  setManualValues={setManualValues}
                  manualValues={manualValues}
                />
                {selectedCalculationType !== 0 && (
                  <>
                    <Typography
                      style={{
                        paddingRight: '4px',
                        paddingLeft: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {t(' of ')}
                    </Typography>
                    <TextField
                      value={calculationValue}
                      type="number"
                      variant="outlined"
                      className={classes.numberInput}
                      helperText={errorText}
                      error={calcValueError}
                      onChange={e => {
                        var value = parseInt(e.target.value)
                        if (value <= 100 && value > 0) {
                          setCalcValueError(false)
                          setErrorText('Outcome will be rounded')
                          setCalculationValue(value)
                        } else {
                          setCalcValueError(true)
                          setErrorText('Value must be between 1 and 100')
                          setCalculationValue(null)
                        }
                      }}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">%</InputAdornment>
                          ),
                        },

                        htmlInput: {
                          autoFocus: true,
                          min: 1,
                          max: 100,
                          style: {
                            width: 'fit-content',
                            borderRadius: '4px',
                          },
                        },
                      }}
                    />
                  </>
                )}
              </div>
              <div
                onClick={() => {
                  setManualValues(1)
                  setSelectedCalculationType(0)
                }}
                style={{ display: 'flex', height: '24px', cursor: 'pointer' }}
              >
                <Radio
                  data-test={'rate-manual-values'}
                  checked={manualValues === 1}
                  value={1}
                  name="radio-buttons"
                  slotProps={{
                    input: { 'aria-label': '0' },
                  }}
                />
                <Typography
                  className={manualValues === 0 ? classes.unselectedRadio : ''}
                >
                  {t('matterRates.manualRates')}
                </Typography>
              </div>
            </div>
          )}
          {stage === 3 && <div></div>}
        </Paper>
        {stage === 1 && !showSpinner && (
          <div>
            <MatterRatesTable
              rates={rates}
              orgId={orgId}
              rateTypes={rateTypes}
              period={[fullPeriod]}
              rtd={selectedRTD}
              parentClasses={classes}
              isFirstTimeFlow={true}
              selectedRTD={selectedRTD}
              manualValues={manualValues}
              selectedCalculationType={selectedCalculationType}
              calculationValue={calculationValue}
              setRatePayload={setTablePayload}
              editRates={manualValues}
              isViewOnly={isViewOnly}
            />
          </div>
        )}
        {stage === 2 && createdMatterRTD && !showSpinner && (
          <div className={classes.rateCardContainer}>
            <MatterRatesTable
              isMatterAdmin={props.isMatterAdmin}
              rates={newRates}
              rateTypes={rateTypes}
              orgId={orgId}
              period={[createdPeriod]}
              rtd={createdMatterRTD}
              parentClasses={classes}
              isFirstTimeFlow={false}
              setRates={setNewRates}
              setStage={props.setStage}
              setDoReplace={props.setDoReplace}
              matterId={matterId}
              isViewOnly={isViewOnly}
            />
          </div>
        )}
        <div className={classes.confirmBox}>
          {!showSpinner && (
            <LoadingButton
              data-test="continue"
              style={
                buttonClicked
                  ? {
                      paddingRight: '30px',
                      color: juralioColours.whiteText.primary,
                    }
                  : {}
              }
              loadingPosition="end"
              loading={buttonClicked}
              className={classes.confirmButton}
              disabled={disabled}
              onClick={() => {
                if (!buttonClicked) {
                  handleButtonClick()
                }
              }}
            >
              <span>
                <div style={{ display: 'flex' }}>
                  {buttonString}
                  {!buttonClicked && (
                    <ArrowCircleRightOutlinedIcon
                      className={classes.buttonIcon}
                    />
                  )}
                </div>
              </span>
            </LoadingButton>
          )}
        </div>
      </div>
    )
  }
}
export default MatterRatesSetupFlow
