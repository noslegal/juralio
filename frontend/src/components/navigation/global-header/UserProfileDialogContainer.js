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

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateSelf } from '../../../app/users/users-actions'
import {
  checkNameIsValidLength,
  checkTextHasNonWhitespaceContent,
} from '../../../services/helpers/text/text-util-helper'
import UserProfileDialog from './UserProfileDialog'

const UserProfileDialogContainer = () => {
  const dispatch = useDispatch()
  const auth = useSelector(state => state.auth)
  const user = auth.data.details
  const [firstName, setFirstName] = useState(user.firstname)
  const [lastName, setLastName] = useState(user.lastname)
  const [actionDisabled, setActionDisabled] = useState(true)
  const [showLoadingBar, setShowLoadingBar] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const validateName = name =>
    name &&
    checkNameIsValidLength(name) &&
    checkTextHasNonWhitespaceContent(name)

  useEffect(() => {
    setDialogOpen(!validateName(firstName) || !validateName(lastName))
    setActionDisabled(!validateName(firstName) || !validateName(lastName))
  }, []) // eslint-disable-line

  useEffect(() => {
    setActionDisabled(!validateName(firstName) || !validateName(lastName))
  }, [firstName, lastName])

  const handleSave = () => {
    setShowLoadingBar(true)
    dispatch(
      updateSelf({
        firstname: firstName,
        lastname: lastName,
        isThirdPartyUser: user.isThirdPartyUser,
        thirdPartyUserId: user.thirdPartyUserId,
      })
    ).then(() => {
      setDialogOpen(false)
    })
  }

  // Only show dialog for Juralio authenticated users
  if (
    user.isThirdPartyUser &&
    user.firstname &&
    user.firstname !== '' &&
    user.lastname &&
    user.lastname !== ''
  ) {
    return null
  }

  return (
    <UserProfileDialog
      dialogOpen={dialogOpen}
      firstName={firstName}
      setFirstName={setFirstName}
      lastName={lastName}
      setLastName={setLastName}
      actionDisabled={actionDisabled}
      handleSave={handleSave}
      showLoadingBar={showLoadingBar}
    />
  )
}

export default UserProfileDialogContainer
