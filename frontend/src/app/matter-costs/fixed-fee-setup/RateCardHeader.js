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
import { Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { MattersIcon } from '../../../theme/navigation/CommonIcons'
import useRateSourceStyles from './useRateSourceStyles'

const RateCardHeader = ({ middleNode, currencyCode }) => {
  const { classes } = useRateSourceStyles()
  const { t } = useTranslation()

  return (
    <div className={classes.rateCardHeader}>
      <div className={classes.rateCardHeaderBandLeft}>
        <MattersIcon className={classes.rateCardHeaderBandIcon} />
        <Typography
          component="span"
          className={classes.rateCardHeaderBandLabel}
        >
          {t('fixedFeeSetup.rateSource.agreedRates')}
        </Typography>
      </div>
      <div className={classes.rateCardHeaderMiddle}>{middleNode}</div>
      <div className={classes.rateCardCurrencyCell}>
        <Typography component="span" className={classes.rateCardCurrencyCode}>
          {(currencyCode || '').substr(0, 3)}
        </Typography>
        {currencyCode && currencyCode.length > 5 && (
          <Typography component="span" className={classes.rateCardCurrencyName}>
            {currencyCode.substr(5, 100)}
          </Typography>
        )}
      </div>
      <div className={classes.rateCardHeaderBandRight} />
    </div>
  )
}

export default RateCardHeader
