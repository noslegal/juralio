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

import React from 'react'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'
import {
  Typography,
  Button,
  Chip,
  Divider,
  FormGroup,
  Switch,
  Tooltip,
} from '@mui/material'
import rawColours from '../../../theme/raw-colours'
import dayjs from 'dayjs'
import juralioColours from '../../../theme/juralio-colours'
import ProjectionStatusChip from './ProjectionStatusChip'
import { EditIcon } from '../../../theme/navigation/CommonIcons'
import OpenNewIcon from '@mui/icons-material/OpenInNew'
import JurCostsAddPricingIcon from '../../../assets/images/JurCostsAddPricingIcon'
import CloseIcon from '@mui/icons-material/Close'
import ArrowIcon from '@mui/icons-material/KeyboardReturn'
import JurCostsNullRevenue from '../../../assets/images/JurCostsNullRevenue'
//import JurCostsRevenueButton from '../../../assets/images/JurCostsRevenueButton'
import { getPricingIcon, getPricingType } from './pricingCardHelper'
import JurCoins from '../../../assets/images/JurCoins'
import { useLocation, useNavigate } from 'react-router'
import {
  getCostsDashboard,
  getMatterIdFromLocation,
} from '../../../components/navigation/common/location-context-helper'
import ProjectionHeaderOptionsMenu from './ProjectionHeaderOptionsMenu'
import { useDispatch, useSelector } from 'react-redux'
import { setMatterProjections } from '../../../redux/ducks/matter-costs'
import { useUserPosition } from '../../../hooks/user-hooks'
import MatterCostsHeaderButtons from '../MatterCostsHeaderButtons'

