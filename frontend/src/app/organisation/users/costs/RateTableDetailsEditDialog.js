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

import React, { useEffect, useState } from 'react'
import JuralioDialog from '../../../../components/dialog/juralio-dialog/JuralioDialog'
import {
  DialogContent,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import costsService from '../../../../services/costs/costs-service'
import { CURRENCIES } from '../../../constants'

const RateTableDetailsEditDialog = props => {
  const classes = props.classes
  const { t } = useTranslation()
  const [errorText, setErrorText] = useState()
  const [currency, setCurrency] = useState(props.values.currency)
  const [location, setLocation] = useState(props.values.location)
  const [workType, setWorkType] = useState(props.values.work_type)
  const [clientName, setClientName] = useState(props.values.client_name)
  const [payload, setPayload] = useState({
    currency: '',
    location: '',
    work_type: '',
  })

  useEffect(() => {
    if (currency === '' || location === '' || workType === '') {
      setErrorText('Fields cannot be empty')
    } else {
      setErrorText(undefined)
    }
  }, [currency, location, workType])

  const formatPayload = updatedField => {
    var payloadObj = payload
    if (updatedField.name === 'currency') {
      if (updatedField.value !== props.values.currency) {
        payloadObj.currency = updatedField.value
      }
    } else if (updatedField.name === 'wt') {
      if (updatedField.value !== props.values.work_type) {
        payloadObj.work_type = updatedField.value
      }
    } else if (updatedField.name === 'clientName') {
      if (updatedField.value !== props.values.client_name) {
        payloadObj.client_name = updatedField.value
      }
    } else {
      if (updatedField.value !== props.values.location) {
        payloadObj.location = updatedField.value
      }
    }
    setPayload(payloadObj)
  }

  const updateDetails = () => {
    if (payload.currency === '') {
      delete payload.currency
    }
    if (payload.location === '') {
      delete payload.location
    }
    if (payload.work_type === '') {
      delete payload.work_type
    }
    costsService.updateRateTableDetail(props.values.id, payload).then(res => {
      if (res.status === 200) {
        props.updateValues(res.body)
        props.closeHandler(false)
      }
    })
  }

  return (
    <JuralioDialog
      titleIcon={null}
      titleText={'Edit rate table details'}
      disabled={errorText}
      actionLabel={t('common.confirm')}
      handleAction={() => {
        updateDetails()
      }}
      handleCancel={() => {
        props.closeHandler(false)
      }}
      open={props.display}
    >
      <DialogContent>
        <div>
          <Typography></Typography>
          <div>
            <Typography style={{ paddingTop: '8px' }}>
              {t('organisationAdmin.costs.stage6P2')}
            </Typography>
            <Select
              value={currency}
              name="currency"
              onChange={e => {
                setCurrency(e.target.value)
                formatPayload(e.target)
              }}
            >
              {CURRENCIES.map(curr => (
                <MenuItem value={curr.name}>{curr.name}</MenuItem>
              ))}
            </Select>

            <Typography style={{ paddingTop: '8px' }}>
              {t('organisationAdmin.costs.stage6P3')}
            </Typography>
            <TextField
              className={classes.textField}
              value={workType}
              name="wt"
              data-test="work-type-field"
              onChange={e => {
                if (e.target.value.length <= 50) {
                  setWorkType(e.target.value)
                  formatPayload(e.target)
                }
              }}
            />
            <Typography style={{ paddingTop: '8px' }}>
              {t('organisationAdmin.costs.stage6P4')}
            </Typography>
            <TextField
              className={classes.textField}
              value={location}
              name="l"
              data-test="location-field"
              onChange={e => {
                if (e.target.value.length <= 50) {
                  setLocation(e.target.value)
                  formatPayload(e.target)
                }
              }}
            />
            {props.values.client && (
              <>
                <Typography>{t('organisationAdmin.costs.stage6P6')}</Typography>
                <TextField
                  name={'clientName'}
                  className={classes.textField}
                  value={clientName}
                  data-test="client-name-field"
                  onChange={e => {
                    if (e.target.value.length <= 50) {
                      setClientName(e.target.value)
                      formatPayload(e.target)
                    }
                  }}
                />
              </>
            )}
          </div>
        </div>
        {errorText && <Typography color={'error'}>{errorText}</Typography>}
      </DialogContent>
    </JuralioDialog>
  )
}
export default RateTableDetailsEditDialog
