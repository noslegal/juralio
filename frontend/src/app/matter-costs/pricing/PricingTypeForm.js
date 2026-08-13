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
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'
import {
  FormControl,
  RadioGroup,
  Typography,
  FormControlLabel,
  Radio,
  TextField,
  Paper,
} from '@mui/material'
import Handshake from '../../../assets/images/JurHandshake'
import JurAnotherReason from '../../../assets/images/JurAnotherReason'
import rawColours from '../../../theme/raw-colours'
import juralioColours from '../../../theme/juralio-colours'
import { Tooltip } from '@mui/material'
import JurClock from '../../../assets/images/JurClock'

const useStyles = makeStyles()(theme => ({
  pricingOption: {
    backgroundColor: rawColours.primary.grey[100],
    borderRadius: '8px 0px 0px 8px',
    padding: '10px 5px 10px 5px',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: rawColours.primary.grey[200],
    },
  },
  selectedPricingOption: {
    borderRadius: '8px 0px 0px 8px',
    backgroundColor: rawColours.primary.grey.main,
    padding: '10px 5px 10px 5px',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}))

const PricingTypeForm = props => {
  const { classes } = useStyles()
  const { index, payload, setPayload, currency } = props

  const handleTypeChange = value => {
    let currentPayload = [...payload]
    currentPayload[index].type = value
    currentPayload[index].value = 0
    if (value === 2 || value === '2') {
      currentPayload[index].reason = t('matterCosts.internalWork')
      currentPayload[index].fullReason = t('matterCosts.internalWork')
    } else {
      currentPayload[index].reason = '0'
      currentPayload[index].fullReason = ''
    }
    currentPayload[index].fee = null
    currentPayload[index].cap = '0'
    currentPayload[index].type2control = '0'
    setPayload(currentPayload)
  }

  const { t } = useTranslation()

  const getBoxContent = () => {
    switch (payload[index].type) {
      case '0':
        return (
          <FormControl>
            <Typography>{t('Is there a cap?')}</Typography>
            <RadioGroup
              value={payload[index].cap}
              defaultValue={0}
              onChange={e => {
                let currentPayload = [...payload]
                currentPayload[index].cap = e.target.value
                if (e.target.value === '0') {
                  currentPayload[index].fee = 0
                  currentPayload[index].value = 0
                }
                setPayload(currentPayload)
              }}
            >
              <div style={{ marginLeft: '8px' }}>
                <FormControlLabel
                  value={0}
                  control={<Radio />}
                  label="No, its open-ended"
                />
              </div>

              <div style={{ marginLeft: '8px' }}>
                <FormControlLabel
                  value={1}
                  control={<Radio />}
                  label="Yes, there's a cap"
                />
                {payload[index].cap === '1' && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography style={{ padding: '8px' }}>
                      {t(currency.substring(0, 3))}
                    </Typography>
                    <TextField
                      autoFocus={true}
                      value={payload[index].fee}
                      variant="outlined"
                      label="Set cap"
                      type="number"
                      onChange={e => {
                        let currentPayload = [...payload]
                        currentPayload[index].value = e.target.value
                        currentPayload[index].fee = e.target.value
                        setPayload(currentPayload)
                      }}
                    />
                  </div>
                )}
              </div>
            </RadioGroup>
          </FormControl>
        )
      case '1':
        return (
          <FormControl>
            <Typography>{t('What kind of fee is this?')}</Typography>
            <RadioGroup
              value={payload[index].type2control}
              onChange={e => {
                let currentPayload = [...payload]
                currentPayload[index].type2control = e.target.value
                setPayload(currentPayload)
              }}
            >
              <div style={{ marginLeft: '8px' }}>
                <FormControlLabel
                  value={0}
                  control={<Radio />}
                  label="Fixed fee for this period"
                />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Typography style={{ padding: '8px' }}>
                    {t(currency.substring(0, 3))}
                  </Typography>
                  <TextField
                    autoFocus={true}
                    value={payload[index].fee}
                    variant="outlined"
                    label="Set fee"
                    type="number"
                    onChange={e => {
                      let currentPayload = [...payload]
                      currentPayload[index].value = e.target.value
                      currentPayload[index].fee = e.target.value
                      setPayload(currentPayload)
                    }}
                  />
                </div>
              </div>

              <div style={{ marginLeft: '8px' }}>
                <FormControlLabel
                  value={1}
                  control={<Radio />}
                  label="Other options coming soon"
                  disabled={true}
                />
              </div>
            </RadioGroup>
          </FormControl>
        )
      case '2':
        return (
          <FormControl data-test="none-pricing-form">
            <Typography>
              {t("What's the reason for there being no fee?")}
            </Typography>
            <RadioGroup
              value={payload[index].reason}
              onChange={e => {
                let currentPayload = [...payload]
                currentPayload[index].reason = e.target.value
                if (e.target.value !== '3') {
                  currentPayload[index].fullReason = e.target.value
                } else {
                  currentPayload[index].fullReason = ''
                }
                setPayload(currentPayload)
              }}
            >
              <div style={{ marginLeft: '8px' }}>
                <FormControlLabel
                  value={t('matterCosts.internalWork')}
                  control={<Radio />}
                  label={t('matterCosts.internalWork')}
                />
              </div>
              <div style={{ marginLeft: '8px' }}>
                <FormControlLabel
                  value={'Marketing or sales'}
                  control={<Radio />}
                  label="Marketing or sales"
                />
              </div>
              <div style={{ marginLeft: '8px' }}>
                <FormControlLabel
                  value={'Charitable or pro bono'}
                  control={<Radio />}
                  label="Charitable or pro bono"
                />
              </div>
              <div style={{ marginLeft: '8px' }}>
                <FormControlLabel
                  value={3}
                  control={<Radio />}
                  label="Another reason"
                />
                {payload[index].reason === '3' && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      autoFocus={true}
                      value={payload[index].fullReason}
                      variant="outlined"
                      placeholder={t('matterCosts.pricingNoFeePlaceholder')}
                      onChange={e => {
                        let currentPayload = [...payload]
                        currentPayload[index].fullReason = e.target.value
                        setPayload(currentPayload)
                      }}
                    />
                  </div>
                )}
              </div>
            </RadioGroup>
          </FormControl>
        )

      default:
        break
    }
  }

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <Typography variant="h6">{t('Pricing type')}</Typography>
        <Typography variant="subtitle1">
          {t('Specify what type of pricing applies')}
        </Typography>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '20% 80%',
          marginTop: '8px',
        }}
      >
        <div>
          <Tooltip
            placement="right"
            title="Time-based fees with or without a cap"
          >
            <div
              data-test="time-option"
              className={
                payload[index].type === '0'
                  ? classes.selectedPricingOption
                  : classes.pricingOption
              }
              onClick={() => {
                handleTypeChange('0')
              }}
            >
              <Typography
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: juralioColours.darkText.primary,
                }}
              >
                <JurClock style={{ marginRight: '4px' }} />
                Time-based
              </Typography>
            </div>
          </Tooltip>
          <Tooltip placement="right" title="For example fixed fees ">
            <div
              data-test="value-option"
              className={
                payload[index].type === '1'
                  ? classes.selectedPricingOption
                  : classes.pricingOption
              }
              onClick={() => {
                handleTypeChange('1')
              }}
            >
              <Typography
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: juralioColours.darkText.primary,
                }}
              >
                <Handshake style={{ marginRight: '4px' }} />
                Fixed
              </Typography>
            </div>
          </Tooltip>

          <Tooltip
            placement="right"
            title="For example internal or marketing work"
          >
            <div
              data-test="none-option"
              className={
                payload[index].type === '2'
                  ? classes.selectedPricingOption
                  : classes.pricingOption
              }
              onClick={() => {
                handleTypeChange('2')
              }}
            >
              <Typography
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: juralioColours.darkText.primary,
                }}
              >
                <JurAnotherReason style={{ marginRight: '4px' }} />
                No Fee
              </Typography>
            </div>
          </Tooltip>
        </div>
        <Paper
          style={{
            padding: '8px',
            backgroundColor: rawColours.primary.grey.main,
            width: 'auto',
            borderRadius: '8px 8px 0px 0px',
            boxShadow: 'none',
          }}
        >
          {getBoxContent()}
        </Paper>
      </div>
    </>
  )
}
export default PricingTypeForm
