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

import { AvatarGroup } from '@mui/material'
//import { Tooltip } from '@mui/material'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import UserAvatar from '../../data-display/user/user-avatar/UserAvatar'
import PlaceholderAvatar from '../../data-display/placeholders/PlaceholderAvatar'
import InactiveAvatar from '../../data-display/user/user-avatar/InactiveAvatar'

const useStyles = makeStyles()(theme => ({
  tooltipWrapper: {
    border: 'none',
  },
}))

const ListAvatars = props => {
  const { classes } = useStyles()
  if (!props.users) return null

  return (
    <AvatarGroup max={100} spacing={6} data-test="avatar-group">
      {Object.values(props.users).map(user => {
        const u = user.user ? user.user : user

        return (
          <div
            className={classes.tooltipWrapper}
            data-test="visible-user-avatar" // Used to count displayed avatars.
          >
            {u.enabled && !u.isPlaceholder ? (
              <UserAvatar compact postfixDataTest={true} user={u} />
            ) : !u.isPlaceholder ? (
              <InactiveAvatar compact user={u} />
            ) : (
              <PlaceholderAvatar
                compact
                placeholderName={u.firstname + ' ' + u.lastname}
              />
            )}
          </div>
        )
      })}
    </AvatarGroup>
  )
}

export default ListAvatars
