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

import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import IconButton from '@mui/material/IconButton'
import Input from '@mui/material/Input'
import InputAdornment from '@mui/material/InputAdornment'
import React from 'react'
import { PASSWORD_CONTANTS } from '../../../app/constants'

export default class PasswordField extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showPassword: false,
    }
  }

  handleMouseDownPassword = event => {
    event.preventDefault()
  }

  handleClickShowPassword = () => {
    this.setState({ showPassword: !this.state.showPassword })
  }

  render() {
    return (
      <Input
        {...this.props}
        inputProps={{
          maxLength: PASSWORD_CONTANTS.MAX_PASSWORD_LENGTH,
          autoComplete: 'current-password',
          autoCapitalize: 'off',
        }}
        type={this.state.showPassword ? 'text' : 'password'}
        defaultValue={this.props.value}
        id={this.props.id}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="Toggle password visibility"
              onClick={this.handleClickShowPassword}
              onMouseDown={this.handleMouseDownPassword}
              size="large"
            >
              {this.state.showPassword ? (
                <VisibilityOff data-test="hide-password-icon" />
              ) : (
                <Visibility data-test="show-password-icon" />
              )}
            </IconButton>
          </InputAdornment>
        }
      />
    )
  }
}
