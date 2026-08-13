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

export const formatUserDisplayName = (
  user,
  showOwner = false,
  showLimited = true
) => {
  if (!user) {
    return null
  }

  const isExternal = user?.isExternal
  const isOwner = user?.roles?.includes('ROLE_ORG_OWNER')

  const externalText = isExternal && showLimited ? ' (limited)' : ''
  const ownerText = showOwner && isOwner ? ' (owner)' : ''
  if (
    !user.firstname ||
    user.firstname === null ||
    user.firstname.length === 0 ||
    !user.lastname ||
    user.lastname === null ||
    user.lastname.length === 0
  ) {
    return user.username
      ? user.username + externalText + ownerText
      : user.email + externalText + ownerText
  } else {
    return user.firstname && user.lastname
      ? user.firstname + ' ' + user.lastname + externalText + ownerText
      : user.username + externalText + ownerText
  }
}
export const getUserAuthorisationStatus = (user, t) => {
  if (!user.enabled) {
    return t('UserListItem.Inactive')
  }
  if (!user.isActiveOnMatter) {
    return t('UserListItem.NotMTM')
  }
  if (user.isViewerOnMatter) {
    return t('entity.viewer')
  }
}

export const formatUserDisplayNameAndUserName = user => {
  const isExternal = user.isExternal
  const externalText = isExternal ? ' (limited)' : ''
  if (
    (!user.firstname ||
      user.firstname === null ||
      user.firstname.length === 0) &&
    (!user.lastname || user.lastname === null || user.lastname.length === 0)
  ) {
    return user.username
      ? user.username + externalText
      : user.email + externalText
  } else {
    if (user.username && user.username.length === 0) {
      return user.firstname + ' ' + user.lastname
    }
    return user.firstname && user.lastname
      ? user.firstname +
          ' ' +
          user.lastname +
          externalText +
          (user.username ? ` (${user.username})` : '')
      : user.username + externalText
  }
}

export const formatUserInitials = user => {
  if (!user.firstname && !user.lastname && user.username) {
    //for when a users name is  defined yet
    const split = user.username.split('@')[0].split('.')

    if (split.length > 1) {
      return `${split[0][0].toLocaleUpperCase()}${split[1][0].toLocaleUpperCase()}`
    }
    return split[0].substring(0, 2).toLocaleUpperCase()
  } else {
    return (
      user.firstname &&
      user.lastname &&
      `${user.firstname[0].toLocaleUpperCase()}${user.lastname[0].toLocaleUpperCase()}`
    )
  }
}
export const formatUserNameWithEmail = user => {
  if (user.firstname || user.lastname) {
    return formatFirstAndLastName(user) + ' (' + user.username + ')'
  } else {
    return user.username
  }
}

export const avatarInitials = user => {
  if (user.firstname && user.lastname) {
    return `${user.firstname[0].toUpperCase()}${user.lastname[0].toUpperCase()}`
  }
  if (user.firstname) {
    return `${user.firstname[0].toUpperCase()}`
  }
  const split = user.username?.split('@')[0].split('.')
  if (!split) {
    return ''
  }

  if (split.length > 1 && split[1] !== '') {
    return `${split[0][0].toLocaleUpperCase()}${split[1][0].toLocaleUpperCase()}`
  }
  return split[0].substring(0, 2).toLocaleUpperCase()
}

export const formatFirstAndLastName = user =>
  `${user.firstname} ${user.lastname}`

export const formatClientInitials = clientName => {
  if (!clientName) return ''
  return clientName
    .split(' ')
    .map(w => w[0])
    .join('')
    .substr(0, 3)
    .toLocaleUpperCase()
}
