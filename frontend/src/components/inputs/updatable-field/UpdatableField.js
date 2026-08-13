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

import TextField from '@mui/material/TextField'
import React from 'react'
import { withStyles } from 'tss-react/mui'
import { OPERATION_MODE } from '../../../app/constants'

const styles = theme => ({
  nameField: {
    marginBottom: theme.spacing(1),
  },
  fullWidthField: {
    width: '100%',
  },
})

function UpdatableField(props) {
  const {
    classes,
    mode,
    validationMessage,
    submit,
    onBlur,
    margin,
    inputProps,
    InputProps,
    autoFocus,
    required,
    value,
    ...drillProps
  } = props

  return (
    <div className={classes.nameField}>
      <TextField
        {...drillProps}
        value={props.value || ''}
        className={classes.fullWidthField}
        margin={margin ? margin : 'normal'}
        autoFocus={
          autoFocus ? autoFocus : autoFocus && mode === OPERATION_MODE.CREATE
        }
        required={required ? mode !== OPERATION_MODE.VIEW : false}
        onFocus={e => e.target.select()}
        onBlur={mode === OPERATION_MODE.EDIT ? onBlur : undefined}
        helperText={validationMessage}
        error={validationMessage ? validationMessage.length > 0 : false}
        slotProps={{
          htmlInput: inputProps
            ? inputProps
            : {
                maxLength: 50,
                readOnly: mode === OPERATION_MODE.VIEW,
              },
          ...(InputProps ? { input: InputProps } : {}),
        }}
      />
    </div>
  )
}

export default withStyles(UpdatableField, styles)
