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

import PropTypes from 'prop-types'
import React from 'react'
import { useDispatch } from 'react-redux'
import { setConfirmedStatus, update } from '../../../app/users/users-actions'
import UserChangeConfirmationDialog from './UserChangeConfirmationDialog'

const UserChangeConfirmationDialogContainer = props => {
  const dispatch = useDispatch()
  const { changesAwaitingConfirmation, setChangesAwaitingConfirmation } = props

  const clearChangesForProperty = (userId, propertyName, properties) => {
    let names = propertyName.split('-')
    let op = { ...properties }
    for (let i = 0; i < names.length; i++) {
      delete op[names[i]]
    }
    setChangesAwaitingConfirmation({
      ...changesAwaitingConfirmation,
      ...{ [userId]: op },
    })
  }

  const confirmChanges = (userId, propertyName, properties) => {
    clearChangesForProperty(userId, propertyName, properties)
    if (propertyName === 'confirmationStatus') {
      return dispatch(setConfirmedStatus(properties.orgId, userId))
    }
    return dispatch(update(userId, properties))
  }

  return changesAwaitingConfirmation
    ? Object.keys(changesAwaitingConfirmation).map(userId => {
        const userProperties = changesAwaitingConfirmation[userId]
        if (Object.keys(userProperties).length > 1) {
          return (
            <UserChangeConfirmationDialog
              key={`${userId}:${Object.keys(userProperties).join('-')}`}
              userId={userId}
              propertyName={Object.keys(userProperties).join('-')}
              userProperties={userProperties}
              confirmChanges={confirmChanges}
              cancelChanges={clearChangesForProperty}
            />
          )
        }

        return Object.keys(userProperties).map(propertyName => (
          <UserChangeConfirmationDialog
            key={`${userId}:${propertyName}`}
            userId={userId}
            propertyName={propertyName}
            userProperties={userProperties}
            confirmChanges={confirmChanges}
            cancelChanges={clearChangesForProperty}
          />
        ))
      })
    : null
}

UserChangeConfirmationDialogContainer.propTypes = {
  changesAwaitingConfirmation: PropTypes.object.isRequired,
  setChangesAwaitingConfirmation: PropTypes.func.isRequired,
}

export default UserChangeConfirmationDialogContainer
