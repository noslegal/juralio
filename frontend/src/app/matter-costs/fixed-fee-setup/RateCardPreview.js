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

import React, { useEffect } from 'react'
import { MenuItem, Select, TextField, Typography } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import { useTranslation } from 'react-i18next'
import CalculationTypeSelector from '../matter-rates/CalculationTypeSelector'
import OrganisationIcon from '../../../assets/images/OrganisationIcon'
import { CATEGORY_COLOURS } from '../../constants'
import { applyRateModifier, currencyCode, formatRate } from './helpers'
import { rateTableCalculateDiscountPercentage } from '../resource/MatterCostsTableHelper'
import RateCardHeader from './RateCardHeader'
import useRateSourceStyles from './useRateSourceStyles'

const rateTableLabel = rt =>
  rt.client_name ||
  [rt.location, rt.work_type].filter(Boolean).join(' | ') ||
  `Rate table ${rt.id}`

const RateCardPreview = ({
  cardId,
  setCardId,
  rateTables,
  currency,
  rateModifier,
  setRateModifier,
  selectedRateRows,
}) => {
  const { classes, cx } = useRateSourceStyles()
  const { t } = useTranslation()

  const selectedCurrencyCode = currencyCode(currency)
  const availableRateTables = (rateTables || []).filter(
    rt =>
      !selectedCurrencyCode ||
      currencyCode(rt.currency) === selectedCurrencyCode
  )

  const selectedTable =
    cardId && availableRateTables.find(r => String(r.id) === String(cardId))
  const hasRateTables = availableRateTables.length > 0

  useEffect(() => {
    if (
      cardId &&
      !availableRateTables.some(r => String(r.id) === String(cardId))
    ) {
      setCardId('')
    }
  }, [cardId, availableRateTables, setCardId])

  const modType = rateModifier?.type || 0
  const modValue = rateModifier?.value || ''

  const calculationTypeEnum = {
    0: t('fixedFeeSetup.rateSource.noModifier'),
    1: t('fixedFeeSetup.rateSource.discount'),
    2: t('fixedFeeSetup.rateSource.premium'),
  }

  const sourceMiddle = (
    <div className={classes.rateCardBasedOnRow}>
      <Typography
        component="span"
        variant="inherit"
        className={classes.rateCardBasedOnLabel}
      >
        {t('matterCosts.rateTable.basedOn')}
      </Typography>
      <span
        className={cx(
          classes.rateCardSourceIcon,
          selectedTable && selectedTable.client
            ? classes.rateCardSourceIconClient
            : classes.rateCardSourceIconOrg
        )}
      >
        {selectedTable && selectedTable.client ? (
          <PeopleIcon className={classes.rateCardSourceIconInner} />
        ) : (
          <OrganisationIcon className={classes.rateCardSourceIconInner} />
        )}
      </span>
      <Typography component="span" variant="inherit">
        {selectedTable && rateTableLabel(selectedTable)}
      </Typography>
    </div>
  )

  return (
    <div className={classes.section}>
      <Typography component="div" className={classes.fieldLabel}>
        {t('fixedFeeSetup.rateSource.rateTable')}
      </Typography>
      <div className={classes.selectWrap}>
        <Select
          data-test="rate-card-select"
          className={classes.select}
          value={cardId || ''}
          displayEmpty
          onChange={e => setCardId(e.target.value)}
        >
          <MenuItem value="">
            {hasRateTables
              ? t('fixedFeeSetup.rateSource.selectRateTable')
              : selectedCurrencyCode
                ? t('fixedFeeSetup.rateSource.noRateTablesForCurrency', {
                    currency: selectedCurrencyCode,
                  })
                : t('fixedFeeSetup.rateSource.noRateTables')}
          </MenuItem>
          {availableRateTables.map(rt => (
            <MenuItem key={rt.id} value={rt.id}>
              {rateTableLabel(rt)}
            </MenuItem>
          ))}
        </Select>
      </div>
      {selectedTable && (
        <div className={classes.rateCard}>
          <RateCardHeader middleNode={sourceMiddle} currencyCode={currency} />
          <div className={classes.modifierRow}>
            <Typography component="span" className={classes.modifierLabel}>
              {t('fixedFeeSetup.rateSource.applyAt')}
            </Typography>
            <CalculationTypeSelector
              calculationTypeEnum={calculationTypeEnum}
              selectedCalculationType={modType}
              setSelectedCalculationType={next =>
                setRateModifier({
                  type: next,
                  value: next === 0 ? '' : modValue,
                })
              }
              manualValues={0}
              setManualValues={() => {}}
            />
            {modType !== 0 && (
              <>
                <Typography component="span" className={classes.modifierLabel}>
                  {t('fixedFeeSetup.rateSource.modifierOf')}
                </Typography>
                <TextField
                  size="small"
                  className={classes.modifierValueField}
                  value={modValue}
                  onChange={e =>
                    setRateModifier({
                      type: modType,
                      value: e.target.value.replace(/[^\d.]/g, ''),
                    })
                  }
                  slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                />
                <Typography component="span" className={classes.modifierSuffix}>
                  %
                </Typography>
              </>
            )}
          </div>
          <table className={classes.rateTable}>
            <thead>
              <tr className={classes.rateTableHeadRow}>
                <th className={classes.rateTableHeadCell}>
                  {t('fixedFeeSetup.rateSource.role')}
                </th>
                <th
                  className={cx(
                    classes.rateTableHeadCell,
                    classes.rateTableHeadCellRight
                  )}
                >
                  {t('fixedFeeSetup.rateSource.agreedRates')}
                </th>
                <th
                  className={cx(
                    classes.rateTableHeadCell,
                    classes.rateTableHeadCellCenter
                  )}
                >
                  %
                </th>
                <th
                  className={cx(
                    classes.rateTableHeadCell,
                    classes.rateTableHeadCellRight
                  )}
                >
                  {t('fixedFeeSetup.rateSource.referenceRate')}
                </th>
              </tr>
            </thead>
            <tbody>
              {(selectedRateRows || [])
                .filter(r => r.rate != null)
                .map((r, i) => {
                  const colour =
                    CATEGORY_COLOURS[r.colour_idx ?? 10] || CATEGORY_COLOURS[10]
                  const agreedRate = applyRateModifier(
                    r.rate,
                    modType,
                    modValue
                  )
                  const discount = rateTableCalculateDiscountPercentage(
                    agreedRate,
                    r.rate
                  )
                  return (
                    <tr key={r.id ?? i} className={classes.rateTableRow}>
                      <td className={classes.rateTableCell}>
                        <span
                          className={classes.gradeChip}
                          style={{
                            background: colour.secondary,
                            color: colour.text,
                          }}
                        >
                          {r.gradeName || r.role || '—'}
                        </span>
                      </td>
                      <td
                        className={cx(
                          classes.rateTableCell,
                          classes.rateTableCellRight
                        )}
                      >
                        {t('fixedFeeSetup.rateSource.ratePerHour', {
                          rate: formatRate(agreedRate),
                        })}
                      </td>
                      <td
                        className={cx(
                          classes.rateTableCell,
                          classes.rateTableCellCenter,
                          classes.discountCell
                        )}
                      >
                        {modType === 0 || discount === 'n/a'
                          ? '—'
                          : `${discount}%`}
                      </td>
                      <td
                        className={cx(
                          classes.rateTableCell,
                          classes.rateTableCellRight,
                          classes.targetRateCell
                        )}
                      >
                        {t('fixedFeeSetup.rateSource.ratePerHour', {
                          rate: formatRate(r.rate),
                        })}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
          <Typography component="div" className={classes.fieldHelp}>
            {t('fixedFeeSetup.rateSource.preview')}
          </Typography>
        </div>
      )}
    </div>
  )
}

export default RateCardPreview