const useStyles = makeStyles()(theme => ({
  divWrapper: {
    marginRight: theme.spacing(4),
    marginLeft: theme.spacing(4),
    borderTop: '4px solid',
    borderLeft: '4px solid',
    borderRight: '4px solid',
    borderRadius: '8px 8px 0px 0px',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: '50% 50%',
  },
  iconWrapper: {
    marginTop: theme.spacing(1.5),
  },
  div1: {
    marginRight: theme.spacing(4),
    marginLeft: theme.spacing(4),
    padding: theme.spacing(1),
    textAlign: 'center',
  },
  div2: {
    backgroundColor: rawColours.primary.grey.main,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: juralioColours.darkText.disabled,
  },
  div3: {
    backgroundColor: rawColours.primary.grey.main,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: juralioColours.darkText.disabled,
  },
  div4: {
    backgroundColor: rawColours.primary.grey.main,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: juralioColours.darkText.disabled,
  },
  div2Hover: {
    backgroundColor: 'white',
    padding: theme.spacing(1),
    textAlign: 'center',
    '&:hover': {
      backgroundColor: rawColours.primary.grey[200],
      cursor: 'pointer',
    },
  },
  div3Hover: {
    backgroundColor: 'white',
    padding: theme.spacing(1),
    textAlign: 'center',
    '&:hover': {
      backgroundColor: '#DDE5F2',
      cursor: 'pointer',
    },
  },
  div4Hover: {
    backgroundColor: 'white',
    padding: theme.spacing(1),
    textAlign: 'center',
    '&:hover': {
      backgroundColor: rawColours.primary.grey[200],
      cursor: 'pointer',
    },
  },
  diagramContainer: {
    marginLeft: 'auto',
    marginRight: '4px',
  },
  bottomRow: {
    backgroundColor: 'white',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    padding: theme.spacing(2),
  },
  resourceTab: {
    margin: '4px 0px 0px 4px',
    width: '50%',
  },
  pricingTab: {
    margin: '4px 0px 0px 4px',
    width: '50%',
  },
  card: {
    borderBottom: '2px solid',
    borderColor: juralioColours.darkText.disabled,
  },
  bottomRowInnerZeroState: {
    display: 'grid',
    gridTemplateColumns: '25% 60% 15%',
  },
  bottomRowInner: {
    display: 'grid',
    gridTemplateColumns: '25% 75%',
  },
  bottomRowInnerButton: { marginTop: '12px' },
  bottomRowInnerIcon: { marginTop: '12px' },
  bottomRowInnerText: { marginTop: '12px' },
  editPeriodButton: {
    display: 'flex',
  },
  editPeriodButtonHover: {
    display: 'flex',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: juralioColours.darkText.disabled,
    },
  },
  seeButton: {
    textTransform: 'none',
    borderColor: rawColours.primary.black[200],
    color: rawColours.primary.black[200],
    marginTop: theme.spacing(0.5),
    borderRadius: theme.spacing(1.5),
  },
  pricingOpenCloseDiv: {
    height: theme.spacing(4),
    width: theme.spacing(4),
    marginRight: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: 'white',
    border: '1px solid',
    borderColor: juralioColours.darkText.primary,
    borderRadius: theme.spacing(0.5),
    color: juralioColours.darkText.primary,
    cursor: 'pointer',
    flexShrink: 0,
  },
  closePill: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '32px',
    width: '32px',
    borderRadius: '16px',
    cursor: 'pointer',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    color: juralioColours.darkText.secondary,
    flexShrink: 0,
    marginRight: theme.spacing(1.5),
    alignSelf: 'center',
  },
  contentCell: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    height: '100%',
    boxSizing: 'border-box',
  },
  contentCellIcon: {
    flexShrink: 0,
  },
  contentCellText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
  },
  pricingHeaderRow: {
    display: 'flex',
    alignItems: 'center',
  },
  marginRightAuto: {
    marginRight: 'auto',
  },
  pricingActionsRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(0.5),
  },
  pricingMoreText: {
    marginLeft: 'auto',
  },
  feesProjectedCaption: {
    display: 'block',
    textAlign: 'right',
  },
  feesLabel: {
    marginRight: 'auto',
    fontWeight: 'bold',
  },
  feesAmount: {
    fontSize: '1.5rem',
  },
  feesActionsRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(0.5),
  },
  marginChipWrapper: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  marginChip: {
    backgroundColor: rawColours.primary.grey.main,
    color: rawColours.primary.black.black,
    fontWeight: 'bold',
  },
  pricingOffset: {
    marginTop: '6px',
  },
  div1Outer: {
    display: 'flex',
  },
  div1IconRow: {
    display: 'flex',
  },
  div1PeriodLabel: {
    width: 'fit-content',
    marginRight: '4px',
    marginLeft: '8px',
  },
  div1PeriodLabelNarrow: {
    width: 'fit-content',
    marginRight: '4px',
    marginLeft: '4px',
  },
  div1EditIcon: {
    marginTop: '2px',
  },
  div1StatusRow: {
    marginLeft: '8px',
    marginRight: '8px',
    display: 'flex',
    marginTop: '4px',
  },
  div1LiveModeSwitch: {
    marginTop: '-8px',
    marginLeft: '8px',
  },
  div1OpenNewIcon: {
    cursor: 'pointer',
    color: juralioColours.darkText.secondary,
  },
  div1CurrencyRow: {
    marginLeft: '4px',
    marginRight: 'auto',
    width: 'fit-content',
  },
  div1HeaderButtonsWrapper: {
    marginTop: '11px',
    marginLeft: 'auto',
  },
  div1OptionsMenuWrapper: {
    marginTop: 'auto',
    marginBottom: 'auto',
  },
}))

