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
import ManualRateTable from './ManualRateTable'
import RateCardPreview from './RateCardPreview'
import useRateSourceStyles from './useRateSourceStyles'

const RateSourcePicker = ({
  source,
  setSource,
  cardId,
  setCardId,
  rates,
  setRates,
  rateModifier,
  setRateModifier,
  currency,
  rateTables,
  orgGrades,
  selectedRateRows,
  hideSourceOptions = false,
}) => {
  const { classes, cx } = useRateSourceStyles()
  const { t } = useTranslation()

  // On a follow-on projection the rates come straight from the matter's
  // existing rate table — there is no source to choose, just an editable table.
  const showManual = hideSourceOptions || source === 'manual'
  const showCard = !hideSourceOptions && source === 'card'

  const sourceOptions = [
    {
      id: 'card',
      title: t('fixedFeeSetup.rateSource.useExisting'),
      desc: t('fixedFeeSetup.rateSource.useExistingDesc'),
    },
    {
      id: 'manual',
      title: t('fixedFeeSetup.rateSource.manual'),
      desc: t('fixedFeeSetup.rateSource.manualDesc'),
    },
  ]

  return (
    <div>
      {!hideSourceOptions && (
        <div className={classes.sourceGrid}>
          {sourceOptions.map(o => {
            const isSelected = source === o.id
            return (
              <div
                key={o.id}
                data-test={`rate-source-${o.id}`}
                className={cx(
                  classes.sourceCard,
                  isSelected && classes.sourceCardSelected
                )}
                onClick={() => setSource(o.id)}
              >
                <div
                  className={cx(
                    classes.radio,
                    isSelected && classes.radioSelected
                  )}
                >
                  {isSelected && <div className={classes.radioDot} />}
                </div>
                <div>
                  <Typography component="div" className={classes.sourceTitle}>
                    {o.title}
                  </Typography>
                  <Typography component="div" className={classes.sourceDesc}>
                    {o.desc}
                  </Typography>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCard && (
        <RateCardPreview
          cardId={cardId}
          setCardId={setCardId}
          rateTables={rateTables}
          currency={currency}
          rateModifier={rateModifier}
          setRateModifier={setRateModifier}
          selectedRateRows={selectedRateRows}
        />
      )}

      {showManual && (
        <ManualRateTable
          orgGrades={orgGrades}
          rates={rates}
          setRates={setRates}
          currency={currency}
        />
      )}
    </div>
  )
}

export default RateSourcePicker
