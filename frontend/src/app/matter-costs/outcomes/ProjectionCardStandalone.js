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
import { useTranslation } from 'react-i18next'
import {
  Typography,
  Button,
  Chip,
  Divider,
  FormGroup,
  Tooltip,
  Switch,
} from '@mui/material'
import rawColours from '../../../theme/raw-colours'
import dayjs from 'dayjs'
import JurCoins from '../../../assets/images/JurCoins'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import juralioColours from '../../../theme/juralio-colours'
import ProjectionStatusChip from './ProjectionStatusChip'
import { EditIcon } from '../../../theme/navigation/CommonIcons'
import JurCostsAddPricingIcon from '../../../assets/images/JurCostsAddPricingIcon'
import JurCostsNullRevenue from '../../../assets/images/JurCostsNullRevenue'
import JurCostsRevenueButton from '../../../assets/images/JurCostsRevenueButton'
import ProjectionHeader from './ProjectionHeader'
import ProjectionHeaderOptionsMenu from './ProjectionHeaderOptionsMenu'
import ProjectionContent from './ProjectionContent'
import { getPricingIcon, getPricingType } from './pricingCardHelper'
import {
  getProjectionTotalCost,
  getProjectionTotalRevenue,
  getGrossProfitMargin,
  formatLiveTasks,
  convertCteDates,
  parseDiff,
  countDegradedAssumptions,
} from './revenueHelper'
import matterCostsService from '../../../services/costs/matter-costs-service'
import { getProjectionIdFromLocation } from '../../../components/navigation/common/location-context-helper'
import { useLocation } from 'react-router'
import { diff } from 'json-diff'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import { useDispatch, useSelector } from 'react-redux'
import { setMatterProjections } from '../../../redux/ducks/matter-costs'
import { useUserPosition } from '../../../hooks/user-hooks'
import CostsExportDialog from './CostsExportDialog'

