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

import SecurityIcon from '@mui/icons-material/Security'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import ConfirmationDialog from '../../../../components/dialog/confirmation-dialog/ConfirmationDialog'
import { SSO } from '../../../constants'

const OrganisationSecurityConfirmationDialog = props => {
  const {
    changesAwaitingConfirmation,
    setChangesAwaitingConfirmation,
    thirdPartyUsers,
  } = props
  const { t } = useTranslation()

  const clearChangesForProperty = (propertyName, properties) => {
    const { [propertyName]: unused, ...otherProperties } = properties
    setChangesAwaitingConfirmation(otherProperties)
  }

  const confirmChanges = (propertyName, properties) => {
    const propertyValue = properties[propertyName]
    clearChangesForProperty(propertyName, properties)
    return props.applyChange(propertyName, propertyValue)
  }

  const getContext = propertyName => {
    const newValue = changesAwaitingConfirmation[propertyName]
    const context = newValue ? 'enable' : 'disable'
    return { context }
  }

  const disabling = propertyName =>
    changesAwaitingConfirmation[propertyName] === false

  const getConfirmationText = (propertyName, provider) =>
    t(
      `organisation.ssoTogglePanel.confirmationPrompt_${
        changesAwaitingConfirmation[propertyName] ? 'enabled' : 'disabled'
      }`,
      {
        provider: provider.replace(/^\w/, c => c.toUpperCase()),
      }
    )

  const renderTitle = propertyName => {
    if (propertyName === 'mfaEnabled') {
      return t(
        'organisation.mfaTogglePanel.confirmationDialog.title',
        getContext(propertyName)
      )
    }
    if (propertyName === 'microsoftSsoEnabled') {
      return getConfirmationText(propertyName, SSO.MICROSOFT)
    }
    if (propertyName === 'oktaSsoEnabled') {
      return getConfirmationText(propertyName, SSO.OKTA)
    }
    if (propertyName === 'samlSsoEnabled') {
      return getConfirmationText(propertyName, SSO.SAML)
    }
    if (propertyName === 'googleSsoEnabled') {
      return getConfirmationText(propertyName, SSO.GOOGLE)
    }
  }

  const renderWarningText = propertyName => {
    if (disabling(propertyName)) {
      if (propertyName === 'microsoftSsoEnabled') {
        if (thirdPartyUsers.microsoftUsers.length === 1) {
          return t('organisation.ssoTogglePanel.existingUsersWarning', {
            count: thirdPartyUsers.microsoftUsers.length,
            provider: SSO.MICROSOFT.replace(/^\w/, c => c.toUpperCase()),
          })
        }
        return t('organisation.ssoTogglePanel.existingUsersWarning_other', {
          count: thirdPartyUsers.microsoftUsers.length,
          provider: SSO.MICROSOFT.replace(/^\w/, c => c.toUpperCase()),
        })
      }
      if (propertyName === 'oktaSsoEnabled') {
        if (thirdPartyUsers.oktaUsers.length === 1) {
          return t('organisation.ssoTogglePanel.existingUsersWarning', {
            count: thirdPartyUsers.oktaUsers.length,
            provider: SSO.OKTA.replace(/^\w/, c => c.toUpperCase()),
          })
        }
        return t('organisation.ssoTogglePanel.existingUsersWarning_other', {
          count: thirdPartyUsers.oktaUsers.length,
          provider: SSO.OKTA.replace(/^\w/, c => c.toUpperCase()),
        })
      }
      if (propertyName === 'samlSsoEnabled') {
        if (thirdPartyUsers.samlUsers.length === 1) {
          return t('organisation.ssoTogglePanel.existingUsersWarning', {
            count: thirdPartyUsers.samlUsers.length,
            provider: SSO.SAML.replace(/^\w/, c => c.toUpperCase()),
          })
        }
        return t('organisation.ssoTogglePanel.existingUsersWarning_other', {
          count: thirdPartyUsers.samlUsers.length,
          provider: SSO.SAML.replace(/^\w/, c => c.toUpperCase()),
        })
      }
      if (propertyName === 'googleSsoEnabled') {
        if (thirdPartyUsers.googleUsers.length === 1) {
          return t('organisation.ssoTogglePanel.existingUsersWarning', {
            count: thirdPartyUsers.googleUsers.length,
            provider: SSO.GOOGLE.replace(/^\w/, c => c.toUpperCase()),
          })
        }
        return t('organisation.ssoTogglePanel.existingUsersWarning_other', {
          count: thirdPartyUsers.googleUsers.length,
          provider: SSO.GOOGLE.replace(/^\w/, c => c.toUpperCase()),
        })
      }
    }
  }

  const renderPromptText = propertyName => {
    if (propertyName === 'mfaEnabled') {
      return t(
        'organisation.mfaTogglePanel.confirmationDialog.body',
        getContext(propertyName)
      )
    }

    if (propertyName === 'microsoftSsoEnabled') {
      if (disabling(propertyName)) {
        if (thirdPartyUsers.microsoftUsers.length > 0) {
          return t('organisation.ssoTogglePanel.existingUsersExplanatory')
        }
        return t('organisation.ssoTogglePanel.noExistingUsers', {
          provider: SSO.MICROSOFT.replace(/^\w/, c => c.toUpperCase()),
        })
      }
    }
    if (propertyName === 'oktaSsoEnabled') {
      if (disabling(propertyName)) {
        if (thirdPartyUsers.oktaUsers.length > 0) {
          return t('organisation.ssoTogglePanel.existingUsersExplanatory')
        }
        return t('organisation.ssoTogglePanel.noExistingUsers', {
          provider: SSO.OKTA.replace(/^\w/, c => c.toUpperCase()),
        })
      }
    }
    if (propertyName === 'samlSsoEnabled') {
      if (disabling(propertyName)) {
        if (thirdPartyUsers.samlUsers.length > 0) {
          return t('organisation.ssoTogglePanel.existingUsersExplanatory')
        }
        return t('organisation.ssoTogglePanel.noExistingUsers', {
          provider: SSO.SAML.replace(/^\w/, c => c.toUpperCase()),
        })
      }
    }
    if (propertyName === 'googleSsoEnabled') {
      if (disabling(propertyName)) {
        if (thirdPartyUsers.googleUsers.length > 0) {
          return t('organisation.ssoTogglePanel.existingUsersExplanatory')
        }
        return t('organisation.ssoTogglePanel.noExistingUsers', {
          provider: SSO.GOOGLE.replace(/^\w/, c => c.toUpperCase()),
        })
      }
    }
    return t('organisation.ssoTogglePanel.enablePrompt')
  }

  return changesAwaitingConfirmation
    ? Object.keys(changesAwaitingConfirmation).map(propertyName => {
        return (
          <ConfirmationDialog
            headerIcon={SecurityIcon}
            key={propertyName}
            titleText={renderTitle(propertyName)}
            warningText={renderWarningText(propertyName)}
            promptText={renderPromptText(propertyName)}
            actionText={t('common.confirm')}
            cancelHandler={() =>
              clearChangesForProperty(propertyName, changesAwaitingConfirmation)
            }
            actionHandler={() =>
              confirmChanges(propertyName, changesAwaitingConfirmation)
            }
            usageContext={`Confirm${propertyName}Change`}
          />
        )
      })
    : null
}

OrganisationSecurityConfirmationDialog.propTypes = {
  applyChange: PropTypes.func.isRequired,
  changesAwaitingConfirmation: PropTypes.object.isRequired,
  setChangesAwaitingConfirmation: PropTypes.func.isRequired,
}

export default OrganisationSecurityConfirmationDialog
