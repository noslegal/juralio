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
import { useDispatch, useSelector } from 'react-redux'
import {
  cleanValidation,
  createOrganisation,
} from '../../../admin/organisations/organisation-actions'
import CreateOrganisationFlow from './CreateOrganisationFlow'
const CreateOrganisationFlowContainer = props => {
  const dispatch = useDispatch()
  const organisation = useSelector(state => state.organisation)
  const instanceSettings = useSelector(state => state.instanceSettings)

  const [ssoState, setSsoState] = useState({
    microsoftSsoEnabled: false,
    oktaSsoEnabled: false,
    googleSsoEnabled: false,
  })

  const actionHandler = name => {
    dispatch(createOrganisation(name, ssoState)).then(res => {
      if (!res.errors) {
        props.cancelHandler()
      }
    })
  }

  const cancelDialog = () => {
    props.cancelHandler()
    dispatch(cleanValidation())
  }

  const changeSSO = (type, checked) => {
    if (type === 'oktaSsoEnabled') {
      setSsoState({
        ...ssoState,
        oktaSsoEnabled: checked,
      })
    }
    if (type === 'microsoftSsoEnabled') {
      setSsoState({
        ...ssoState,
        microsoftSsoEnabled: !ssoState.microsoftSsoEnabled,
      })
    }
    if (type === 'googleSsoEnabled') {
      setSsoState({
        ...ssoState,
        googleSsoEnabled: !ssoState.googleSsoEnabled,
      })
    }
  }

  return (
    <CreateOrganisationFlow
      validationMessage={organisation.validationMessages.uniqueOrgErrorMessage}
      actionHandler={actionHandler}
      handleCancel={cancelDialog}
      instanceSettings={instanceSettings}
      changeSSO={changeSSO}
      ssoState={ssoState}
    />
  )
}

export default CreateOrganisationFlowContainer
