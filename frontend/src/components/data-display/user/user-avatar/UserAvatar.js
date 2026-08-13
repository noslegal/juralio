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

import CreateIcon from '@mui/icons-material/Create'
import { Avatar, Typography } from '@mui/material'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import { avatarInitials } from '../../../../services/user/helper/user-format-service'
import colorModifiers from '../../../../theme/color-modifiers'
import {
  JuralioAvatarColours,
  JuralioNamedColours,
} from '../../../../theme/juralio-named-colours'
import rawColours from '../../../../theme/raw-colours'
import { avatarImages } from '../avatars/avatar-helper'

const useStyles = makeStyles()(theme => ({
  root: {
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
    backgroundColor: JuralioNamedColours.black[100],
    color: 'white',
    display: 'inline-flex',
    alignItems: 'center',
  },
  noBorder: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  compact: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    border: `2px solid ${theme.palette.common.white}`,
  },
  small: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    border: `2px solid ${theme.palette.common.white}`,
  },
  medium: {
    width: theme.spacing(5.5),
    height: theme.spacing(5.5),
    border: `2px solid ${theme.palette.common.white}`,
  },
  large: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    border: `2px solid ${theme.palette.common.white}`,
  },
  extraLarge: {
    width: theme.spacing(12),
    height: theme.spacing(12),
    border: `2px solid ${theme.palette.common.white}`,
  },
  autoAvatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundSize: `${theme.spacing(4)} ${theme.spacing(4)}`,
    backgroundRepeat: 'no-repeat',
    '&:hover': {
      cursor: 'pointer',
    },
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  autoAvatarCompact: {
    width: theme.spacing(2),
    height: theme.spacing(2),
    backgroundSize: `${theme.spacing(2)} ${theme.spacing(2)}`,
  },
  autoAvatarMedium: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    backgroundSize: `${theme.spacing(3)} ${theme.spacing(3)}`,
  },
  autoAvatarLarge: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundSize: `${theme.spacing(4)} ${theme.spacing(4)}`,
  },
  autoAvatarExtraLarge: {
    width: theme.spacing(10),
    height: theme.spacing(10),
    backgroundSize: `${theme.spacing(10)} ${theme.spacing(10)}`,
  },
  initials: {
    color: rawColours.text.black,
  },
  initialsCompact: {
    fontSize: theme.spacing(2),
  },
  initialsMedium: {
    fontSize: theme.spacing(3),
  },
  initialsLarge: {
    fontSize: theme.spacing(3),
  },
  initialsExtraLarge: {
    fontSize: theme.spacing(5),
  },
  editIcon: {
    fill: colorModifiers.activeAction(rawColours.primary.black.black),
    zIndex: 1,
    width: '80%',
    height: '80%',
    padding: '10%',
    position: 'absolute',
    top: '0px',
    left: '0px',
  },
}))

const UserAvatar = props => {
  const { user, compact, large, medium, small, noBorder, extraLarge } = props
  const { classes } = useStyles()
  const [hover, setHover] = useState(false)
  if (!user) return null
  return (
    <Avatar
      className={classNames(classes.root, {
        [classes.noBorder]: noBorder,
        [classes.compact]: compact,
        [classes.large]: large,
        [classes.extraLarge]: extraLarge,
        [classes.medium]: medium,
        [classes.small]: small,
      })}
      data-test={`user-avatar${
        props.postfixDataTest ? `-${user.firstname}-${user.lastname}` : ''
      }`}
      style={JuralioAvatarColours[user.avatarColorIndex]}
      onMouseOver={() => (props.editable ? setHover(true) : null)}
      onMouseLeave={() => (props.editable ? setHover(false) : null)}
      onClick={() => (props.editable ? props.onClick() : null)}
    >
      <div
        className={classNames(classes.autoAvatar, {
          [classes.autoAvatarCompact]: compact,
          [classes.autoAvatarLarge]: large,
          [classes.autoAvatarExtraLarge]: extraLarge,
          [classes.autoAvatarMedium]: medium,
        })}
        style={
          user.avatarImageIndex !== -1 && !user.isExternal
            ? {
                backgroundImage: `url(${avatarImages[user.avatarImageIndex]})`,
              }
            : {}
        }
        data-test={`${user.firstname}-${user.lastname}`}
      >
        {user.avatarImageIndex !== -1 ? ' ' : ''}
        {(user.avatarImageIndex === -1 || user.isExternal) && (
          <Typography
            data-test="avatar-initials"
            className={classNames(classes.initials, {
              [classes.initialsCompact]: compact,
              [classes.initialsLarge]: large,
              [classes.initialsExtraLarge]: extraLarge,
              [classes.initialsMedium]: medium,
            })}
          >
            {avatarInitials(user)}
          </Typography>
        )}
        {hover && <CreateIcon className={classes.editIcon} />}
      </div>
    </Avatar>
  )
}

UserAvatar.propTypes = {
  user: PropTypes.object.isRequired,
}

export default UserAvatar
