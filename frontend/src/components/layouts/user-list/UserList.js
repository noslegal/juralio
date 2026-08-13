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

import { List, Tooltip, Typography } from '@mui/material'
import uniq from 'lodash/uniq'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { useUserDetailsData } from '../../../hooks/user-hooks'
import juralioColours from '../../../theme/juralio-colours'
import UserListItem from './UserListItem'
import UserHover from '../../data-display/user/UserHover'

const useStyles = makeStyles()(theme => ({
  root: {
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'auto',
    maxHeight: '100%',
    width: '100%',
  },
  roleTitle: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(2),
    color: juralioColours.darkText.secondary,
  },
}))

const normaliseUserList = users => {
  if (!users || users.length === 0) {
    return null
  }

  const result = []
  if (users[0].user) {
    users.forEach(user => {
      const displayUser = user.user
      // This is a slight fudge for different user lists in redux.
      if (user.matterViewerId) {
        displayUser.matterViewerId = user.matterViewerId
      }
      if (displayUser.matterViewerId === undefined) {
        displayUser.matterViewerId = 0
      }
      result.push(displayUser)
    })
    return uniq(result)
  }

  users.forEach(user => result.push(user))

  return result.filter(
    (value, index, self) => index === self.findIndex(t => t.id === value.id)
  )
}

const UserList = props => {
  const { classes } = useStyles()
  const currentUser = useUserDetailsData()
  const { users } = props
  const userList = normaliseUserList(users)
  const { t } = useTranslation()

  const renderList = user => {
    let onRemoveClickHandler = props.onRemoveClick
      ? user => props.onRemoveClick(user)
      : null

    if (!props.canRemoveSelf && user.id === currentUser.id) {
      onRemoveClickHandler = null
    } else if (props.preventLastItemRemoval === true && users.length <= 1) {
      onRemoveClickHandler = null
    }
    return (
      userList && (
        <Tooltip
          placement="right"
          slotProps={{
            tooltip: {
              sx: {
                backgroundColor: 'transparent',
              },
            },
          }}
          title={<UserHover user={user} />}
        >
          <div key={user.id} data-test="users-list">
            <UserListItem
              selectable={props.selectable}
              onSelect={props.onSelect}
              onRemoveClick={onRemoveClickHandler}
              user={user}
              matterContext={props.matterContext ? true : false}
              postContext={props.postContext ? true : false}
              hideRole={props.hideItemRole}
              viewOnly={props.viewOnly}
              addToAllSubtasks={props.addToAllSubtasks}
              hasChildren={
                props.task && props.task.tasks && props.task.tasks.length > 0
              }
              selectRemoval={props.selectRemoval}
              isPrivate={props.isPrivate}
              canRemoveSelf={true}
            />
          </div>
        </Tooltip>
      )
    )
  }

  if (props.showRoleHeadings) {
    const matterEditors = userList.filter(user =>
      user.matterViewerId !== undefined &&
      !user.isViewerOnMatter &&
      !user.isPlaceholder
        ? user.matterViewerId === 0
        : !user.isMatterViewer && !user.isViewerOnMatter && !user.isPlaceholder
    )
    const matterViewers = userList.filter(user =>
      user.matterViewerId !== undefined &&
      !user.isViewerOnMatter &&
      !user.isPlaceholder
        ? user.matterViewerId > 0
        : (user.isMatterViewer || user.isViewerOnMatter) && !user.isPlaceholder
    )
    const matterPlaceholders = userList.filter(user => user.isPlaceholder)

    return (
      <List className={classes.root}>
        {matterEditors.length > 0 && (
          <div data-test="matter-editors">
            <Typography
              variant="overline"
              className={classes.roleTitle}
              data-test="users-list-matter-editors"
            >
              {t('people.matterEditors')}
            </Typography>

            {matterEditors.map(user => renderList(user))}
          </div>
        )}
        {matterViewers.length > 0 && (
          <div data-test="matter-viewers">
            <Typography
              variant="overline"
              className={classes.roleTitle}
              data-test="users-list-matter-viewers"
            >
              {t('people.matterViewers')}
            </Typography>

            {matterViewers.map(user => renderList(user))}
          </div>
        )}
        {matterPlaceholders.length > 0 && (
          <div data-test="matter-placeholders">
            <Typography
              variant="overline"
              className={classes.roleTitle}
              data-test="users-list-matter-placeholders"
            >
              {t('people.Placeholders')}
            </Typography>

            {matterPlaceholders.map(user => renderList(user))}
          </div>
        )}
      </List>
    )
  }

  return (
    <List className={classes.root}>
      {userList?.map(user => renderList(user))}
    </List>
  )
}

UserList.propTypes = {
  onRemoveClick: PropTypes.func,
  canRemoveSelf: PropTypes.bool,
}

export default UserList