const ProjectionHeader = props => {
  const {
    currency,
    selectedArea,
    totalHours,
    data,
    isSnapshot,
    isRetired,
    fullPeriod,
    canBeRetired,
    noDraftProjectionOpen,
    liveMode,
    setLiveMode,
    diffArray,
    showRatesModal,
    setShowRatesModal,
    showAssumptionsModal,
    setShowAssumptionsModal,
    isMatterAdmin,
    pageInfo,
    editRates,
    doReplace,
    setSelectedSnapshotRates,
    setSelectedSnapshotRtd,
    setSelectedSnapshotPeriods,
    setSelectedSnapshotAssumptions,
    setSelectedSnapshotDate,
    snapshotDate,
    rates,
    isViewOnly,
  } = props
  const { classes } = useStyles()
  const { t } = useTranslation()
  const matter = useSelector(state => state.matterDetails.matter)
  const userPosition = useUserPosition(matter)
  const isClientUser = userPosition.isClient && !userPosition.isInternalGroup
  const totalRevenue = data?.revenueValuesDTO?.totalRevenue
    ? data?.revenueValuesDTO?.totalRevenue
    : 0
  const history = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const dashboardProjections = useSelector(
    state => state.matterCosts.projections
  )
  const getDiv1Content = () => {
    let startYear
    let endYear
    let startMonth
    let endMonth
    if (fullPeriod && selectedArea > 0) {
      startYear = dayjs(fullPeriod.startDate).format('YYYY')
      endYear = dayjs(fullPeriod.endDate).format('YYYY')
      startMonth = dayjs(fullPeriod.startDate).format('MMM')
      endMonth = dayjs(fullPeriod.endDate).format('MMM')
    } else {
      startYear = dayjs(props.startDate).format('YYYY')
      endYear = props.endDate
        ? dayjs(props.endDate).format('YYYY')
        : dayjs(props.startDate).format('YYYY')
      startMonth = dayjs(props.startDate).format('MMM')
      endMonth = props.endDate ? dayjs(props.endDate).format('MMM') : '?'
    }
    return (
      <div className={classes.div1Outer}>
        {fullPeriod &&
          (props.isExpanded || props.disableClicks) &&
          selectedArea !== 3 && (
            <div
              className={classes.pricingOpenCloseDiv}
              onClick={() => {
                if (
                  window.dispatchEvent(
                    new Event('leavePage', { cancelable: true })
                  ) === true
                ) {
                  if (props.addNewProjection) {
                    props.setSelectedPage(2)
                  } else {
                    props.setSelectedArea(3)
                    props.setCollapseData(false)
                    props.setIsExpanded(false)
                    props.setIsCardOpen(false)
                    history(
                      getCostsDashboard(
                        getMatterIdFromLocation(location, 'matter')
                      )
                    )
                  }
                }
              }}
            >
              <ArrowIcon />
            </div>
          )}

        <div className={classes.iconWrapper}>
          <div className={classes.div1IconRow}>
            <div
              className={
                !isSnapshot && !liveMode
                  ? classes.editPeriodButtonHover
                  : classes.editPeriodButton
              }
              onClick={() => {
                if (!isSnapshot && !liveMode) {
                  props.setSelectedArea(0)
                }
              }}
            >
              {startMonth === endMonth && startYear === endYear ? (
                <Typography className={classes.div1PeriodLabel} variant="h5">
                  {startYear + ' ' + startMonth}
                </Typography>
              ) : (
                <Typography
                  className={classes.div1PeriodLabelNarrow}
                  variant={'h5'}
                >
                  {startYear +
                    ' ' +
                    startMonth +
                    ' - ' +
                    endYear +
                    ' ' +
                    endMonth}
                </Typography>
              )}
              {!isSnapshot && !liveMode && (
                <EditIcon className={classes.div1EditIcon} />
              )}
            </div>
            <div className={classes.div1StatusRow}>
              <ProjectionStatusChip
                isSnapshot={isSnapshot}
                isRetired={isRetired}
                liveMode={liveMode}
              />
              {(isSnapshot || liveMode) && !isViewOnly && !isRetired && (
                <FormGroup
                  className={classes.div1LiveModeSwitch}
                  data-test="live-mode-toggle"
                >
                  <Tooltip
                    title={
                      props.ratesDontMatch
                        ? 'Live mode disabled when live rates do not match snapshotted rates'
                        : diffArray[0]?.total > 0
                          ? 'Not all changes are visible in finalised projection - switch to live to see more '
                          : ''
                    }
                  >
                    <span>
                      <Switch
                        disabled={props.ratesDontMatch}
                        checked={liveMode}
                        onChange={() => {
                          dashboardProjections.find(
                            p => p.id === fullPeriod.id
                          ).live = !liveMode
                          dispatch(setMatterProjections(dashboardProjections))
                          setLiveMode(!liveMode)
                          if (liveMode) {
                            window.location.href =
                              window.location.href.split('?')[0]
                          } else if (!liveMode && selectedArea !== 3) {
                            window.location.href =
                              window.location.href + '?version=live'
                          }
                        }}
                        sx={
                          diffArray[0]?.total > 0
                            ? {
                                '&.MuiSwitch-root .MuiSwitch-switchBase': {
                                  color: juralioColours.taskStatus.done,
                                },

                                '&.MuiSwitch-root .Mui-checked': {
                                  color: juralioColours.taskStatus.inProgress,
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                                  {
                                    backgroundColor:
                                      juralioColours.taskStatus.inProgress,
                                    boxShadow: '0px 0px 0px 0px #5B15DF',
                                  },
                                '& .MuiSwitch-track': {
                                  backgroundColor:
                                    juralioColours.taskStatus.done,
                                  animation: 'pulsey 2s infinite',
                                },
                                '@keyframes pulsey': {
                                  '0%': {
                                    boxShadow: '0px 0px 2px 3px #5B15DF',
                                  },
                                  '100%': {
                                    boxShadow: '0px 0px 2px 6px #5B15DF',
                                  },
                                },
                              }
                            : {
                                '&.MuiSwitch-root .MuiSwitch-switchBase': {
                                  color: juralioColours.taskStatus.done,
                                },

                                '&.MuiSwitch-root .Mui-checked': {
                                  color: juralioColours.taskStatus.inProgress,
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                                  {
                                    backgroundColor:
                                      juralioColours.taskStatus.inProgress,
                                  },
                                '& .MuiSwitch-track': {
                                  backgroundColor:
                                    juralioColours.taskStatus.done,
                                },
                              }
                        }
                      />
                    </span>
                  </Tooltip>
                </FormGroup>
              )}
              <Tooltip title={t('matterCosts.openInNewTab')}>
                <OpenNewIcon
                  className={classes.div1OpenNewIcon}
                  onClick={() => {
                    window.open(window.location.href, '_blank')
                  }}
                />
              </Tooltip>
            </div>
          </div>
          <div className={classes.div1CurrencyRow}>
            <Typography variant="body1">
              {/* {'Assumptions'} <b>{' - '}</b>
            {' |  Other costs '} */}
              <b>{currency.substring(0, 3)}</b>
              {'  |  Phases with resource in this period - ' +
                (data?.costTimeEstimateList
                  ? data.costTimeEstimateList.filter(x => x.hourValue).length +
                    '/' +
                    data?.costTimeEstimateList?.length
                  : '')}
            </Typography>
          </div>
        </div>
        <div className={classes.div1HeaderButtonsWrapper}>
          <MatterCostsHeaderButtons
            isMatterAdmin={isMatterAdmin}
            pageInfo={pageInfo}
            showRatesModal={showRatesModal}
            setShowRatesModal={setShowRatesModal}
            showAssumptionsModal={showAssumptionsModal}
            setShowAssumptionsModal={setShowAssumptionsModal}
            disableRatesModal={
              !pageInfo?.finishedMatterRates || editRates || doReplace
            }
            setSelectedSnapshotRates={setSelectedSnapshotRates}
            setSelectedSnapshotRtd={setSelectedSnapshotRtd}
            setSelectedSnapshotPeriods={setSelectedSnapshotPeriods}
            setSelectedSnapshotDate={setSelectedSnapshotDate}
            snapshotRates={rates}
            snapshotRtd={data?.rtd?.rateTableDetails}
            snapshotPeriods={data?.rtd?.periods}
            snapshotDate={snapshotDate}
            setSelectedSnapshotAssumptions={setSelectedSnapshotAssumptions}
            snapshotAssumptions={data?.assumptionList}
            snapshotCostTimeEstimates={data?.costTimeEstimateList}
            isSnapshot={isSnapshot}
          />
        </div>

        {fullPeriod &&
          (props.isExpanded || props.disableClicks) &&
          selectedArea === 3 && (
            <div
              className={classes.closePill}
              onClick={() => {
                if (
                  window.dispatchEvent(
                    new Event('leavePage', { cancelable: true })
                  ) === true
                ) {
                  if (props.addNewProjection) {
                    props.setSelectedPage(2)
                  } else {
                    props.setSelectedArea(3)
                    props.setCollapseData(false)
                    props.setIsExpanded(false)
                    props.setIsCardOpen(false)
                    history(
                      getCostsDashboard(
                        getMatterIdFromLocation(location, 'matter')
                      )
                    )
                  }
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </div>
          )}
        {(isSnapshot || liveMode) && !isRetired && (
          <div className={classes.div1OptionsMenuWrapper}>
            <ProjectionHeaderOptionsMenu
              matterId={props.matterId}
              snapshotId={props.snapshotId}
              setPageInfo={props.setPageInfo}
              noDraftProjectionOpen={noDraftProjectionOpen}
              canBeRetired={canBeRetired}
              data={data}
              setShowDownloadDialog={props.setShowDownloadDialog}
              isViewOnly={isViewOnly}
            />
          </div>
        )}
      </div>
    )
  }

  const getPricingDivContent = () => {
    if (props.data?.pricingDTOList?.length > 0) {
      const isMulti = props.data.pricingDTOList.length > 1
      return (
        <div className={`${classes.contentCell} ${classes.pricingOffset}`}>
          <div className={classes.contentCellIcon}>
            {isMulti ? (
              <JurCostsAddPricingIcon style={{ fontSize: '2.5rem' }} />
            ) : (
              React.cloneElement(
                getPricingIcon(
                  props.data.pricingDTOList[0].type,
                  props.data.pricingDTOList[0].cap,
                  props.data.pricingDTOList[0].fullReason,
                  t
                ),
                { sx: { fontSize: '2.5rem' } }
              )
            )}
          </div>
          <div className={classes.contentCellText}>
            <div className={classes.pricingHeaderRow}>
              <Typography variant="h6" className={classes.marginRightAuto}>
                {isMulti
                  ? t('matterCosts.projectionCard.pricingTypes')
                  : getPricingType(
                      props.data.pricingDTOList[0].type,
                      props.data.pricingDTOList[0].cap,
                      props.data.pricingDTOList[0].value
                    )}
              </Typography>
              {isMulti && (
                <Typography variant="h5">
                  {props.data.pricingDTOList.length}
                </Typography>
              )}
            </div>
            <Divider />
            <div className={classes.pricingActionsRow}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  props.setSelectedArea(1)
                  props.setCollapseData(true)
                  if (liveMode) {
                    window.location.href =
                      window.location.href.split('/projection')[0] +
                      '/projection/' +
                      fullPeriod.id +
                      '/pricing?version=live'
                  } else {
                    window.location.href =
                      window.location.href.split('/projection')[0] +
                      '/projection/' +
                      fullPeriod.id +
                      '/pricing'
                  }
                }}
                className={classes.seeButton}
              >
                {t('matterCosts.seeTypes')}
              </Button>
              {isMulti && (
                <Typography variant="body1" className={classes.pricingMoreText}>
                  {getPricingType(
                    props.data.pricingDTOList[0].type,
                    props.data.pricingDTOList[0].cap,
                    props.data.pricingDTOList[0].value
                  ) +
                    ' + ' +
                    t('matterCosts.projectionCard.more', {
                      count: props.data.pricingDTOList.length - 1,
                    })}
                </Typography>
              )}
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className={classes.contentCell}>
          <div className={classes.contentCellIcon}>
            <JurCoins
              customColour={
                fullPeriod && !props.disableClicks
                  ? juralioColours.darkText.primary
                  : juralioColours.darkText.disabled
              }
              sx={{ fontSize: '2.5rem' }}
            />
          </div>
          <div className={classes.contentCellText}>
            <div className={classes.pricingHeaderRow}>
              <Typography variant="h6" className={classes.marginRightAuto}>
                {t('matterCosts.projectionCard.addPricingType')}
              </Typography>
            </div>
            <Divider />
            <div className={classes.pricingActionsRow}>
              <Typography variant="body1">
                {t('matterCosts.projectionCard.timeBasedAndMore')}
              </Typography>
              {fullPeriod && <EditIcon className={classes.pricingMoreText} />}
            </div>
          </div>
        </div>
      )
    }
  }

  const getRevenueContent = () => {
    if (
      isSnapshot ||
      (data && data.finishedPricing && data.finishedMatterResources)
    ) {
      const revenue = isSnapshot
        ? totalRevenue
            .toFixed(0)
            ?.toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        : props.draftRevenueTotal?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return (
        <div className={classes.contentCell}>
          <div className={classes.contentCellIcon}>
            <JurCoins sx={{ fontSize: '2.5rem' }} />
          </div>
          <div className={classes.contentCellText}>
            <Typography
              variant="caption"
              className={classes.feesProjectedCaption}
            >
              {t('matterCosts.projectionCard.projected')}
            </Typography>
            <div>
              <div className={classes.pricingHeaderRow}>
                <Typography variant="h6" className={classes.feesLabel}>
                  {t('common.fees')}
                </Typography>
                <Typography className={classes.feesAmount}>
                  <b>{revenue}</b>
                </Typography>
              </div>
              <Divider />
            </div>
            <div className={classes.feesActionsRow}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  if (
                    window.dispatchEvent(
                      new Event('leavePage', { cancelable: true })
                    ) === true
                  ) {
                    props.setSelectedArea(2)
                    props.setCollapseData(true)
                    props.setIsCardOpen(true)
                    if (liveMode) {
                      window.location.href =
                        window.location.href.split('/projection')[0] +
                        '/projection/' +
                        fullPeriod.id +
                        '/resource?version=live'
                    } else {
                      window.location.href =
                        window.location.href.split('/projection')[0] +
                        '/projection/' +
                        fullPeriod.id +
                        '/resource'
                    }
                  }
                }}
                className={classes.seeButton}
              >
                {t('matterCosts.seeDetails')}
              </Button>
              {!isClientUser && (
                <div className={classes.marginChipWrapper}>
                  <Typography variant="body2">
                    {t('matterCosts.projectionCard.margin')}
                  </Typography>
                  <Chip
                    label={props.profitMargin + '%'}
                    size="small"
                    className={classes.marginChip}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className={classes.contentCell}>
          <div className={classes.contentCellIcon}>
            <JurCostsNullRevenue
              customColour={
                fullPeriod && !props.disableClicks
                  ? juralioColours.darkText.primary
                  : juralioColours.darkText.disabled
              }
              sx={{ fontSize: '2.5rem' }}
            />
          </div>
          <div className={classes.contentCellText}>
            <div className={classes.pricingHeaderRow}>
              <Typography variant="h5" className={classes.marginRightAuto}>
                {t('common.fees')}
              </Typography>
            </div>
            <Divider />
            <div className={classes.pricingActionsRow}>
              <Typography variant="body1">
                {t('matterCosts.projectionCard.feesAutomatic')}
              </Typography>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div
      className={classes.card}
      style={
        liveMode
          ? { backgroundColor: rawColours.status.inProgress.light }
          : isSnapshot && !isRetired
            ? { backgroundColor: rawColours.status.done.light }
            : isRetired
              ? { backgroundColor: rawColours.status.notRequired.light }
              : { backgroundColor: rawColours.status.notStarted.light }
      }
    >
      <div className={classes.div1}>{getDiv1Content()}</div>
      <div
        className={classes.divWrapper}
        style={
          liveMode
            ? { borderColor: juralioColours.taskStatus.inProgress }
            : isSnapshot && !isRetired
              ? { borderColor: juralioColours.taskStatus.done }
              : isRetired
                ? { borderColor: juralioColours.taskStatus.notRequired }
                : { borderColor: juralioColours.taskStatus.notStarted }
        }
      >
        <div
          data-test="pricing-div"
          onClick={() => {
            if (fullPeriod && !props.disableClicks) {
              props.setSelectedArea(1)
              props.setCollapseData(true)
              props.setIsCardOpen(true)
              if (liveMode) {
                window.location.href =
                  window.location.href.split('/projection')[0] +
                  '/projection/' +
                  fullPeriod.id +
                  '/pricing?version=live'
              } else {
                window.location.href =
                  window.location.href.split('/projection')[0] +
                  '/projection/' +
                  fullPeriod.id +
                  '/pricing'
              }
            }
          }}
          style={
            selectedArea === 1 && isSnapshot
              ? { backgroundColor: '#DDE5F2' }
              : selectedArea === 1 && !isSnapshot
                ? { backgroundColor: '#FCF8E8' }
                : {}
          }
          className={
            fullPeriod && !props.disableClicks
              ? classes.div2Hover
              : classes.div2
          }
        >
          {getPricingDivContent()}
        </div>
        <div
          onClick={() => {
            if (
              window.dispatchEvent(
                new Event('leavePage', { cancelable: true })
              ) === true
            ) {
              props.setSelectedArea(2)
              props.setCollapseData(true)
              props.setIsCardOpen(true)
              if (liveMode) {
                window.location.href =
                  window.location.href.split('/projection')[0] +
                  '/projection/' +
                  fullPeriod.id +
                  '/resource?version=live'
              } else {
                window.location.href =
                  window.location.href.split('/projection')[0] +
                  '/projection/' +
                  fullPeriod.id +
                  '/resource'
              }
            }
          }}
          style={
            selectedArea === 2 && isSnapshot
              ? { backgroundColor: '#DDE5F2' }
              : selectedArea === 2 && !isSnapshot
                ? { backgroundColor: '#FCF8E8' }
                : {}
          }
          className={
            fullPeriod && !props.disableClicks
              ? classes.div4Hover
              : classes.div4
          }
        >
          {getRevenueContent()}
        </div>
      </div>
    </div>
  )
}

export default ProjectionHeader