const useStyles = makeStyles()(theme => ({
  divWrapper: {
    display: 'grid',
    gridTemplateColumns: '50% 50%',
  },
  marginChip: {
    backgroundColor: rawColours.primary.grey.main,
    color: rawColours.primary.black.black,
    fontWeight: 'bold',
  },
  contentCell: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5),
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
    gap: theme.spacing(0.25),
  },
  diffInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: rawColours.primary.purple.primary,
    overflow: 'hidden',
  },
  diffCount: {
    overflow: 'hidden',
    maxWidth: '30px',
    opacity: 1,
    transition: 'max-width 0.2s ease 0.35s, opacity 0.2s ease 0.35s',
    whiteSpace: 'nowrap',
  },
  diffCountHidden: {
    overflow: 'hidden',
    maxWidth: '0',
    opacity: 0,
    transition: 'max-width 0.2s ease 0s, opacity 0.2s ease 0s',
    whiteSpace: 'nowrap',
  },
  diffText: {
    overflow: 'hidden',
    maxWidth: '0',
    transition: 'max-width 0.35s ease 0s',
    whiteSpace: 'nowrap',
  },
  diffTextExpanded: {
    overflow: 'hidden',
    maxWidth: '500px',
    transition: 'max-width 0.35s ease 0.2s',
    whiteSpace: 'nowrap',
  },
  iconWrapper: {
    marginTop: theme.spacing(1.5),
  },
  div1: {
    backgroundColor: 'white',
    padding: theme.spacing(1),
    textAlign: 'center',
    borderBottomStyle: 'solid',
    borderBottomWidth: 4,
  },
  div2: {
    backgroundColor: 'white',
    height: '100%',
    boxSizing: 'border-box',
    '&:hover': {
      backgroundColor: '#FCF8E8',
      cursor: 'pointer',
    },
  },
  div2Snapshot: {
    backgroundColor: 'white',
    height: '100%',
    boxSizing: 'border-box',
    '&:hover': {
      backgroundColor: '#DDE5F2',
      cursor: 'pointer',
    },
  },
  div3: {
    backgroundColor: 'white',
    padding: theme.spacing(1),
    textAlign: 'center',
    '&:hover': {
      backgroundColor: '#FCF8E8',
      cursor: 'pointer',
    },
  },
  div3snapShot: {
    backgroundColor: 'white',
    padding: theme.spacing(1),
    textAlign: 'center',
    '&:hover': {
      backgroundColor: '#DDE5F2',
      cursor: 'pointer',
    },
  },
  div4: {
    backgroundColor: 'white',
    //borderLeft: `1px solid ${rawColours.primary.black[200]}`,
    height: '100%',
    boxSizing: 'border-box',
  },
  div4Hover: {
    '&:hover': {
      backgroundColor: '#FCF8E8',
      cursor: 'pointer',
    },
  },
  div4SnapshotHover: {
    '&:hover': {
      backgroundColor: '#DDE5F2',
      cursor: 'pointer',
    },
  },
  diagramContainer: {
    marginLeft: 'auto',
    marginRight: theme.spacing(0.5),
  },
  bottomRow: {
    backgroundColor: 'white',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    padding: theme.spacing(1),
  },
  resourceTab: {
    margin: '4px 0px 0px 4px',
    width: '50%',
    padding: theme.spacing(1),
  },
  pricingTab: {
    margin: '4px 0px 0px 4px',
    width: '50%',
    padding: theme.spacing(1),
  },
  card: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    borderColor: rawColours.primary.black[200],
    border: '1px solid',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  cardHoverLive: {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 0 0 3px ${juralioColours.taskStatus.inProgress}, 0 0 16px 4px ${juralioColours.taskStatus.inProgress}bb`,
    },
  },
  cardHoverSnapshot: {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 0 0 3px ${juralioColours.taskStatus.done}, 0 0 16px 4px ${juralioColours.taskStatus.done}bb`,
    },
  },
  cardHoverRetired: {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 0 0 3px ${juralioColours.taskStatus.notRequired}, 0 0 16px 4px ${juralioColours.taskStatus.notRequired}bb`,
    },
  },
  cardHoverNotStarted: {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 0 0 3px ${juralioColours.taskStatus.notStarted}, 0 0 16px 4px ${juralioColours.taskStatus.notStarted}bb`,
    },
  },
  bottomRowInnerZeroState: {
    display: 'grid',
    gridTemplateColumns: '25% 60% 15%',
  },
  bottomRowInner: {
    display: 'grid',
    gridTemplateColumns: '25% 75%',
  },
  bottomRowInnerButton: { marginTop: theme.spacing(1.5) },
  bottomRowInnerIcon: { marginTop: theme.spacing(1.5) },
  bottomRowInnerText: { marginTop: theme.spacing(1.5) },
  editPeriodButtonHover: {
    display: 'flex',
    padding: theme.spacing(0.5),
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: juralioColours.darkText.disabled,
    },
  },
  editPeriodButton: {
    display: 'flex',
    padding: theme.spacing(0.5),
  },
  seeButton: {
    textTransform: 'none',
    borderColor: rawColours.primary.black[200],
    color: rawColours.primary.black[200],
    marginTop: theme.spacing(0.5),
    borderRadius: theme.spacing(1.5),
  },
  pricingOpenCloseDiv: {
    height: theme.spacing(7.5),
    width: theme.spacing(4),
    marginRight: theme.spacing(1.5),
    alignContent: 'center',
    color: juralioColours.darkText.primary,
    cursor: 'pointer',
  },
  arrowFlipped: {
    transform: 'scaleY(-1)',
  },
  div1Inner: {
    display: 'flex',
  },
  diffBadge: {
    width: '28px',
    height: '25px',
    borderRadius: '50%',
    color: 'white',
    backgroundColor: rawColours.primary.purple.primary,
    paddingTop: '3px',
    marginLeft: '4px',
  },
  dateTypographySingle: {
    width: 'fit-content',
    marginRight: '4px',
    marginLeft: '8px',
  },
  dateTypographyRange: {
    width: 'fit-content',
    marginRight: '4px',
    marginLeft: '4px',
  },
  editIconMargin: {
    marginTop: '8px',
  },
  statusChipContainer: {
    marginLeft: '8px',
    marginRight: '8px',
    marginTop: '6px',
    marginBottom: 'auto',
    display: 'flex',
  },
  liveToggleGroup: {
    marginLeft: '8px',
    marginTop: '-8px',
  },
  currencyRow: {
    marginLeft: '4px',
    marginRight: 'auto',
    display: 'flex',
    alignItems: 'center',
  },
  colorInherit: {
    color: 'inherit',
  },
  optionsMenuWrapper: {
    marginLeft: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  pricingHeaderRow: {
    display: 'flex',
    alignItems: 'center',
  },
  marginRightAuto: {
    marginRight: 'auto',
  },
  pricingBodyMin: {
    minHeight: '20px',
  },
  pricingActionsRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(0.25),
  },
  pricingMoreText: {
    marginLeft: 'auto',
  },
  feesActionsRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(0.25),
  },
  marginChipWrapper: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
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
  pricingOffset: {
    marginTop: '2px',
  },
  zeroStateIconScale: {
    scale: '2',
    paddingTop: '8px',
    paddingBottom: '8px',
  },
  zeroStateText: {
    marginRight: 'auto',
    width: 'fit-content',
    textAlign: 'left',
  },
  zeroStateAlignCenter: {
    alignContent: 'center',
  },
  stickyHeader: {
    position: 'sticky',
    width: '100%',
    height: 'fit-content',
  },
  pointerEventsNone: {
    pointerEvents: 'none',
  },
  div1LiveMode: {
    borderColor: juralioColours.taskStatus.inProgress,
  },
  div1Snapshot: {
    borderColor: juralioColours.taskStatus.done,
  },
  div1Retired: {
    borderColor: juralioColours.taskStatus.notRequired,
    backgroundColor: 'lightGrey',
  },
  div1NotStarted: {
    borderColor: juralioColours.taskStatus.notStarted,
  },
  div1Expandable: {
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      cursor: 'pointer',
    },
  },
  expandPillWrapper: {
    marginLeft: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  expandPill: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '32px',
    width: '32px',
    borderRadius: '16px',
    cursor: 'pointer',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    color: juralioColours.darkText.secondary,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition:
      'width 0.25s ease, background-color 0.25s ease, color 0.25s ease',
  },
  expandPillExpanded: {
    width: '136px',
    gap: '4px',
    paddingLeft: '12px',
    paddingRight: '12px',
  },
  expandPillExpandedLive: {
    backgroundColor: juralioColours.taskStatus.inProgress,
    color: 'white',
  },
  expandPillExpandedSnapshot: {
    backgroundColor: juralioColours.taskStatus.done,
    color: 'white',
  },
  expandPillExpandedRetired: {
    backgroundColor: juralioColours.taskStatus.notRequired,
    color: 'white',
  },
  expandPillExpandedNotStarted: {
    backgroundColor: juralioColours.taskStatus.notStarted,
    color: 'white',
  },
  expandPillText: {
    fontSize: '0.8rem',
    fontWeight: 500,
    overflow: 'hidden',
    maxWidth: 0,
    opacity: 0,
    transition: 'max-width 0.25s ease, opacity 0.15s ease',
    whiteSpace: 'nowrap',
  },
  expandPillTextVisible: {
    maxWidth: '120px',
    opacity: 1,
  },
}))

