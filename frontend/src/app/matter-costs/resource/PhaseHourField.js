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
import { makeStyles } from 'tss-react/mui'
import { TextField } from '@mui/material'
//import { OPERATION_MODE } from '../../constants'

const useStyles = makeStyles()(theme => ({
  field: { paddingLeft: 8, width: '90%' },
}))

const PhaseHourField = props => {
  const { classes } = useStyles()
  const index = props.index
  const [error, setError] = useState(false)
  const updateValue = value => {
    setError(isError(value))
    props.updatePayload(value, index, props.taskId)
  }
  const [v, setV] = useState(props.value)

  useEffect(() => {
    if (props.viewOnly) {
      setV(0)
    } else {
      setV(props.value)
    }
  }, [props.value, props.viewOnly])

  const isError = value => {
    if (value < 0 || value > 9999) {
      return true
    } else {
      return false
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      const fields = Array.from(document.querySelectorAll('input')) || []
      const position = fields.indexOf(e.target)
      if (fields.length - 1 === position) {
        fields[1] && fields[1].focus()
      } else {
        fields[position + 1] && fields[position + 1].focus()
      }
    }
  }

  return (
    <div className={classes.field}>
      <TextField
        data-test="phase-hour-field"
        variant="outlined"
        autoFocus={props.autoFocus}
        onKeyDown={handleKeyDown}
        disabled={props.viewOnly}
        type={'number'}
        value={v ?? ''}
        onChange={e => {
          const raw = e.target.value
          if (raw === '') {
            setV('')
            updateValue(0)
            return
          }
          const num = Number(raw)
          if (num >= 0 && num <= 9999) {
            setV(num)
            updateValue(num)
          }
        }}
        error={error}
        helperText={error ? 'Must be between 0 & 9999' : ''}
        onFocus={event => {
          if (props.value === 0) {
            event.target.select()
          }
        }}
        slotProps={{
          htmlInput: { min: 0, max: 9999 },
        }}
      />
    </div>
  )
}
export default PhaseHourField
