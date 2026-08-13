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
import { makeStyles } from 'tss-react/mui'
import {
  isAdmin,
  isEditor,
  isViewer,
} from '../../../services/helpers/user/user-roles-helper'
import juralioColours from '../../../theme/juralio-colours'
import UserList from '../../layouts/user-list/UserList'

const useStyles = makeStyles()(theme => ({
  roleTitle: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(2),
    color: juralioColours.darkText.secondary,
  },
  zeroStateText: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    color: juralioColours.darkText.secondary,
  },
}))

const RolesUsersList = props => {
  const { users } = props
  const { classes } = useStyles()
  const { t } = useTranslation()
  const matterEditors = users.filter(user => isEditor(user))
  const matterAdmins = users.filter(user => isAdmin(user))
  const matterViewers = users.filter(user => isViewer(user))
  const placeholders = users.filter(user => user.isPlaceholder)

  const onClickDeletePerson = () => {}

  const renderZeroState = (dataTest, text) => {
    return (
      <Typography data-test={dataTest} className={classes.zeroStateText}>
        {text}
      </Typography>
    )
  }
  const renderUsersList = (users, hideItemRole) => (
    <UserList
      users={users}
      onClickDeletePerson={onClickDeletePerson}
      hideItemRole={hideItemRole}
      onRemoveClick={null}
      canRemoveSelf={true}
    />
  )
  return (
    <>
      <Typography
        variant="overline"
        className={classes.roleTitle}
        data-test="users-list-matter-admins"
      >
        {t('people.matterAdmins')}
      </Typography>
      {matterAdmins.length > 0
        ? renderUsersList(matterAdmins)
        : renderZeroState(
            'matter-admins-zero-state',
            t('people.matterAdminsZeroState')
          )}
      <Typography
        variant="overline"
        className={classes.roleTitle}
        data-test="users-list-matter-editors"
      >
        {t('people.matterEditors')}
      </Typography>
      {matterEditors.length > 0
        ? renderUsersList(matterEditors)
        : renderZeroState(
            'matter-editors-zero-state',
            t('people.matterEditorsZeroState')
          )}
      <Typography
        variant="overline"
        className={classes.roleTitle}
        data-test="users-list-matter-viewers"
      >
        {t('people.matterViewers')}
      </Typography>
      {matterViewers.length > 0
        ? renderUsersList(matterViewers, true)
        : renderZeroState(
            'matter-viewers-zero-state',
            t('people.matterViewersZeroState')
          )}
      <Typography
        variant="overline"
        className={classes.roleTitle}
        data-test="users-list-placeholders"
      >
        {t('people.Placeholders')}
      </Typography>
      {placeholders.length > 0
        ? renderUsersList(placeholders)
        : renderZeroState(
            'matter-placeholders-zero-state',
            t('people.matterEditorsZeroState')
          )}
      {props.showFullUsersOverflow &&
        (users.length > 0
          ? renderUsersList(users)
          : renderZeroState(
              'team-members-zero-state',
              t('people.teamMembersZeroState')
            ))}
    </>
  )
}

export default RolesUsersList
