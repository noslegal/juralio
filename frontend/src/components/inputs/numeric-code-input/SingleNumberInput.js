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

import { TextField } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { withStyles } from 'tss-react/mui'

const BACK_SPACE_KEY = 'Backspace'
const styles = theme => ({
  root: {
    width: theme.spacing(5),
    padding: theme.spacing(1),
  },
  innerInput: {
    textAlign: 'center',
    //width required for IE11
    width: '100%',
  },
})

const isSingleDigit = val => /^\d$/.test(val)

const SingleNumberInput = props => {
  const onKeyUp = event => {
    if (event.key === BACK_SPACE_KEY) {
      props.onBackspace(event)
    }
  }

  const onChange = event => {
    const inputtedValue = event.target.value
    if (inputtedValue) {
      if (isSingleDigit(inputtedValue)) {
        props.onChange(event)
      } else if (inputtedValue.length > 1) {
        event.target.value = props.value
        props.onChange(event)
      }
    }
  }
  return (
    <TextField
      error={
        props.validationMessage && props.validationMessage.length > 0
          ? true
          : false
      }
      variant="outlined"
      onChange={onChange}
      onKeyUp={onKeyUp}
      value={props.value}
      className={props.classes.root}
      autoFocus={props.autoFocus}
      ref={props.setRef}
      slotProps={{
        htmlInput: {
          'data-test': `${props.index}-digit-input`,
          className: props.classes.innerInput,
          type: 'tel',
        },
      }}
    />
  )
}

SingleNumberInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  onBackspace: PropTypes.func.isRequired,
  setRef: PropTypes.func,
  key: PropTypes.number,
  index: PropTypes.number,
}

export default withStyles(SingleNumberInput, styles)
