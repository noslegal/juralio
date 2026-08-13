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

import { Tooltip } from '@mui/material'
import { DesktopTimePicker } from '@mui/x-date-pickers/DesktopTimePicker'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import useDebounce from '../../../../../../../hooks/debounce-hook'
const style = makeStyles()(theme => ({
  dropdownWrapper: {
    marginRight: theme.spacing(1),
  },
}))
const MeetingNoteTimePicker = props => {
  const { t } = useTranslation()
  const [value, _setValue] = useState(props.initialValue)
  const [valueChange, setValueChange] = useState(false)

  useEffect(() => {
    if (props.initialValue.getTime() !== value.getTime()) {
      _setValue(props.initialValue)
    }
  }, [props.initialValue]) //eslint-disable-line

  const { classes } = style()

  const debounceValue = useDebounce(value)

  useEffect(() => {
    if (
      debounceValue !== null &&
      new Date(debounceValue).toString() !== 'Invalid Date' &&
      valueChange === true
    ) {
      props.onUpdate(debounceValue)
      setValueChange(false)
    } else {
      //error
    }
  }, [debounceValue]) //eslint-disable-line

  const setValue = date => {
    _setValue(date)
  }

  const checkValue = value => {
    let newDate = new Date(props.initialValue)
    newDate.setHours(value.getHours())
    newDate.setMinutes(value.getMinutes())
    setValue(newDate)
    setValueChange(true)
  }

  return (
    <Tooltip title={props.viewOnly ? t('matter.viewOnly') : ''}>
      <div
        className={classes.dropdownWrapper}
        data-test="meeting-time-selector"
      >
        <DesktopTimePicker
          value={value}
          onChange={nv => {
            checkValue(nv)
          }}
          disabled={props.viewOnly}
          ampm={false}
          views={['hours', 'minutes']}
          label={props.label}
          format="HH:mm"
          readOnly={props.viewOnly}
          slotProps={{
            textField: {
              placeholder: t('postDetails.meetingNote.placeholder'),
              variant: 'standard',
              size: 'small',
              sx: { width: 110 },
            },
            actionBar: {
              actions: ['cancel', 'accept'],
              sx: {
                gridColumn: '2 / 4',
                '& .MuiButton-root': {
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  minWidth: 0,
                },
              },
            },
          }}
        />
      </div>
    </Tooltip>
  )
}

export default React.memo(MeetingNoteTimePicker)
