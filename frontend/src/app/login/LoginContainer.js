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
import Login from './Login'
import { updateTitle } from '../../helpers/title-helper'
import { useSelector } from 'react-redux'

const LoginContainer = props => {
  const roles = useSelector(state => state.auth.data.roles)
  const loginForms = useSelector(state => state.login.loginForms)

  useEffect(() => {
    updateTitle()
  }, [])

  return <Login roles={roles} loginForms={loginForms} {...props} />
}

export default LoginContainer
