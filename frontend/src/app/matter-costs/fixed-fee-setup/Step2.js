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

import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import PaymentsIcon from '@mui/icons-material/Payments'
import React from 'react'
import { InputBase, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import OutOfScope from './OutOfScope'
import PostApprovalPricing from './PostApprovalPricing'
import RateSourcePicker from './RateSourcePicker'
import { currencyCode, fmtMonthShort } from './helpers'

const Step2 = ({
  classes,
  state,
  setState,
  rateTables,
  orgGrades,
  selectedRateRows,
  hasPreviousProjection,
  defaultOutOfScope,
}) => {
  const { t } = useTranslation()
  const setS = patch => setState({ ...state, ...patch })
  const approval = state.outOfScope?.approval
  const post = state.outOfScope?.postApproval
  const outOfScopeUnchanged =
    defaultOutOfScope != null &&
    approval === defaultOutOfScope.approval &&
    post === defaultOutOfScope.postApproval

  const showRatesSection = approval === 'yes' || approval === 'no'

  let ratesSub = t('fixedFeeSetup.step2.hourlyRatesDefault')
  let ratesWarn = false
  if (approval === 'no') {
    ratesSub = t('fixedFeeSetup.step2.hourlyRatesNoApproval')
    ratesWarn = true
  } else if (approval === 'yes' && post === 'rates') {
    ratesSub = t('fixedFeeSetup.step2.hourlyRatesDefaultRates')
    ratesWarn = true
  }

  return (
    <div className={classes.stepPane}>
      <Typography
        component="div"
        className={`${classes.stepSectionTitle} ${classes.stepSectionTitleFirst}`}
      >
        {t('fixedFeeSetup.step2.totalFixedFee')}
      </Typography>
      <div className={classes.card}>
        <div className={classes.cardDesc}>
          <PaymentsIcon className={classes.cardIcon} />
          <Typography component="span" variant="inherit">
            {t('fixedFeeSetup.step2.totalFixedFeeHelp')}
          </Typography>
        </div>
        <div className={classes.amountWrapper}>
          <Typography component="div" className={classes.fieldLabel}>
            {t('fixedFeeSetup.step2.amount')}
            <span className={classes.required}>*</span>
          </Typography>
          <Typography component="span" className={classes.amountPrefix}>
            {currencyCode(state.currency)}
          </Typography>
          <InputBase
            className={classes.amountInputRoot}
            classes={{ input: classes.amountInputInput }}
            inputProps={{
              inputMode: 'decimal',
              'data-test': 'fixed-fee-amount',
            }}
            value={state.amount || ''}
            onChange={e =>
              setS({ amount: e.target.value.replace(/[^\d.]/g, '') })
            }
          />
          <Typography component="div" className={classes.fieldHelp}>
            {t('fixedFeeSetup.step2.scopeHint', {
              start: fmtMonthShort(state.start),
              end: fmtMonthShort(state.end),
            })}
          </Typography>
        </div>
      </div>

      <Typography component="div" className={classes.stepSectionTitle}>
        {t('fixedFeeSetup.step2.outOfScope')}
      </Typography>
      <div className={classes.card}>
        <div className={classes.cardDesc}>
          <CompareArrowsIcon className={classes.cardIcon} />
          <Typography component="span" variant="inherit">
            {t('fixedFeeSetup.step2.outOfScopeHelp')}
          </Typography>
        </div>
        {hasPreviousProjection && outOfScopeUnchanged && (
          <Typography component="div" className={classes.prefilledHint}>
            {t('fixedFeeSetup.step2.outOfScopeBasedOnPrevious')}
          </Typography>
        )}
        <OutOfScope
          value={state.outOfScope}
          onChange={v => setS({ outOfScope: v })}
        />
        {approval === 'yes' && (
          <>
            <div className={classes.postApprovalHeader}>
              <Typography component="div" className={classes.postApprovalTitle}>
                {t('fixedFeeSetup.step2.postApprovalTitle')}
                <sup className={classes.postApprovalRequiredMark}>*</sup>
              </Typography>
              <Typography
                component="div"
                className={classes.postApprovalSubtitle}
              >
                {t('fixedFeeSetup.step2.postApprovalSubtitle')}
              </Typography>
            </div>
            <div className={classes.postApprovalBody}>
              <PostApprovalPricing
                value={state.outOfScope}
                onChange={v => setS({ outOfScope: v })}
              />
            </div>
          </>
        )}
        {showRatesSection && (
          <>
            <div className={classes.postApprovalHeader}>
              <Typography component="div" className={classes.postApprovalTitle}>
                {t('fixedFeeSetup.step2.hourlyRatesTitle')}
              </Typography>
              <Typography
                component="div"
                className={
                  ratesWarn
                    ? `${classes.postApprovalSubtitle} ${classes.postApprovalSubtitleWarn}`
                    : classes.postApprovalSubtitle
                }
              >
                {ratesSub}
              </Typography>
            </div>
            <div className={classes.postApprovalBody}>
              <RateSourcePicker
                source={state.rateSource || 'card'}
                setSource={s => setS({ rateSource: s })}
                cardId={state.rateCardId || ''}
                setCardId={id => setS({ rateCardId: id })}
                rates={state.rates}
                setRates={r => setS({ rates: r })}
                rateModifier={state.rateModifier || { type: 0, value: '' }}
                setRateModifier={m => setS({ rateModifier: m })}
                currency={state.currency}
                rateTables={rateTables}
                orgGrades={orgGrades}
                selectedRateRows={selectedRateRows}
                hideSourceOptions={hasPreviousProjection}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Step2
