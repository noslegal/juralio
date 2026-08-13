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

import { Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { SSO } from '../../../app/constants'
import JurEmailSent from '../../../assets/images/JurEmailSent'
import rawColours from '../../../theme/raw-colours'
const style = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  howToLogInText: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  emailSent: {
    marginTop: theme.spacing(4),
    width: '60%',
  },
  creationError: {
    color: rawColours.primary.red.primary,
    marginTop: theme.spacing(4),
  },
}))

const CreateUserFlowCreatedContent = props => {
  const { classes } = style()
  const { authType } = props
  const users = useSelector(state => state.users)

  const { t } = useTranslation()
  const getSSOLoginDetails = () => {
    return (
      <div className={classes.wrapper}>
        <Typography
          data-test="microsoft-user-created-text"
          className={classes.howToLogInText}
        >
          {authType === SSO.MICROSOFT && t('userCreation.microsoftCompleted')}
          {authType === SSO.OKTA && t('userCreation.oktaCompleted')}
          {authType === SSO.SAML && t('userCreation.samlCompleted')}
          {authType === SSO.GOOGLE && t('userCreation.googleCompleted')}
        </Typography>
        {authType === SSO.MICROSOFT && (
          <img src="/sign_in_with_microsoft.svg" alt="microsoft-logo" />
        )}
        {authType === SSO.OKTA && (
          <img src="/sign_in_with_okta.svg" alt="okta-logo" />
        )}
      </div>
    )
  }

  const getJuralioLoginDetails = () => {
    return (
      <div className={classes.wrapper}>
        <Typography className={classes.emailSent}>
          {t('userCreation.completed.emailSent')}
        </Typography>
      </div>
    )
  }

  const generateEmailList = () => {
    let emails = users.bulkCreateErrors.map(u => u.username)
    if (emails.length === 1) {
      return emails[0]
    }
    let emailString = emails.join(',')
    let lastIndex = emailString.lastIndexOf(',')
    return (
      emailString.substring(0, lastIndex) +
      ' and ' +
      emailString.substring(lastIndex + 1)
    )
  }
  const createdText =
    users.newUsers.length > 1
      ? `${users.newUsers.length} ${t('userCreation.completed.usersCreated')}`
      : t('userCreation.completed.userCreated')
  if (users.bulkCreateErrors.length > 0) {
    const didCreateSomeUsers = users.newUsers.length > 0

    return (
      <div className={classes.wrapper}>
        <Typography variant="h5">
          {didCreateSomeUsers
            ? createdText
            : t('userCreation.completed.creationError')}
        </Typography>
        {didCreateSomeUsers && authType === SSO.JURALIO && <JurEmailSent />}
        {didCreateSomeUsers &&
          authType === SSO.JURALIO &&
          getJuralioLoginDetails()}
        {didCreateSomeUsers &&
          authType === SSO.MICROSOFT &&
          getSSOLoginDetails()}
        {didCreateSomeUsers && authType === SSO.OKTA && getSSOLoginDetails()}
        {didCreateSomeUsers && authType === SSO.SAML && getSSOLoginDetails()}
        {didCreateSomeUsers && authType === SSO.GOOGLE && getSSOLoginDetails()}
        <Typography className={classes.creationError}>
          {t('userCreation.completed.creationErrorEmailList', {
            emails: generateEmailList(),
          })}
        </Typography>
      </div>
    )
  }

  return (
    <div className={classes.wrapper}>
      <Typography variant="h5">{createdText}</Typography>
      {authType === SSO.JURALIO && <JurEmailSent />}
      {authType === SSO.JURALIO && getJuralioLoginDetails()}
      {authType === SSO.MICROSOFT && getSSOLoginDetails()}
      {authType === SSO.OKTA && getSSOLoginDetails()}
      {authType === SSO.SAML && getSSOLoginDetails()}
      {authType === SSO.GOOGLE && getSSOLoginDetails()}
    </div>
  )
}

export default CreateUserFlowCreatedContent
