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

import EventIcon from '@mui/icons-material/Event'
import PaymentsIcon from '@mui/icons-material/Payments'
import React from 'react'
import dayjs from 'dayjs'
import { MenuItem, Select, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { CURRENCIES } from '../../constants'
import MatterNewProjectionPeriod from '../MatterNewProjectionPeriod'
import { currencyCode } from './helpers'

const Step1 = ({
  classes,
  state,
  setState,
  hasPreviousProjection,
  minStart,
  defaultCurrency,
  rateTables,
  readOnly = false,
  canEditEnd = true,
}) => {
  const { t } = useTranslation()
  const currencyUnchanged =
    defaultCurrency != null &&
    currencyCode(state.currency) === currencyCode(defaultCurrency)
  const selectedCode = currencyCode(state.currency)
  const rateTablesUsingCurrency = selectedCode
    ? (rateTables || []).filter(
        rt => currencyCode(rt.currency) === selectedCode
      ).length
    : 0
  return (
    <div className={classes.stepPane}>
      <Typography
        component="div"
        className={`${classes.stepSectionTitle} ${classes.stepSectionTitleFirst}`}
      >
        {t('fixedFeeSetup.step1.projectionPeriod')}
      </Typography>
      <div className={classes.card}>
        <div className={classes.cardDesc}>
          <EventIcon className={classes.cardIcon} />
          <Typography component="span" variant="inherit">
            {t('fixedFeeSetup.step1.projectionPeriodHelp')}
          </Typography>
        </div>
        <MatterNewProjectionPeriod
          startDate={state.start}
          setStartDate={v => {
            const next = { ...state, start: v }
            if (
              state.end &&
              (dayjs(state.end).diff(dayjs(v), 'month') > 11 ||
                dayjs(v).isAfter(dayjs(state.end)))
            ) {
              next.end = dayjs(v)
                .add(11, 'month')
                .endOf('month')
                .endOf('day')
                .toDate()
            }
            setState(next)
          }}
          endDate={dayjs(state.end).toDate()}
          setEndDate={v => setState({ ...state, end: v })}
          canSetStartDate={false}
          disableStart={readOnly || hasPreviousProjection}
          disableEnd={readOnly && !canEditEnd}
          fullPeriod={{ startDate: state.start, endDate: state.end }}
          hasPreviousProjection={hasPreviousProjection}
          minStartDate={minStart}
        />
      </div>

      <Typography component="div" className={classes.stepSectionTitle}>
        {t('fixedFeeSetup.step1.currency')}
      </Typography>
      <div className={classes.card}>
        <div className={classes.cardDesc}>
          <PaymentsIcon className={classes.cardIcon} />
          <Typography component="span" variant="inherit">
            {t('fixedFeeSetup.step1.currencyHelp')}
          </Typography>
        </div>
        <div className={classes.currencyField}>
          <Typography component="div" className={classes.fieldTitle}>
            {t('fixedFeeSetup.step1.currency')}
            <span className={classes.required}>*</span>
          </Typography>
          <Select
            data-test="fixed-fee-currency"
            value={state.currency}
            onChange={e => setState({ ...state, currency: e.target.value })}
            fullWidth
            disabled={readOnly || hasPreviousProjection}
          >
            {CURRENCIES.map(c => (
              <MenuItem key={c.name} value={c.name}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
          <Typography component="div" className={classes.fieldHelp}>
            {state.currency &&
              ' ' +
                t('fixedFeeSetup.step1.rateTablesUseThisCurrency', {
                  count: rateTablesUsingCurrency,
                  s: rateTablesUsingCurrency === 1 ? '' : 's',
                })}
          </Typography>
          {hasPreviousProjection && currencyUnchanged && (
            <Typography component="div" className={classes.prefilledHint}>
              {t('fixedFeeSetup.step1.currencyBasedOnPrevious')}
            </Typography>
          )}
        </div>
      </div>
    </div>
  )
}

export default Step1
