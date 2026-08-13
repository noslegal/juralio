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
import { Tooltip } from '@mui/material'
import React, { useRef, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import InactiveAvatar from '../user-avatar/InactiveAvatar'
import UserAvatar from '../user-avatar/UserAvatar'
import PlaceholderAvatar from '../../placeholders/PlaceholderAvatar'

const useStyles = makeStyles()(theme => ({
  tooltip: {
    zIndex: 1,
    borderRadius: theme.spacing(0.5),
    width: '217px',
    fontSize: theme.typography.pxToRem(12),
    padding: 0,
  },
  tooltipWrapper: {
    border: 'none',
  },
}))

const UserTooltip = ({ user, classes, tooltipOptions, onClick }) => {
  const [open, setOpen] = useState(false)
  const closeTimerRef = useRef(null)
  const u = user.user ? user.user : user

  const scheduleClose = () => {
    closeTimerRef.current = setTimeout(() => setOpen(false), 150)
  }

  const cancelClose = () => {
    clearTimeout(closeTimerRef.current)
  }

  return (
    <Tooltip
      open={open}
      onClose={() => setOpen(false)}
      classes={{ tooltip: classes.tooltip }}
      title={
        tooltipOptions.show ? (
          <div onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
            {tooltipOptions.render(user)}
          </div>
        ) : (
          ''
        )
      }
      data-test={'tool-tip-' + u.firstname}
    >
      <div
        className={classes.tooltipWrapper}
        onMouseEnter={() => {
          cancelClose()
          setOpen(true)
        }}
        onMouseLeave={scheduleClose}
        onClick={e => {
          e.stopPropagation()
          // Clicking the avatar opens the people popover, so close the hover
          // card — otherwise its popper lingers and overlays the popover's
          // controls (e.g. the delete icon).
          setOpen(false)
          onClick()
        }}
        data-test="visible-user-avatar"
      >
        {u.enabled && !u.isPlaceholder ? (
          <UserAvatar postfixDataTest={true} user={u} />
        ) : !u.isPlaceholder ? (
          <InactiveAvatar user={u} />
        ) : (
          <PlaceholderAvatar placeholderName={u.firstname + ' ' + u.lastname} />
        )}
      </div>
    </Tooltip>
  )
}

const UserAvatars = props => {
  const { classes } = useStyles()

  const getUser = user => (user.user ? user.user : user)
  if (!props.users) return null

  return (
    <AvatarGroup max={100} spacing={6} data-test="avatar-group">
      {Object.values(props.users).map(user => (
        <UserTooltip
          key={'tooltip-' + getUser(user).id}
          user={user}
          classes={classes}
          tooltipOptions={props.tooltipOptions}
          onClick={props.onClick}
        />
      ))}
    </AvatarGroup>
  )
}

export default UserAvatars
