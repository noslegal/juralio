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

import WarningIcon from '@mui/icons-material/Warning'
import { Tooltip, Typography } from '@mui/material'
import classNames from 'classnames'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import InactiveAvatar from '../../../components/data-display/user/user-avatar/InactiveAvatar'
import UserAvatar from '../../../components/data-display/user/user-avatar/UserAvatar'
import { formatUserDisplayName } from '../../../services/user/helper/user-format-service'
import juralioColours from '../../../theme/juralio-colours'
import EditPlaceholderDialog from '../../../app/matter-details/placeholders/EditPlaceholderDialog'
import PlaceholderAvatar from '../../../components/data-display/placeholders/PlaceholderAvatar'

export const useUserColumnStyles = makeStyles()(theme => ({
  userFullname: {
    paddingLeft: theme.spacing(),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userNameContainer: {
    display: 'flex',
    alignItems: 'center',
    width: theme.spacing(30),
  },
  authMethodContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  authMethod: {},
  authMethodWarning: {
    color: juralioColours.warning,
  },
  warningIcon: {
    width: theme.spacing(2),
    marginLeft: theme.spacing(1),
  },
}))

export const renderUserColumn = (
  t,
  classes,
  user,
  username,
  showOwner = false
) => {
  const isOwner = user?.roles?.includes('ROLE_ORG_OWNER')
  const displayName =
    user && user.username && username === user.username
      ? t('entity.currentUser') +
        (user.isExternal ? ' (external)' : '') +
        (showOwner && isOwner ? ' (owner)' : '')
      : user.username
        ? formatUserDisplayName(user, showOwner)
        : user.firstname + ' ' + user.lastname
  return (
    <div
      data-test="table-user-column"
      className={classes.userNameContainer}
      title={user.username}
    >
      {user.enabled && !user.isPlaceholder ? (
        <UserAvatar user={user} />
      ) : !user.isPlaceholder ? (
        <InactiveAvatar user={user} />
      ) : (
        <PlaceholderAvatar
          placeholderName={user.firstname + ' ' + user.lastname}
        />
      )}
      <Typography
        data-test="user-name-text"
        variant="caption"
        className={classes.userFullname}
      >
        {displayName}
      </Typography>
    </div>
  )
}

export const renderPlaceholderColumn = (
  t,
  classes,
  placeholder,
  fullname,
  showOwner = false
) => {
  const displayName = fullname
  return (
    <div
      data-test="table-placeholder-column"
      className={classes.userNameContainer}
      title={fullname}
    >
      <PlaceholderAvatar placeholderName={displayName} />
      <Typography
        data-test="placeholder-name-text"
        variant="caption"
        className={classes.userFullname}
        style={{ paddingLeft: '8px' }}
      >
        {displayName}
      </Typography>
    </div>
  )
}

export const renderPlaceholderEmailColumn = (t, classes, placeholder) => {
  const displayEmail = placeholder.emailAddress
  return (
    <div
      data-test="placeholder-email-column"
      className={classes.userNameContainer}
      title={displayEmail}
    >
      <Typography
        data-test="placeholder-email-text"
        variant="caption"
        className={classes.userFullname}
      >
        {displayEmail}
      </Typography>
      <EditPlaceholderDialog placeholder={placeholder} />
    </div>
  )
}

export const renderAuthMethod = (
  t,
  classes,
  thirdPartyProvider,
  organisation
) => {
  let warning = false
  if (organisation) {
    if (thirdPartyProvider === 'Microsoft')
      warning = !organisation.microsoftSsoEnabled
    if (thirdPartyProvider === 'Okta') warning = !organisation.oktaSsoEnabled
    if (thirdPartyProvider === 'SAML') warning = !organisation.samlSsoEnabled
    if (thirdPartyProvider === 'Google')
      warning = !organisation.googleSsoEnabled
  }

  return (
    <Tooltip
      title={t('userList.authMethodDisabled')}
      disableHoverListener={!warning}
    >
      <div
        data-test="table-auth-method-column"
        className={classNames(
          classes.authMethodContainer,
          warning && classes.authMethodWarning
        )}
      >
        <Typography data-test="user-auth-method-text" variant="caption">
          {thirdPartyProvider}
        </Typography>
        {warning && <WarningIcon className={classes.warningIcon} />}
      </div>
    </Tooltip>
  )
}
