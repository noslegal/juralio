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
import { useDispatch } from 'react-redux'
import userService from '../../../../services/user/user-service'
import { resetForm } from '../../login-forms-actions'
import EmailSent from './EmailSent'
import ForgotPasswordForm from './ForgotPasswordForm'

const ForgotPasswordContainer = props => {
  const [screen, setScreen] = useState(0)
  const dispatch = useDispatch()

  const handleCancel = () => {
    dispatch(resetForm())
  }
  const handleSubmit = username => {
    userService.forgotPassword(username).then(res => {
      setScreen(1)
    })
  }
  return (
    <div>
      {screen === 0 && (
        <ForgotPasswordForm
          cancel={handleCancel}
          submit={handleSubmit}
          backgroundColor={props.backgroundColor}
        />
      )}
      {screen === 1 && <EmailSent back={handleCancel} />}
    </div>
  )
}
export default ForgotPasswordContainer
