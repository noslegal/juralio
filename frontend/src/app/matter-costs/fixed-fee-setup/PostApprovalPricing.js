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

import EditIcon from '@mui/icons-material/Edit'
import HandshakeIcon from '@mui/icons-material/Handshake'
import ScheduleIcon from '@mui/icons-material/Schedule'
import React from 'react'
import { InputBase, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import OosOptionCard from './OosOptionCard'
import rawColours from '../../../theme/raw-colours'

const CUSTOM_NOTES_LIMIT = 300

const useStyles = makeStyles()(() => ({
  optionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  customNotesRoot: {
    width: '100%',
    marginTop: 10,
    padding: '12px 14px',
    borderRadius: 8,
    border: '1px solid rgba(0, 0, 0, 0.12)',
    background: rawColours.primary.white.primary,
    boxSizing: 'border-box',
    transition: 'border-color 150ms, box-shadow 150ms',
    '&:hover': { borderColor: rawColours.primary.primary.main },
    '&.Mui-focused': {
      borderColor: rawColours.primary.primary.main,
      boxShadow: '0 0 0 3px rgba(63,121,155,0.15)',
    },
  },
  customNotesInput: {
    padding: 0,
    font: '400 14px Montserrat, sans-serif',
    color: rawColours.primary.black.black,
    resize: 'vertical',
    '&::placeholder': { color: rawColours.primary.black[100], opacity: 1 },
  },
  charCounter: {
    marginTop: 4,
    fontSize: 11,
    textAlign: 'right',
    color: rawColours.primary.black[100],
  },
}))

const PostApprovalPricing = ({ value, onChange }) => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const v = value || {}
  const customNotesLength = (v.customNotes || '').length
  const options = [
    {
      id: 'agreed',
      label: t('fixedFeeSetup.postApproval.agreed'),
      Icon: HandshakeIcon,
    },
    {
      id: 'rates',
      label: t('fixedFeeSetup.postApproval.rates'),
      Icon: ScheduleIcon,
    },
    {
      id: 'custom',
      label: t('fixedFeeSetup.postApproval.custom'),
      Icon: EditIcon,
    },
  ]

  return (
    <div>
      <div className={classes.optionGrid}>
        {options.map(o => (
          <OosOptionCard
            key={o.id}
            selected={v.postApproval === o.id}
            onClick={() => onChange({ ...v, postApproval: o.id })}
            Icon={o.Icon}
            label={o.label}
          />
        ))}
      </div>
      {v.postApproval === 'custom' && (
        <>
          <InputBase
            multiline
            minRows={2}
            className={classes.customNotesRoot}
            classes={{ input: classes.customNotesInput }}
            inputProps={{ maxLength: CUSTOM_NOTES_LIMIT }}
            placeholder={t('fixedFeeSetup.postApproval.customPlaceholder')}
            value={v.customNotes || ''}
            onChange={e => onChange({ ...v, customNotes: e.target.value })}
          />
          <Typography component="div" className={classes.charCounter}>
            {t('fixedFeeSetup.postApproval.customCharCount', {
              count: customNotesLength,
              max: CUSTOM_NOTES_LIMIT,
            })}
          </Typography>
        </>
      )}
    </div>
  )
}

export default PostApprovalPricing
