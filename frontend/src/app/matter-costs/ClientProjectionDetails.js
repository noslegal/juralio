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
import { Button, Grow, Typography } from '@mui/material'
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import JurDeliverable from '../../assets/images/JurDeliverable'
import OutOfScopeRatesCard from './fixed-fee-setup/OutOfScopeRatesCard'
import { daysInRangeFromTask } from './fixed-fee-setup/helpers'
import useClientProjectionCardStyles from './useClientProjectionCardStyles'

const formatTaskMonth = value => {
  if (value == null) return ''
  const v = typeof value === 'string' ? value.replace('Z', '') : value
  const d = dayjs(v)
  return d.isValid() ? d.format('MMM YYYY') : ''
}

const formatReason = (reason, t) => {
  if (!reason) return ''
  if (reason === 'agreed') {
    return t(
      'fixedFeeSetup.postApproval.agreed',
      'Fee must be expressly agreed'
    )
  }
  if (reason === 'rates') {
    return t('fixedFeeSetup.postApproval.rates', 'Default to hourly rates')
  }
  return reason
}

const ClientProjectionDetails = ({
  expanded,
  snapshot,
  resolvedCurrency,
  rateRows,
  showScopeDetails,
  setShowScopeDetails,
  showLiveNotice = false,
}) => {
  const { classes } = useClientProjectionCardStyles()
  const { t } = useTranslation()

  const daysLabel = count =>
    count === 1 ? t('fixedFeeSetup.step3.day') : t('fixedFeeSetup.step3.days')

  return (
    <Grow in={expanded} style={{ transformOrigin: '0 0 0' }}>
      <div className={classes.expandedSection}>
        {snapshot && (
          <div className={classes.detailPanel}>
            {showLiveNotice && (
              <Typography component="div" className={classes.liveScopeNotice}>
                {t(
                  'matterCosts.projectionCard.liveScopeNotice',
                  'Live mode displays the scope that currently falls within this period. To align scope with fees, edit the live projection'
                )}
              </Typography>
            )}
            <div className={classes.scopeHeader}>
              <div className={classes.scopeHeaderLeft}>
                <LayersOutlinedIcon className={classes.scopeHeaderIcon} />
                <Typography
                  variant="body1"
                  className={classes.scopeHeaderTitle}
                >
                  {t('matterCosts.projectionCard.agreedScope', 'Agreed scope')}
                </Typography>
                <Typography
                  variant="body1"
                  className={classes.scopeHeaderCount}
                >
                  {t(
                    'matterCosts.projectionCard.phasesCount',
                    '{{count}} phases',
                    { count: snapshot.costTimeEstimateList?.length || 0 }
                  )}
                </Typography>
              </div>
              <Button
                variant="outlined"
                size="small"
                className={classes.hideDetailsButton}
                endIcon={
                  showScopeDetails ? (
                    <KeyboardArrowUpIcon />
                  ) : (
                    <KeyboardArrowDownIcon />
                  )
                }
                onClick={() => setShowScopeDetails(v => !v)}
              >
                {showScopeDetails
                  ? t('matterCosts.hideDetails', 'Hide details')
                  : t('matterCosts.seeDetails', 'See details')}
              </Button>
            </div>
            {(snapshot.costTimeEstimateList || []).map(cte => {
              const phaseAssumptions = (snapshot.assumptionList || []).filter(
                a => (a.task?.id ?? a.taskId) === cte.task?.id
              )
              const deliverables = cte.task?.deliverables || []
              const start = cte.task?.startDate
              const end = cte.task?.endDate
              const days = daysInRangeFromTask(
                cte.task,
                snapshot.period?.startDate,
                snapshot.period?.endDate
              )
              const hasLists =
                phaseAssumptions.length > 0 || deliverables.length > 0
              return (
                <div
                  key={cte.id ?? cte.task?.id}
                  className={classes.phaseBlock}
                >
                  <div className={classes.phaseHead}>
                    <div className={classes.phaseHeadCol}>
                      <Typography
                        variant="body1"
                        className={classes.phaseTitle}
                      >
                        {cte.task?.name}
                      </Typography>
                      <Typography variant="body2" className={classes.phaseMeta}>
                        {t('fixedFeeSetup.step4.deliverableMeta', {
                          count: deliverables.length,
                          label: t(
                            deliverables.length === 1
                              ? 'fixedFeeSetup.step4.deliverableSingular'
                              : 'fixedFeeSetup.step4.deliverablePlural'
                          ),
                          assumptions: phaseAssumptions.length,
                          aLabel: t(
                            phaseAssumptions.length === 1
                              ? 'fixedFeeSetup.step4.assumptionSingular'
                              : 'fixedFeeSetup.step4.assumptionPlural'
                          ),
                        })}
                      </Typography>
                    </div>
                    <div
                      className={`${classes.phaseHeadCol} ${classes.phaseHeadColRight}`}
                    >
                      <Typography variant="body1">
                        {`${formatTaskMonth(start)} → ${formatTaskMonth(end)}`}
                      </Typography>
                      <Typography variant="body2" className={classes.phaseMeta}>
                        {`${days} ${daysLabel(days)}`}
                      </Typography>
                    </div>
                  </div>
                  {showScopeDetails && hasLists && (
                    <div className={classes.phaseListsRow}>
                      <div className={classes.phaseList}>
                        <div className={classes.phaseListHead}>
                          <ExtensionOutlinedIcon fontSize="small" />
                          <Typography variant="body2">
                            {t(
                              'fixedFeeSetup.step3.assumptions',
                              'Assumptions'
                            )}
                          </Typography>
                        </div>
                        <ul className={classes.phaseListItems}>
                          {phaseAssumptions.map(a => (
                            <li key={a.id}>
                              <Typography>
                                {a.summary || a.assumption}
                              </Typography>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className={classes.phaseList}>
                        <div className={classes.phaseListHead}>
                          <JurDeliverable
                            fontSize="small"
                            className={classes.deliverableIcon}
                          />
                          <Typography variant="body2">
                            {t(
                              'fixedFeeSetup.step3.deliverables',
                              'Deliverables'
                            )}
                          </Typography>
                        </div>
                        <ul className={classes.phaseListItems}>
                          {deliverables.map(d => (
                            <li key={d.id}>
                              <Typography>{d.name}</Typography>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        {snapshot?.outOfScopeDetails && (
          <div className={classes.detailPanel}>
            <Typography variant="body1" className={classes.oosTitle}>
              {t('fixedFeeSetup.step4.outOfScope', 'Out-of-scope work')}
            </Typography>
            <div className={classes.kvRow}>
              <Typography className={classes.kvKey}>
                {t(
                  'fixedFeeSetup.step4.writtenApprovalRequired',
                  'Written approval required'
                )}
              </Typography>
              <Typography className={classes.kvVal}>
                {snapshot.outOfScopeDetails.writtenApprovalNeeded
                  ? t('fixedFeeSetup.step4.yes', 'Yes')
                  : t('fixedFeeSetup.step4.no', 'No')}
              </Typography>
            </div>
            {snapshot.outOfScopeDetails.reason && (
              <div className={classes.kvRow}>
                <Typography className={classes.kvKey}>
                  {t(
                    'fixedFeeSetup.step4.postApprovalPricing',
                    'Post-approval pricing'
                  )}
                </Typography>
                <Typography className={classes.kvVal}>
                  {formatReason(snapshot.outOfScopeDetails.reason, t)}
                </Typography>
              </div>
            )}
          </div>
        )}
        {snapshot?.outOfScopeDetails && (
          <div className={classes.detailPanel}>
            <Typography variant="body1" className={classes.oosTitle}>
              {t('fixedFeeSetup.step4.hourlyRates', 'Hourly rates')}
            </Typography>
            {rateRows.length > 0 ? (
              <OutOfScopeRatesCard
                currency={resolvedCurrency}
                rows={rateRows}
              />
            ) : (
              <Typography className={classes.kvVal}>
                {t(
                  'fixedFeeSetup.step4.noRatesChosen',
                  'No rates have been chosen'
                )}
              </Typography>
            )}
          </div>
        )}
      </div>
    </Grow>
  )
}

export default ClientProjectionDetails
