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
import { USER_ROLES } from '../../../app/constants'
import {
  bulkCreateUsers,
  clearUsernameValidation,
  createUser,
  initCreatedUser,
} from '../../../app/users/users-actions'
import CreateUserFlow from './CreateUserFlow'

function CreateUserFlowContainer(props) {
  const dispatch = useDispatch()
  const organisation = useSelector(
    state => state.organisation.selectedOrganisation
  )
  useEffect(() => {
    return () => _clearValidation()
  }, []) //eslint-disable-line
  const isSysAdmin = useSelector(state =>
    state.auth.data.auth.roles.includes(USER_ROLES.ROLE_SYS_ADMIN)
  )
  const usernameValidationMessage = useSelector(
    state => state.users?.usernameValidationMessage
  )
  const isCreated = useSelector(state => state.users?.isCreated)

  const initCreated = () => dispatch(initCreatedUser())

  const _createUser = properties => {
    if (props.isCreateSysadminFlow) {
      properties.roles = [USER_ROLES.ROLE_SYS_ADMIN]
    }
    const org =
      properties.organisation && properties.organisation > -1
        ? properties.organisation
        : null
    delete properties.organisation
    return dispatch(createUser(properties, org))
  }

  const _bulkCreateUsers = (usernames, properties) => {
    if (props.isCreateSysadminFlow && usernames.length === 1) {
      properties.username = usernames[0]
      return _createUser(properties)
    }
    const org =
      properties.organisation && properties.organisation > -1
        ? properties.organisation
        : null
    delete properties.organisation
    return dispatch(bulkCreateUsers(usernames, properties, org))
  }

  const _clearValidation = () => {
    dispatch(clearUsernameValidation())
  }

  return (
    <CreateUserFlow
      {...props}
      createUser={_createUser}
      usernameValidationMessage={usernameValidationMessage}
      clearUsernameValidation={_clearValidation}
      isCreated={isCreated}
      initCreated={initCreated}
      organisation={organisation}
      isSysAdmin={isSysAdmin}
      isCreateSysadminFlow={props.isCreateSysadminFlow}
      bulkCreateUsers={_bulkCreateUsers}
    />
  )
}

export default CreateUserFlowContainer
