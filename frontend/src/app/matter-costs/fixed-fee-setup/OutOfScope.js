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
import { makeStyles } from 'tss-react/mui'
import OosOptionCard from './OosOptionCard'
import rawColours from '../../../theme/raw-colours'

const useStyles = makeStyles()(() => ({
  question: {
    font: '500 13px Montserrat',
    color: rawColours.primary.black.black,
    marginBottom: 6,
  },
  star: {
    color: rawColours.primary.primary.main,
  },
  helper: {
    fontSize: 11.5,
    color: rawColours.primary.black[100],
    marginBottom: 12,
    fontStyle: 'italic',
    lineHeight: 1.5,
  },
  optionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 200px))',
    gap: 8,
  },
}))

const OutOfScope = ({ value, onChange }) => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const v = value || {}
  const options = [
    { id: 'yes', label: t('fixedFeeSetup.outOfScope.yes') },
    { id: 'no', label: t('fixedFeeSetup.outOfScope.no') },
  ]

  return (
    <div>
      <Typography component="div" className={classes.question}>
        {t('fixedFeeSetup.outOfScope.questionPrefix')}
        <sup className={classes.star}>*</sup>
        {t('fixedFeeSetup.outOfScope.questionSuffix')}
      </Typography>
      <Typography component="div" className={classes.helper}>
        {t('fixedFeeSetup.outOfScope.helper')}
      </Typography>
      <div className={classes.optionGrid}>
        {options.map(o => (
          <OosOptionCard
            key={o.id}
            selected={v.approval === o.id}
            onClick={() => onChange({ ...v, approval: o.id })}
            label={o.label}
            dataTest={`oos-approval-${o.id}`}
          />
        ))}
      </div>
    </div>
  )
}

export default OutOfScope
