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

import React, { useState } from 'react'
import JuralioDialog from '../../../../components/dialog/juralio-dialog/JuralioDialog'
import { DialogContent, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import costsService from '../../../../services/costs/costs-service'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import dayjs from 'dayjs'
import BigDataSpinner from '../../../../components/feedback/big-data-spinner/BigDataSpinner'

const NewPeriodDialog = props => {
  const getPeriodMin = () => {
    return dayjs(props.periods[props.periods.length - 1].startDate)
      .add(1, 'month')
      .toDate()
  }

  const { t } = useTranslation()
  const [errorText, setErrorText] = useState()
  const [payload, setPayload] = useState({
    name: 'x',
    startDate: getPeriodMin(),
    endDate: null,
    rateTableDetailId: props.rtdId,
  })
  const [showSpinner, setShowSpinner] = useState(false)

  const formatPayload = (name, value) => {
    var payloadObj = payload
    if (name === 'sd') {
      if (value === null) {
        setErrorText('Periods must have a start date')
      } else {
        setErrorText(undefined)
      }
      payloadObj.startDate = value
    } else if (name === 'ed') {
      payloadObj.endDate = value
    }
    setPayload(payloadObj)
  }

  const createBulkRatesPayload = periods => {
    let bulkPayload = []
    props.data.forEach(row => {
      bulkPayload.push({
        gradeId: row[0].id,
        rateTypeId: row[1].id,
        periodId: periods[periods.length - 1].id,
        rate: null,
        rate_table_detailsId: props.rtdId,
      })
      if (props.matterId) {
        bulkPayload[bulkPayload.length - 1].matterId = parseInt(props.matterId)
      }
    })
    return bulkPayload
  }

  const createPeriod = () => {
    setShowSpinner(true)
    costsService.createPeriod(payload).then(res => {
      if (res.status === 200) {
        let newCol = res.body[res.body.length - 1]
        let periods = res.body.sort((a, b) => (a.id < b.id ? -1 : 1))
        const bulkPayload = createBulkRatesPayload(res.body)
        costsService.bulkCreateRates(bulkPayload).then(res => {
          if (res.status === 200) {
            if (props.matterId) {
              props.setHasChanges(true)
              costsService
                .getMatterRateTable(props.rtdId, props.matterId, false)
                .then(res => {
                  if (res.status === 200) {
                    props.addColumn(newCol)
                    props.updateRates(res.body)
                    props.updateValues(periods)
                    props.closeHandler(false)
                    setShowSpinner(false)
                  }
                })
            } else {
              costsService.getRateTable(props.rtdId).then(res => {
                if (res.status === 200) {
                  props.addColumn(newCol)
                  props.updateRates(res.body)
                  props.updateValues(periods)
                  props.closeHandler(false)
                  setShowSpinner(false)
                }
              })
            }
          }
        })
      }
    })
  }

  return (
    <JuralioDialog
      titleIcon={null}
      titleText={'Choose start month of new period'}
      disabled={errorText}
      actionLabel={t('common.confirm')}
      handleAction={() => {
        createPeriod()
      }}
      handleCancel={() => {
        props.closeHandler(false)
      }}
      open={props.display}
    >
      <DialogContent>
        <div>
          <div>
            {showSpinner ? (
              <>
                <BigDataSpinner size={180} />
              </>
            ) : (
              <>
                <DateCalendar
                  defaultValue={getPeriodMin()}
                  closeOnSelect={false}
                  minDate={getPeriodMin()}
                  name={'startDate'}
                  variant="inline"
                  openTo="month"
                  views={['year', 'month']}
                  format="yyyy-MM"
                  onChange={e => {
                    formatPayload('sd', e)
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
export default NewPeriodDialog
