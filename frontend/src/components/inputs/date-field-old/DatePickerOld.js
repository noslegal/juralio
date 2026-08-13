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

import { MobileDatePicker as MuiDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
const NullSlot = () => null
import classNames from 'classnames'
import React, { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import {
  DATE_FORMAT_DAY_MONTH_YEAR,
  DATE_STRINGS,
} from '../../../app/constants'
import { getDateDisplayString } from '../../../services/helpers/date-helper'
import colorModifiers from '../../../theme/color-modifiers'
import juralioColours from '../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import rawColours from '../../../theme/raw-colours'
import {
  lightButtonBackgroundColour,
  lightButtonHoverColour,
} from '../light-button/LightButton'
const styles = makeStyles()(theme => ({
  withoutDate: {
    width: 'fit-content',
  },
  withDate: {
    width: 'fit-content',
    paddingLeft: '2px',
  },
  disableInput: {
    '&:hover': {
      backgroundColor: `${lightButtonBackgroundColour} !important`,
    },
  },
  disableInputNotStarted: {
    '&:hover': {
      backgroundColor: `${colorModifiers.restingButtonOpacity(
        rawColours.primary.grey.main
      )} !important`,
    },
  },
  inputTop: {
    cursor: 'pointer',
    backgroundColor: lightButtonBackgroundColour,
    '&:hover': {
      backgroundColor: lightButtonHoverColour,
    },
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(0.5),
    height: theme.spacing(2.5),
  },
  floatingLabelFocusStyle: {
    cursor: 'pointer',
    color: JuralioNamedColours.black[200],
    paddingLeft: theme.spacing(0.5),
    textAlign: 'center',
  },
  error: {
    color: juralioColours.error,
  },
  notStarted: {
    backgroundColor: colorModifiers.restingButtonOpacity(
      rawColours.primary.grey.main
    ),
  },
  hide: {
    display: 'none',
  },
  today: {
    fontWeight: 'bold',
  },
}))

const DatePicker = props => {
  const { classes } = styles()
  const { minDate, maxDate, error } = props
  const [showOpen, setShowOpen] = useState(false)

  const getDatePickerStyle = () =>
    props.value ? classes.withDate : classes.withoutDate

  const today =
    getDateDisplayString(
      new Date(props.value),
      DATE_FORMAT_DAY_MONTH_YEAR,
      false
    ) === DATE_STRINGS.TODAY

  return (
    <div data-test={props['data-test']}>
      <MuiDatePicker
        value={props.value ? props.value : null}
        onChange={newValue => {}}
        onAccept={newValue => {
          props.onChange(newValue)
        }}
        open={showOpen}
        onOpen={() => {
          setShowOpen(true)
        }}
        onClose={() => {
          setShowOpen(false)
          props.onClose()
        }}
        format={'d MMM yyyy'}
        className={classNames(
          getDatePickerStyle(),
          props.hideInput && classes.hide
        )}
        minDate={minDate !== undefined ? new Date(minDate) : minDate}
        maxDate={maxDate !== undefined ? new Date(maxDate) : maxDate}
        closeOnSelect={true}
        label={props.label}
        slots={{ inputAdornment: NullSlot }}
        slotProps={{
          actionBar: {
            actions:
              props.clearable && props.value !== null
                ? ['clear', 'cancel', 'accept']
                : ['cancel', 'accept'],
          },
          toolbar: {
            toolbarTitle: props.label,
          },
          textField: {
            variant: 'standard',
            size: 'small',
            error,
            onClick: () => setShowOpen(true),
            sx: { width: 'fit-content' },
            InputProps: {
              classes: {
                input: classNames(
                  classes.inputTop,
                  error && classes.error,
                  props.isTaskNotStarted && classes.notStarted,
                  props.hideInput && classes.hide,
                  props.disabled && classes.disableInput,
                  props.isTaskNotStarted && classes.disableInputNotStarted,
                  today && classes.today
                ),
              },
            },
            InputLabelProps: {
              className: classNames(
                classes.floatingLabelFocusStyle,
                error && classes.error
              ),
            },
          },
        }}
      />
    </div>
  )
}
export default DatePicker
