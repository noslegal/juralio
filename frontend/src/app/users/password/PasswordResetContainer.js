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

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ChangePasswordContainer from '../../login/login-form/change-password-form/ChangePasswordContainer'
import { clearValidation } from '../../login/login-forms-actions'
const PasswordResetContainer = props => {
  const dispatch = useDispatch()
  useEffect(() => {
    return () => dispatch(clearValidation())
  }, []) //eslint-disable-line
  const user = useSelector(state => state.auth.data.details)
  return <ChangePasswordContainer user={user} context="selfService" />
}
export default PasswordResetContainer
