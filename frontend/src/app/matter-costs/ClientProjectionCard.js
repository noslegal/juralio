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
import { FormGroup, Switch, Tooltip, Typography } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import JurCoins from '../../assets/images/JurCoins'
import juralioColours from '../../theme/juralio-colours'
import { setMatterProjections } from '../../redux/ducks/matter-costs'
import ClientCostsExportDialog from './ClientCostsExportDialog'
import ClientProjectionDetails from './ClientProjectionDetails'
import ProjectionHeaderOptionsMenu from './outcomes/ProjectionHeaderOptionsMenu'
import ProjectionStatusChip from './outcomes/ProjectionStatusChip'
import { getPricingIcon } from './outcomes/pricingCardHelper'
import useClientProjectionCardStyles from './useClientProjectionCardStyles'

const formatPeriodParts = period => {
  if (!period?.startDate || !period?.endDate) {
    return { startYear: '', endYear: '', startMonth: '', endMonth: '' }
  }
  const start = dayjs(period.startDate)
  const end = dayjs(period.endDate)
  return {
    startYear: start.format('YYYY'),
    endYear: end.format('YYYY'),
    startMonth: start.format('MMM'),
    endMonth: end.format('MMM'),
  }
}

const formatAmount = value => {
  if (value == null) return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

const ClientProjectionCard = ({
  projection,
  currency,
  matterId,
  onResumeProjection,
  setPageInfo,
  totalPhases,
  activePhasesOverride,
  forceExpanded = false,
  readOnly = false,
  isViewOnly = false,
  canBeRetired = false,
  onRetired,
}) => {
  const { classes } = useClientProjectionCardStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const dashboardProjections = useSelector(
    state => state.matterCosts.projections
  )
  const [pillHovered, setPillHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showScopeDetails, setShowScopeDetails] = useState(false)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [liveMode, setLiveMode] = useState(false)

  const snapshot = projection?.snapshot
    ? typeof projection.snapshot === 'string'
      ? JSON.parse(projection.snapshot)
      : projection.snapshot
    : null
  const liveSnapshot = projection?.liveSnapshot
    ? typeof projection.liveSnapshot === 'string'
      ? JSON.parse(projection.liveSnapshot)
      : projection.liveSnapshot
    : null
  const isSnapshot = !!snapshot
  const isRetired = !!projection?.isRetired
  // In live mode the card renders the live snapshot (current scope) rather than
  // the finalised snapshot.
  const displayData = liveMode && liveSnapshot ? liveSnapshot : snapshot
  const ratesDontMatch =
    !!snapshot &&
    !!liveSnapshot &&
    snapshot?.rtd?.rateTableDetails?.id !==
      liveSnapshot?.rtd?.rateTableDetails?.id
  const period = displayData?.period || projection?.period
  const pricingList =
    displayData?.pricingDTOList ||
    (projection?.pricing ? [projection.pricing] : [])
  const pricing = pricingList[0] || null
  const resolvedCurrency =
    currency || displayData?.rtd?.rateTableDetails?.currency || ''

  const totalRevenue =
    displayData?.revenueValuesDTO?.totalRevenue != null
      ? displayData.revenueValuesDTO.totalRevenue
      : (pricing?.value ?? null)

  const rateRows = (() => {
    const list = displayData?.matterRatesList || []
    const byGrade = new Map()
    list.forEach(r => {
      if (r.gradeId == null) return
      if (r.rateValue == null) return
      if (byGrade.has(r.gradeId)) return
      byGrade.set(r.gradeId, {
        id: r.rateId ?? r.gradeId,
        gradeId: r.gradeId,
        gradeName: r.gradeName,
        colour_idx: r.colour_idx,
        agreedRate: r.rateValue,
      })
    })
    // Order by grade, matching the edit flow / rate table ordering.
    return Array.from(byGrade.values()).sort((a, b) => a.gradeId - b.gradeId)
  })()

  const activePhases =
    activePhasesOverride != null
      ? activePhasesOverride
      : (pricing?.taskList?.length ??
        displayData?.costTimeEstimateList?.length ??
        (projection?.hasCostTimeEstimates ? null : 0))

  const showFixedFee = !!pricing || (!isSnapshot && activePhases != null)

  const { startYear, endYear, startMonth, endMonth } = formatPeriodParts(period)
  const dateRangeIsSingle =
    startMonth && endMonth && startMonth === endMonth && startYear === endYear

  const div1AccentClass = isRetired
    ? classes.div1Retired
    : isSnapshot && liveMode
      ? classes.div1Live
      : isSnapshot
        ? classes.div1Snapshot
        : classes.div1NotStarted

  const expandPillAccentClass = pillHovered
    ? isRetired
      ? classes.expandPillExpandedRetired
      : isSnapshot && liveMode
        ? classes.expandPillExpandedLive
        : isSnapshot
          ? classes.expandPillExpandedSnapshot
          : classes.expandPillExpandedNotStarted
    : ''

  return (
    <div
      className={`${classes.card} ${
        isRetired
          ? classes.cardHoverRetired
          : isSnapshot && liveMode
            ? classes.cardHoverLive
            : isSnapshot
              ? classes.cardHoverSnapshot
              : classes.cardHoverNotStarted
      }`}
      onMouseEnter={() => setPillHovered(true)}
      onMouseLeave={() => setPillHovered(false)}
    >
      <div className={`${classes.div1} ${div1AccentClass}`}>
        <div className={classes.div1Inner}>
          <div className={classes.iconWrapper}>
            <div className={classes.div1Inner}>
              <div className={classes.periodBlock}>
                {dateRangeIsSingle ? (
                  <Typography
                    className={classes.dateTypographySingle}
                    variant="h5"
                  >
                    {`${startYear} ${startMonth}`}
                  </Typography>
                ) : (
                  <Typography
                    className={classes.dateTypographyRange}
                    variant="h5"
                  >
                    {`${startYear} ${startMonth} - ${endYear} ${endMonth}`}
                  </Typography>
                )}
              </div>
              <div className={classes.statusChipContainer}>
                <ProjectionStatusChip
                  isSnapshot={isSnapshot}
                  isRetired={isRetired}
                  liveMode={liveMode}
                />
                {isSnapshot && !isRetired && !readOnly && (
                  <FormGroup className={classes.liveToggleGroup}>
                    <Tooltip
                      title={
                        ratesDontMatch
                          ? t('matterCosts.projectionCard.liveDisabledTooltip')
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
                            const next = !liveMode
                            const target = dashboardProjections.find(
                              p => p?.id === period?.id
                            )
                            if (target) {
                              target.live = next
                              dispatch(
                                setMatterProjections(dashboardProjections)
                              )
                            }
                            setLiveMode(next)
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
                  {t('matterCosts.projectionCard.currency', 'Currency')}
                  {' : '}
                  {resolvedCurrency.substring(0, 3)}
                </b>
              </Typography>
            </div>
          </div>
          {period && (
            <div className={classes.expandPillWrapper}>
              {(!forceExpanded || (isSnapshot && liveMode)) && (
                <div
                  data-test="projection-expand-pill"
                  className={`${classes.expandPill} ${
                    pillHovered ? classes.expandPillExpanded : ''
                  } ${expandPillAccentClass}`}
                  onClick={e => {
                    e.stopPropagation()
                    if (isSnapshot && liveMode) {
                      if (onResumeProjection)
                        onResumeProjection(period?.id, true)
                    } else if (!isSnapshot) {
                      if (onResumeProjection) onResumeProjection(period?.id)
                    } else {
                      setIsExpanded(v => !v)
                    }
                  }}
                >
                  <Typography
                    variant="caption"
                    className={`${classes.expandPillText} ${
                      pillHovered ? classes.expandPillTextVisible : ''
                    }`}
                  >
                    {isSnapshot && liveMode
                      ? t(
                          'matterCosts.projectionCard.editProjection',
                          'Edit projection'
                        )
                      : !isSnapshot
                        ? t(
                            'matterCosts.continueProjection',
                            'Continue projection'
                          )
                        : isExpanded
                          ? t('matterCosts.hideDetails', 'Hide details')
                          : t('matterCosts.expandDetails', 'Expand details')}
                  </Typography>
                  {isSnapshot && !liveMode && isExpanded ? (
                    <KeyboardArrowUpIcon fontSize="small" />
                  ) : (
                    <KeyboardArrowDownIcon fontSize="small" />
                  )}
                </div>
              )}
              {!isRetired && (!readOnly || isSnapshot) && (
                <ProjectionHeaderOptionsMenu
                  matterId={matterId}
                  snapshotId={projection?.snapshotId}
                  setPageInfo={setPageInfo || (() => {})}
                  noDraftProjectionOpen={isSnapshot}
                  canBeRetired={canBeRetired}
                  data={projection}
                  setShowDownloadDialog={setShowDownloadDialog}
                  isViewOnly={isViewOnly}
                  isSnapshot={isSnapshot}
                  onRetired={onRetired}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <div className={classes.divWrapper}>
        <div className={classes.segment}>
          {showFixedFee ? (
            <div className={`${classes.contentCell} ${classes.pricingOffset}`}>
              <div className={classes.contentCellIcon}>
                {React.cloneElement(
                  getPricingIcon(
                    pricing?.type ?? 1,
                    pricing?.cap,
                    pricing?.fullReason,
                    t
                  ),
                  { sx: { fontSize: '3rem' } }
                )}
              </div>
              <div className={classes.contentCellText}>
                <div className={classes.pricingHeaderRow}>
                  <div className={classes.pricingTitleBlock}>
                    <Typography variant="h6" component="span">
                      {t('matterCosts.projectionCard.fixedFee', 'Fixed Fee')}
                    </Typography>
                    {activePhases != null && (
                      <Typography
                        variant="body2"
                        component="span"
                        className={classes.pricingSubtext}
                      >
                        {totalPhases != null
                          ? t(
                              'matterCosts.projectionCard.acrossPhases',
                              'across {{active}} of {{total}} phases',
                              { active: activePhases, total: totalPhases }
                            )
                          : t(
                              'matterCosts.projectionCard.acrossPhasesShort',
                              'across {{active}} phases',
                              { active: activePhases }
                            )}
                      </Typography>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div className={classes.segment}>
          <div className={classes.contentCell}>
            <div className={classes.contentCellIcon}>
              <JurCoins sx={{ fontSize: '3rem' }} />
            </div>
            <div className={classes.contentCellText}>
              <Typography
                variant="caption"
                className={classes.feesProjectedCaption}
              >
                {t('matterCosts.projectionCard.projected', 'Projected')}
              </Typography>
              <div className={classes.pricingHeaderRow}>
                <Typography variant="h6" className={classes.feesLabel}>
                  {t('matterCosts.projectionCard.fees', 'Fees')}
                </Typography>
                <Typography
                  variant="h5"
                  className={classes.feesAmount}
                  data-test="projected-fees-amount"
                >
                  {`${resolvedCurrency.substring(0, 3)} ${formatAmount(
                    totalRevenue
                  )}`}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
      {(isExpanded || forceExpanded) && (
        <ClientProjectionDetails
          expanded={isExpanded || forceExpanded}
          snapshot={displayData}
          resolvedCurrency={resolvedCurrency}
          rateRows={rateRows}
          showScopeDetails={showScopeDetails}
          setShowScopeDetails={setShowScopeDetails}
          showLiveNotice={liveMode && !!liveSnapshot}
        />
      )}
      {showDownloadDialog && (
        <ClientCostsExportDialog
          showDownloadDialog={showDownloadDialog}
          setShowDownloadDialog={setShowDownloadDialog}
          snapshot={snapshot}
          currency={resolvedCurrency}
        />
      )}
    </div>
  )
}

export default ClientProjectionCard
