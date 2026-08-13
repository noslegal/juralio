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

import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import PeopleIcon from '@mui/icons-material/People'
import React, { useState } from 'react'
import { Collapse, Paper, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import OrganisationIcon from '../../../assets/images/OrganisationIcon'
import { MattersIcon } from '../../../theme/navigation/CommonIcons'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'
import { CATEGORY_COLOURS } from '../../constants'
import { formatRate } from './helpers'

const useStyles = makeStyles()(() => ({
  card: {
    marginTop: 8,
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: 20,
    background: rawColours.primary.white.primary,
    overflow: 'hidden',
    fontFamily:
      'Montserrat, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'grid',
    gridTemplateColumns: '20% 50% 20% 10%',
    cursor: 'pointer',
  },
  headerOpen: {
    borderBottom: `4px solid ${rawColours.primary.black[100]}`,
  },
  bandLeft: {
    background: rawColours.primary.primary.main,
    opacity: 0.85,
    color: rawColours.primary.white.primary,
    padding: '14px 12px',
    borderTopLeftRadius: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bandIcon: {
    color: rawColours.primary.white.primary,
    fontSize: 22,
  },
  bandLabel: {
    color: rawColours.primary.white.primary,
    fontSize: 12,
    textAlign: 'center',
  },
  middle: {
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
  },
  basedOnRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12.5,
    color: rawColours.primary.black[100],
  },
  basedOnLabel: {
    color: rawColours.primary.black.black,
    fontWeight: 500,
  },
  sourceIcon: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceIconClient: {
    background: 'rgb(78, 91, 166)',
    color: 'white',
  },
  sourceIconOrg: {
    background: juralioColours.rateTableCards.orgNotRetired,
  },
  sourceIconInner: {
    transform: 'scale(0.7)',
    color: 'white',
  },
  currencyCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 8px',
    borderLeft: '1px solid rgba(0, 0, 0, 0.06)',
    borderRight: '1px solid rgba(0, 0, 0, 0.06)',
  },
  currencyCode: {
    fontWeight: 600,
    fontSize: 18,
    color: rawColours.primary.black.black,
  },
  bandRight: {
    background: rawColours.primary.primary.main,
    opacity: 0.85,
    borderTopRightRadius: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: rawColours.primary.white.primary,
  },
  bandRightCollapsed: {
    borderBottomRightRadius: 20,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  headRow: {
    background: rawColours.primary.grey[200],
  },
  headCell: {
    padding: '10px 14px',
    font: '500 11px Montserrat',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: rawColours.primary.black[100],
    textAlign: 'left',
  },
  headCellRight: {
    textAlign: 'right',
  },
  headCellCenter: {
    textAlign: 'center',
  },
  bodyRow: {
    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
  },
  bodyCell: {
    padding: '10px 14px',
    verticalAlign: 'middle',
  },
  bodyCellRight: {
    textAlign: 'right',
  },
  bodyCellCenter: {
    textAlign: 'center',
    fontSize: 12,
    color: rawColours.primary.black[100],
  },
  referenceCell: {
    color: rawColours.primary.black[100],
    fontSize: 12.5,
    textAlign: 'right',
  },
  gradeChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.4,
  },
  footer: {
    padding: '10px 16px 16px',
    fontSize: 12,
    color: rawColours.primary.black[100],
  },
}))

const OutOfScopeRatesCard = ({
  currency,
  basedOn = null,
  customLabel = null,
  rows = [],
  showReferenceColumn = false,
  footerText = null,
  defaultCollapsed = true,
}) => {
  const { classes, cx } = useStyles()
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <Paper elevation={0} className={classes.card}>
      <div
        onClick={() => setCollapsed(c => !c)}
        className={cx(classes.header, !collapsed && classes.headerOpen)}
      >
        <div className={classes.bandLeft}>
          <MattersIcon className={classes.bandIcon} />
          <Typography component="span" className={classes.bandLabel}>
            {t('fixedFeeSetup.rateSource.agreedRates')}
          </Typography>
        </div>
        <div className={classes.middle}>
          {basedOn ? (
            <div className={classes.basedOnRow}>
              <Typography
                component="span"
                variant="inherit"
                className={classes.basedOnLabel}
              >
                {t('matterCosts.rateTable.basedOn')}
              </Typography>
              <span
                className={cx(
                  classes.sourceIcon,
                  basedOn.isClient
                    ? classes.sourceIconClient
                    : classes.sourceIconOrg
                )}
              >
                {basedOn.isClient ? (
                  <PeopleIcon className={classes.sourceIconInner} />
                ) : (
                  <OrganisationIcon className={classes.sourceIconInner} />
                )}
              </span>
              <Typography component="span" variant="inherit">
                {basedOn.label}
              </Typography>
            </div>
          ) : (
            <div className={classes.basedOnRow}>
              <Typography
                component="span"
                variant="inherit"
                className={classes.basedOnLabel}
              >
                {customLabel || t('fixedFeeSetup.rateSource.customRates')}
              </Typography>
            </div>
          )}
        </div>
        <div className={classes.currencyCell}>
          <Typography component="span" className={classes.currencyCode}>
            {(currency || '').substr(0, 3)}
          </Typography>
        </div>
        <div
          className={cx(
            classes.bandRight,
            collapsed && classes.bandRightCollapsed
          )}
        >
          {collapsed ? <ExpandMore /> : <ExpandLess />}
        </div>
      </div>
      <Collapse in={!collapsed} timeout="auto" unmountOnExit>
        <table className={classes.table}>
          <thead>
            <tr className={classes.headRow}>
              <th className={classes.headCell}>
                {t('fixedFeeSetup.rateSource.role')}
              </th>
              <th className={cx(classes.headCell, classes.headCellRight)}>
                {t('fixedFeeSetup.rateSource.agreedRates')}
              </th>
              {showReferenceColumn && (
                <>
                  <th className={cx(classes.headCell, classes.headCellCenter)}>
                    %
                  </th>
                  <th className={cx(classes.headCell, classes.headCellRight)}>
                    {t('fixedFeeSetup.rateSource.referenceRate')}
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const colour =
                CATEGORY_COLOURS[r.colour_idx ?? 10] || CATEGORY_COLOURS[10]
              return (
                <tr key={r.id ?? i} className={classes.bodyRow}>
                  <td className={classes.bodyCell}>
                    <span
                      className={classes.gradeChip}
                      style={{
                        background: colour.secondary,
                        color: colour.text,
                      }}
                    >
                      {r.gradeName || '—'}
                    </span>
                  </td>
                  <td className={cx(classes.bodyCell, classes.bodyCellRight)}>
                    {t('fixedFeeSetup.rateSource.ratePerHour', {
                      rate: formatRate(r.agreedRate),
                    })}
                  </td>
                  {showReferenceColumn && (
                    <>
                      <td
                        className={cx(classes.bodyCell, classes.bodyCellCenter)}
                      >
                        {r.discountPct == null ? '—' : `${r.discountPct}%`}
                      </td>
                      <td
                        className={cx(classes.bodyCell, classes.referenceCell)}
                      >
                        {t('fixedFeeSetup.rateSource.ratePerHour', {
                          rate: formatRate(r.referenceRate),
                        })}
                      </td>
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
        {footerText && (
          <Typography component="div" className={classes.footer}>
            {footerText}
          </Typography>
        )}
      </Collapse>
    </Paper>
  )
}

export default OutOfScopeRatesCard