const ProjectionCardStandalone = props => {
  const location = useLocation()
  const {
    currency,
    setCollapseData,
    matterId,
    projectionPeriod,
    disabled,
    snapshot,
    projectionData,
    canEditStartDate,
    setSelectedPage,
    rtd,
    setPageInfo,
    isCardOpen,
    setIsCardOpen,
    goTo,
    autoOpen,
    canBeRetired,
    snapshotId,
    isRetired,
    noDraftProjectionOpen,
    matterTasks,
    setMatterTasks,
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
    isViewOnly,
  } = props
  const dispatch = useDispatch()
  const dashboardProjections = useSelector(
    state => state.matterCosts.projections
  )
  const matter = useSelector(state => state.matterDetails.matter)
  const userPosition = useUserPosition(matter)
  const isClientUser = userPosition.isClient && !userPosition.isInternalGroup
  const [liveMode, setLiveMode] = useState(false)
  let rates =
    liveMode || snapshot === null ? props.rates : snapshot?.matterRatesList
  let data = liveMode || snapshot === null ? projectionData : snapshot
  let isSnapshot = snapshot && !liveMode ? true : false
  const [totalHours, setTotalHours] = useState(
    data?.costTimeEstimateList
      ?.map(cte => cte.hourValue)
      ?.reduce((partialSum, a) => partialSum + a, 0)
  )
  const [fullPeriod, setFullPeriod] = useState(projectionPeriod)
  const [isExpanded, setIsExpanded] = useState(
    projectionPeriod && !autoOpen ? false : true
  )
  const [startDate, setStartDate] = useState(
    projectionPeriod
      ? projectionPeriod.startDate
      : dayjs().startOf('month').toDate()
  )
  const [endDate, setEndDate] = useState(
    projectionPeriod ? projectionPeriod.endDate : null
  )
  const [selectedArea, setSelectedArea] = useState(goTo ? goTo : 0)
  const { classes } = useStyles()
  const { t } = useTranslation()
  const ratesDontMatch =
    props.snapshot?.rtd.rateTableDetails.id !== props.rtd?.rateTableDetails.id

  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [pillHovered, setPillHovered] = useState(false)
  const [projection, setProjection] = useState(data)
  const [diffArray, setDiffArray] = useState([])
  const [assumptionFlagCount, setAssumptionFlagCount] = useState(0)
  const [draftRevenueTotal, setDraftRevenueTotal] = useState(null)
  const [projectionMargin, setProjectionMargin] = useState(0)
  const liveCteList = projectionData?.costTimeEstimateList
    ? formatLiveTasks(cloneDeep(projectionData.costTimeEstimateList))
    : []

  useEffect(() => {
    setDiffArray(
      snapshot
        ? parseDiff(
            diff(
              convertCteDates(
                snapshot.costTimeEstimateList.sort((a, b) => a.id - b.id)
              ),
              convertCteDates(liveCteList.sort((a, b) => a.id - b.id))
            ),
            snapshot.costTimeEstimateList
          )
        : []
    )
  }, [snapshot]) //eslint-disable-line

  // Flag assumptions that have degraded (to at-risk / not-met) since the
  // snapshot, feeding the count into this projection's change notification.
  useEffect(() => {
    if (!snapshot || !matterId) {
      setAssumptionFlagCount(0)
      return
    }
    matterCostsService
      .getAssumptions(matterId)
      .then(r => {
        const liveAssumptions = Array.isArray(r?.body) ? r.body : []
        setAssumptionFlagCount(
          countDegradedAssumptions(snapshot.assumptionList, liveAssumptions)
        )
      })
      .catch(() => setAssumptionFlagCount(0))
  }, [snapshot, matterId]) //eslint-disable-line

  useEffect(() => {
    let data = liveMode || snapshot === null ? projectionData : snapshot
    setProjection(data)

    rates = //eslint-disable-next-line
      liveMode || snapshot === null ? props.rates : snapshot?.matterRatesList
  }, [liveMode])

  useEffect(() => {
    if (
      // isSnapshot &&
      matterTasks?.length !== data?.costTimeEstimateList?.length &&
      diffArray?.length > 0
    ) {
      let x = parseDiff(
        diff(
          convertCteDates(
            snapshot.costTimeEstimateList.sort((a, b) => a.id - b.id)
          ),
          convertCteDates(liveCteList.sort((a, b) => a.id - b.id))
        ),
        snapshot.costTimeEstimateList
      )
      setDiffArray(x)
    }
    //eslint-disable-next-line
  }, [data, matterTasks])

  useEffect(() => {
    let splitUrl = window.location.href.split('?')
    if (splitUrl.length > 1 && isCardOpen) {
      let urlParams = new URLSearchParams(
        '?' + window.location.href.split('?')[1]
      )
      let liveMode = urlParams.get('version')
      if (liveMode === 'live') {
        setLiveMode(true)

        if (
          dashboardProjections.find(p => p?.id === fullPeriod?.id) !==
            undefined &&
          parseInt(getProjectionIdFromLocation(location)) === fullPeriod.id
        ) {
          dashboardProjections.find(p => p.id === fullPeriod.id).live = true
          dispatch(setMatterProjections(dashboardProjections))
        }
      } else {
        setLiveMode(false)
      }
    } else {
      if (
        dashboardProjections.find(p => p?.id === fullPeriod?.id) !==
          undefined &&
        dashboardProjections.find(p => p?.id === fullPeriod?.id).live === true
      ) {
        setLiveMode(true)
      } else {
        setLiveMode(false)
      }
    }
  }, [window.location.href]) //eslint-disable-line

  useEffect(() => {
    let newData = liveMode || snapshot === null ? projectionData : snapshot
    //fix flickering snapshot table
    if (!isEqual(JSON.stringify(projection), JSON.stringify(newData))) {
      setProjection(newData)
      setFullPeriod(projectionPeriod)
      setTotalHours(
        data?.costTimeEstimateList
          .map(cte => cte.hourValue)
          .reduce((partialSum, a) => partialSum + a, 0)
      )
    }
    if (data && data.revenueValuesDTO) {
      setProjectionMargin(
        getGrossProfitMargin(
          data.revenueValuesDTO.totalRevenue,
          data.revenueValuesDTO.totalCost
        )
      )
    }
    //eslint-disable-next-line
  }, [projectionData])

  useEffect(() => {
    if (goTo > 0) {
      setSelectedArea(goTo)
      setIsExpanded(true)
    } else if (fullPeriod) {
      setIsExpanded(false)
      setCollapseData(false)
      setIsCardOpen(false)
    }
    //eslint-disable-next-line
  }, [goTo])

  useEffect(() => {
    if (projection && rates) {
      if (
        projection.finishedPricing &&
        projection.finishedMatterResources &&
        !projection.revenueValuesDTO
      ) {
        const totalRevenue = getProjectionTotalRevenue(projection, rates, rtd)
        setDraftRevenueTotal(totalRevenue.toFixed(0).toString())
        let totalCost = getProjectionTotalCost(projection, rates)
        setProjectionMargin(getGrossProfitMargin(totalRevenue, totalCost))
      } else if (projection.revenueValuesDTO && !liveMode) {
        setProjectionMargin(
          getGrossProfitMargin(
            data.revenueValuesDTO.totalRevenue,
            data.revenueValuesDTO.totalCost
          )
        )
      }
    }
  }, [projection, rates, totalHours]) //eslint-disable-line

  const getHoursImpact = () => {
    if (!snapshot || !liveCteList) return 0
    const liveTotal = liveCteList.reduce(
      (sum, c) => sum + (c.hourValue || 0),
      0
    )
    const snapshotTotal = (snapshot.costTimeEstimateList || []).reduce(
      (sum, c) => sum + (c.hourValue || 0),
      0
    )
    return Math.round(liveTotal - snapshotTotal)
  }

  const getDiv1Content = () => {
    let startYear
    let endYear
    let startMonth
    let endMonth
    if (fullPeriod) {
      startYear = dayjs(fullPeriod.startDate).format('YYYY')
      endYear = dayjs(fullPeriod.endDate).format('YYYY')
      startMonth = dayjs(fullPeriod.startDate).format('MMM')
      endMonth = dayjs(fullPeriod.endDate).format('MMM')
    }
    return (
      <div className={classes.div1Inner}>
        <div className={classes.iconWrapper}>
          <div className={classes.div1Inner}>
            <div
              className={
                !isSnapshot && !liveMode
                  ? classes.editPeriodButtonHover
                  : classes.editPeriodButton
              }
              onClick={() => {
                if (!isSnapshot && !liveMode) {
                  setSelectedArea(0)
                  setIsExpanded(true)
                  setIsCardOpen(true)
                  setCollapseData(true)
                }
              }}
            >
              {startMonth === endMonth && startYear === endYear ? (
                <Typography
                  className={classes.dateTypographySingle}
                  variant="h5"
                >
                  {startYear + ' ' + startMonth}
                </Typography>
              ) : (
                <Typography
                  className={classes.dateTypographyRange}
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
                <EditIcon className={classes.editIconMargin} />
              )}
            </div>

            <div className={classes.statusChipContainer}>
              <ProjectionStatusChip
                isSnapshot={isSnapshot}
                isRetired={isRetired}
                liveMode={liveMode}
              />
              {(isSnapshot || liveMode) && !isRetired && !isViewOnly && (
                <FormGroup className={classes.liveToggleGroup}>
                  <Tooltip
                    title={
                      ratesDontMatch
                        ? t('matterCosts.projectionCard.liveDisabledTooltip')
                        : diffArray[0]?.total > 0
                          ? t('matterCosts.projectionCard.liveChangesTooltip')
                          : ''
                    }
                  >
                    <span>
                      <Switch
                        sx={{
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
                            backgroundColor: juralioColours.taskStatus.done,
                          },
                        }}
                        data-test="live-mode-toggle"
                        disabled={ratesDontMatch}
                        checked={liveMode}
                        onClick={e => e.stopPropagation()}
                        onChange={e => {
                          dashboardProjections.find(
                            p => p.id === fullPeriod.id
                          ).live = !liveMode
                          dispatch(setMatterProjections(dashboardProjections))
                          setLiveMode(!liveMode)
                          e.stopPropagation()
                        }}
                      />
                    </span>
                  </Tooltip>
                </FormGroup>
              )}
            </div>
          </div>
          <div className={classes.currencyRow}>
            <Typography variant="body1">
              <b>
                {t('matterCosts.projectionCard.currency') +
                  ' : ' +
                  currency.substring(0, 3)}
              </b>
            </Typography>
            {(diffArray.length > 1 || assumptionFlagCount > 0) &&
              !ratesDontMatch && (
                <>
                  <Divider orientation="vertical" flexItem />
                  <div className={classes.diffInfo}>
                    <InfoOutlinedIcon fontSize="small" />
                    <Typography
                      variant="body2"
                      className={`${classes.colorInherit} ${
                        pillHovered
                          ? classes.diffCountHidden
                          : classes.diffCount
                      }`}
                    >
                      <b>{(diffArray[0]?.total || 0) + assumptionFlagCount}</b>
                    </Typography>
                    <div
                      className={
                        pillHovered
                          ? classes.diffTextExpanded
                          : classes.diffText
                      }
                    >
                      <Typography
                        variant="body2"
                        className={classes.colorInherit}
                      >
                        {(diffArray[0]?.total || 0) > 0 && (
                          <>
                            <b>
                              {t(
                                'matterCosts.projectionCard.diffPhasesChanges',
                                { total: diffArray[0].total }
                              )}
                            </b>
                            {` ${t('matterCosts.projectionCard.impacting')} `}
                            <b>
                              {(getHoursImpact() >= 0 ? '+' : '') +
                                getHoursImpact() +
                                ' ' +
                                t('matterCosts.projectionCard.hours')}
                            </b>
                          </>
                        )}
                        {assumptionFlagCount > 0 && (
                          <b>
                            {(diffArray[0]?.total || 0) > 0 ? ' · ' : ''}
                            {t(
                              'matterCosts.projectionCard.diffAssumptionsFlagged',
                              { count: assumptionFlagCount }
                            )}
                          </b>
                        )}
                      </Typography>
                    </div>
                  </div>
                </>
              )}
          </div>
        </div>
        {projectionPeriod !== null && (isSnapshot || liveMode) && (
          <div className={classes.expandPillWrapper}>
            <div
              className={`${classes.expandPill} ${
                pillHovered ? classes.expandPillExpanded : ''
              } ${
                pillHovered
                  ? liveMode
                    ? classes.expandPillExpandedLive
                    : isSnapshot && !isRetired
                      ? classes.expandPillExpandedSnapshot
                      : isRetired
                        ? classes.expandPillExpandedRetired
                        : classes.expandPillExpandedNotStarted
                  : ''
              }`}
              onClick={() => {
                setIsExpanded(true)
                setSelectedArea(3)
              }}
            >
              <Typography
                variant="caption"
                className={`${classes.expandPillText} ${
                  pillHovered ? classes.expandPillTextVisible : ''
                }`}
              >
                {t('matterCosts.expandDetails')}
              </Typography>
              <KeyboardArrowDownIcon fontSize="small" />
            </div>
            {!isRetired && (
              <ProjectionHeaderOptionsMenu
                matterId={matterId}
                snapshotId={snapshotId}
                setPageInfo={setPageInfo}
                noDraftProjectionOpen={noDraftProjectionOpen}
                canBeRetired={canBeRetired}
                data={data}
                setShowDownloadDialog={setShowDownloadDialog}
                isViewOnly={isViewOnly}
              />
            )}
          </div>
        )}
      </div>
    )
  }

  const getPricingDivContent = () => {
    if (projection.pricingDTOList?.length > 0) {
      const isMulti = projection.pricingDTOList.length > 1
      return (
        <div className={`${classes.contentCell} ${classes.pricingOffset}`}>
          <div className={classes.contentCellIcon}>
            {isMulti ? (
              <JurCostsAddPricingIcon style={{ fontSize: '3rem' }} />
            ) : (
              React.cloneElement(
                getPricingIcon(
                  projection.pricingDTOList[0].type,
                  projection.pricingDTOList[0].cap,
                  projection.pricingDTOList[0].fullReason,
                  t
                ),
                { sx: { fontSize: '3rem' } }
              )
            )}
          </div>
          <div className={classes.contentCellText}>
            <div className={classes.pricingHeaderRow}>
              <Typography variant="h6" className={classes.marginRightAuto}>
                {isMulti
                  ? t('matterCosts.projectionCard.pricingTypes')
                  : getPricingType(
                      projection.pricingDTOList[0].type,
                      projection.pricingDTOList[0].cap,
                      projection.pricingDTOList[0].value
                    )}
              </Typography>
              {isMulti && (
                <Typography variant="h5">
                  {projection.pricingDTOList.length}
                </Typography>
              )}
            </div>
            <Divider />
            <div className={classes.pricingActionsRow}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setSelectedArea(1)
                  setCollapseData(true)
                  setIsExpanded(true)
                }}
                className={classes.seeButton}
              >
                {t('matterCosts.seeTypes')}
              </Button>
              {isMulti && (
                <Typography variant="body1" className={classes.pricingMoreText}>
                  {getPricingType(
                    projection.pricingDTOList[0].type,
                    projection.pricingDTOList[0].cap,
                    projection.pricingDTOList[0].value
                  ) +
                    ' + ' +
                    t('matterCosts.projectionCard.more', {
                      count: projection.pricingDTOList.length - 1,
                    })}
                </Typography>
              )}
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className={classes.bottomRowInnerZeroState}>
          <div className={classes.bottomRowInnerIcon}>
            <div className={classes.zeroStateIconScale}>
              <JurCoins />
            </div>
          </div>
          <div className={classes.bottomRowInnerText}>
            <Typography variant="h6" className={classes.zeroStateText}>
              {t('matterCosts.projectionCard.addPricingType')}
            </Typography>
            <Typography variant="body1" className={classes.zeroStateText}>
              {t('matterCosts.projectionCard.timeBasedAndMore')}
            </Typography>
          </div>
          <div
            className={`${classes.bottomRowInnerButton} ${classes.zeroStateAlignCenter}`}
          >
            <EditIcon />
          </div>
        </div>
      )
    }
  }

  const buildFeesContent = (label, revenue, onSeeDetails) => (
    <div className={classes.contentCell}>
      <div className={classes.contentCellIcon}>
        <JurCoins sx={{ fontSize: '3rem' }} />
      </div>
      <div className={classes.contentCellText}>
        <Typography variant="caption" className={classes.feesProjectedCaption}>
          {t('matterCosts.projectionCard.projected')}
        </Typography>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div className={classes.pricingHeaderRow}>
            <Typography variant="h6" className={classes.feesLabel}>
              {label}
            </Typography>
            <Typography variant="h5" className={classes.feesAmount}>
              {revenue}
            </Typography>
          </div>
          <Divider />
          <div className={classes.feesActionsRow}>
            <Button
              size="small"
              variant="outlined"
              onClick={e => {
                e.stopPropagation()
                onSeeDetails()
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
                  label={parseInt(projectionMargin) + '%'}
                  size="small"
                  className={classes.marginChip}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const navigateToResource = () => {
    if (
      window.dispatchEvent(new Event('leavePage', { cancelable: true })) ===
      true
    ) {
      setSelectedArea(2)
      setCollapseData(true)
      setIsCardOpen(true)
      setIsExpanded(true)
      if (liveMode) {
        window.location.href =
          window.location.href.split('/projection')[0] +
          '/projection/' +
          projection.period.id +
          '/resource?version=live'
      } else {
        window.location.href =
          window.location.href.split('/projection')[0] +
          '/projection/' +
          projection.period.id +
          '/resource'
      }
    }
  }

  const canNavigateToResource =
    (isSnapshot && !!projection) || data?.finishedPricing

  const getRevenueContent = () => {
    if (isSnapshot && projection) {
      return buildFeesContent(
        t('common.fees'),
        projection?.revenueValuesDTO?.totalRevenue
          .toFixed(0)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ','),
        navigateToResource
      )
    } else if (data.finishedPricing && data.finishedMatterResources) {
      return buildFeesContent(
        t('common.fees'),
        draftRevenueTotal?.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
        navigateToResource
      )
    } else {
      return (
        <div className={classes.bottomRowInnerZeroState}>
          <div className={classes.bottomRowInnerIcon}>
            <JurCostsNullRevenue className={classes.zeroStateIconScale} />
          </div>
          <div className={classes.bottomRowInnerText}>
            <Typography variant="h5" className={classes.zeroStateText}>
              {t('common.fees')}
            </Typography>
            <Typography variant="body1" className={classes.zeroStateText}>
              {t('matterCosts.projectionCard.feesAutomatic')}
            </Typography>
          </div>
          <div className={classes.bottomRowInnerButton}>
            <JurCostsRevenueButton className={classes.zeroStateIconScale} />
          </div>
        </div>
      )
    }
  }

  return (
    <>
      {isExpanded &&
        (fullPeriod?.id === parseInt(getProjectionIdFromLocation(location)) ||
          fullPeriod === null ||
          selectedArea === 3 ||
          selectedArea === 0) && (
          <div>
            <div className={classes.stickyHeader}>
              <ProjectionHeader
                {...props}
                matterId={matterId}
                snapshotId={snapshotId}
                isSnapshot={isSnapshot}
                isRetired={isRetired}
                fullPeriod={fullPeriod}
                data={projection}
                startDate={startDate}
                endDate={endDate}
                selectedArea={selectedArea}
                setSelectedArea={setSelectedArea}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                setCollapseData={setCollapseData}
                setIsCardOpen={setIsCardOpen}
                setSelectedPage={setSelectedPage}
                totalHours={totalHours}
                addNewProjection={false}
                disableClicks={false}
                draftRevenueTotal={draftRevenueTotal}
                profitMargin={projectionMargin.toFixed(0)}
                setPageInfo={setPageInfo}
                canBeRetired={canBeRetired}
                noDraftProjectionOpen={noDraftProjectionOpen}
                liveMode={liveMode}
                setLiveMode={setLiveMode}
                diffArray={diffArray}
                showRatesModal={showRatesModal}
                setShowRatesModal={setShowRatesModal}
                showAssumptionsModal={showAssumptionsModal}
                setShowAssumptionsModal={setShowAssumptionsModal}
                isMatterAdmin={isMatterAdmin}
                pageInfo={pageInfo}
                editRates={editRates}
                doReplace={doReplace}
                setSelectedSnapshotRates={setSelectedSnapshotRates}
                setSelectedSnapshotRtd={setSelectedSnapshotRtd}
                setSelectedSnapshotPeriods={setSelectedSnapshotPeriods}
                setSelectedSnapshotAssumptions={setSelectedSnapshotAssumptions}
                setSelectedSnapshotDate={setSelectedSnapshotDate}
                snapshotDate={projectionData?.snapshot_date}
                rates={rates}
                ratesDontMatch={ratesDontMatch}
                setShowDownloadDialog={setShowDownloadDialog}
                isViewOnly={isViewOnly}
              />
            </div>
            <ProjectionContent
              startDate={startDate}
              endDate={endDate}
              fullPeriod={fullPeriod}
              setFullPeriod={setFullPeriod}
              selectedArea={selectedArea}
              setSelectedArea={setSelectedArea}
              matterId={matterId}
              currency={currency}
              setIsExpanded={setIsExpanded}
              data={projection}
              updateData={setProjection}
              isSnapshot={isSnapshot}
              setCollapseData={setCollapseData}
              setPageInfo={setPageInfo}
              rtd={rtd}
              rates={rates}
              setTotalHours={setTotalHours}
              setIsCardOpen={setIsCardOpen}
              snapshotId={snapshotId}
              diffArray={ratesDontMatch ? [] : diffArray}
              liveMode={liveMode}
              matterTasks={matterTasks}
              setMatterTasks={setMatterTasks}
              setEndDate={setEndDate}
              setStartDate={setStartDate}
              canEditStartDate={canEditStartDate}
              setLiveMode={setLiveMode}
            />
          </div>
        )}
      {!isExpanded && !isCardOpen && (
        <>
          <div
            className={`${classes.card} ${
              liveMode
                ? classes.cardHoverLive
                : isSnapshot && !isRetired
                  ? classes.cardHoverSnapshot
                  : isRetired
                    ? classes.cardHoverRetired
                    : classes.cardHoverNotStarted
            }`}
            onMouseEnter={() => setPillHovered(true)}
            onMouseLeave={() => setPillHovered(false)}
          >
            <div
              data-test="projection-card-expand"
              onClick={() => {
                if (isSnapshot || liveMode) {
                  setIsExpanded(true)
                  setSelectedArea(3)
                }
              }}
              className={`${classes.div1} ${
                liveMode
                  ? classes.div1LiveMode
                  : isSnapshot && !isRetired
                    ? classes.div1Snapshot
                    : isRetired
                      ? classes.div1Retired
                      : classes.div1NotStarted
              }`}
            >
              {getDiv1Content()}
            </div>
            <div
              className={
                disabled
                  ? `${classes.divWrapper} ${classes.pointerEventsNone}`
                  : classes.divWrapper
              }
            >
              <div
                data-test="pricing-div"
                onClick={() => {
                  setSelectedArea(1)
                  setCollapseData(true)
                  setIsCardOpen(true)
                  setIsExpanded(true)
                  if (liveMode) {
                    window.location.href =
                      window.location.href +
                      '/projection/' +
                      projection.period.id +
                      '/pricing/?version=live'
                  } else {
                    window.location.href =
                      window.location.href +
                      '/projection/' +
                      projection.period.id +
                      '/pricing'
                  }
                }}
                className={isSnapshot ? classes.div2Snapshot : classes.div2}
              >
                {getPricingDivContent()}
              </div>
              <div
                className={`${classes.div4} ${
                  canNavigateToResource
                    ? isSnapshot
                      ? classes.div4SnapshotHover
                      : classes.div4Hover
                    : ''
                }`}
                onClick={canNavigateToResource ? navigateToResource : undefined}
              >
                {getRevenueContent()}
              </div>
            </div>
          </div>
        </>
      )}
      {showDownloadDialog && (
        <CostsExportDialog
          rates={rates}
          liveMode={liveMode}
          data={data}
          showDownloadDialog={showDownloadDialog}
          setShowDownloadDialog={setShowDownloadDialog}
        />
      )}
    </>
  )
}

export default ProjectionCardStandalone
