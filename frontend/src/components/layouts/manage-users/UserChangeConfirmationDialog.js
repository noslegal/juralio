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
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { formatUserDisplayNameAndUserName } from '../../../services/user/helper/user-format-service'
import ConfirmationDialog from '../../dialog/confirmation-dialog/ConfirmationDialog'
import UserConfirmationContent from './juralio-users-table/components/UserConfirmationContent'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import InfoIcon from '@mui/icons-material/Info'
import { CONFIMRATION_STATUS } from '../../../app/constants'
import { Typography } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

const style = makeStyles()(theme => ({
  text: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
    fontSize: '14px',
  },
}))

const UserChangeConfirmationDialog = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const users = useSelector(state => state.users.users)
  const instanceSettings = useSelector(state => state.instanceSettings.settings)
  const organisation = useSelector(
    state => state.organisation.selectedOrganisation
  )
  const seatCount = organisation?.seatCount || 0
  const {
    userId,
    propertyName,
    userProperties,
    confirmChanges,
    cancelChanges,
  } = props
  const user = users.filter(
    user => user != null && user?.id === parseInt(userId, 10)
  )[0]
  const newValue = userProperties[propertyName]
  const context = newValue ? 'enable' : 'disable'
  let showExtraComponent = false
  let seatRelatedProperties = [
    'confirmationStatus-orgId',
    'confirmationStatus',
    'enabled',
    'enabled-confirmationStatus',
  ]

  const seatsAvailable =
    users.filter(
      u =>
        u && u.enabled && u.confirmationStatus === CONFIMRATION_STATUS.CONFIRMED
    ).length < seatCount
  const isDeactivation = propertyName === 'enabled' && !newValue
  const isReactivation =
    (propertyName === 'enabled' &&
      newValue &&
      user.confirmationStatus === CONFIMRATION_STATUS.CONFIRMED) ||
    (propertyName === 'enabled-confirmationStatus' &&
      user.confirmationStatus === CONFIMRATION_STATUS.LAPSED)

  const isConfirmation =
    propertyName === 'confirmationStatus' ||
    propertyName === 'confirmationStatus-orgId'
  if (
    seatRelatedProperties.includes(propertyName) &&
    instanceSettings.enableUserConfirmation &&
    !(
      user.confirmationStatus === CONFIMRATION_STATUS.TRIALING &&
      propertyName === 'enabled'
    )
  ) {
    showExtraComponent = true
  }

  const getTitle = () => {
    if (showExtraComponent) {
      if (isDeactivation) {
        return t(`userList.confirmationDialog.seatCounts.deactivation.title`)
      }
      if (isConfirmation || isReactivation) {
        return t(
          `userList.confirmationDialog.seatCounts.${
            seatsAvailable ? 'wontIncrease' : 'willIncrease'
          }.title`
        )
      }
    }

    return (
      t(`userList.confirmationDialog.${propertyName}.titleText`, {
        context,
      }) +
      ' - ' +
      (user.firstname || user.lastname
        ? formatUserDisplayNameAndUserName(user)
        : user.username)
    )
  }
  const getHeaderIcon = () => {
    if (isConfirmation || isReactivation) {
      if (seatsAvailable) {
        return InfoIcon
      } else {
        return WarningAmberIcon
      }
    }

    return null
  }

  return (
    <ConfirmationDialog
      headerIcon={getHeaderIcon()}
      titleText={getTitle()}
      promptText={
        !showExtraComponent &&
        t(`userList.confirmationDialog.${propertyName}.promptText`, {
          context,
        })
      }
      actionText={t('userList.confirmationDialog.actionText')}
      cancelHandler={() => cancelChanges(userId, propertyName, userProperties)}
      actionHandler={() => confirmChanges(userId, propertyName, userProperties)}
      usageContext={`Confirm${propertyName}Change`}
      extraComponent={
        showExtraComponent ? (
          <UserConfirmationContent
            propertyName={propertyName}
            newValue={newValue}
            isConfirmation={isConfirmation}
            isDeactivation={isDeactivation}
            isReactivation={isReactivation}
            seatCount={seatCount}
            seatsAvailable={seatsAvailable}
          />
        ) : (
          <Typography className={classes.text}>
            {newValue &&
              t(`userList.confirmationDialog.seatCounts.fullLimited.decrease`, {
                type: user.isExternal ? 'limited' : 'full',
              })}
          </Typography>
        )
      }
      warningText={null}
    />
  )
}

UserChangeConfirmationDialog.propTypes = {
  userId: PropTypes.string.isRequired,
  propertyName: PropTypes.string.isRequired,
  userProperties: PropTypes.object.isRequired,
  confirmChanges: PropTypes.func.isRequired,
  cancelChanges: PropTypes.func.isRequired,
}

export default UserChangeConfirmationDialog
