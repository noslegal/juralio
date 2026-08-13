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

import { Avatar, Tooltip, Typography } from '@mui/material'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import PopUpMenu from '../../surfaces/pop-up-menu/PopUpMenu'
import UserAvatars from '../user/user-avatars/UserAvatars'
import UserHover from '../user/UserHover'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'inline-flex',
    width: 'auto',
    '&:hover': {
      backgroundColor: juralioColours.people.hover,
    },
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(1),
  },
  overflowAvatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundColor: JuralioNamedColours.beige.main,
    color: JuralioNamedColours.black[100],
    display: 'inline-flex',
    border: '2px solid #fff',
    marginLeft: '-6px',
    cursor: 'pointer',
    'z-index': '99 !important',
  },
  compact: {
    width: theme.spacing(3),
    height: theme.spacing(3),
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
  usersListContainer: {
    display: 'flex',
    right: theme.spacing(1),
    position: 'absolute',
    paddingTop: theme.spacing(1),
  },
  floatLeft: {
    left: theme.spacing(1),
  },
  noClickOverflow: {
    cursor: 'unset !important',
  },
  tooltip: {
    zIndex: 1,
    borderRadius: theme.spacing(0.5),
    width: '217px',
    fontSize: theme.typography.pxToRem(12),
    padding: 0,
  },
  tooltipContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: theme.spacing(1),
  },
  tooltipText: {
    width: theme.spacing(25),
    wordWrap: 'break-word',
  },
  tooltipButton: {
    textTransform: 'none',
    color: juralioColours.whiteText.secondary,
  },
  spacing: {
    width: theme.spacing(2),
  },
  cardWrapper: {
    position: 'absolute',
    zIndex: theme.zIndex.appBar + 1,
    minWidth: theme.spacing(50),
    maxWidth: theme.spacing(50),
    minHeight: theme.spacing(8),
    maxHeight: theme.spacing(50),
    overflowX: 'hidden',
    overflowY: 'auto',
    right: 0,
    width: '100%',
  },
  cardContent: {
    height: '100%',
    overflow: 'hidden',
    padding: '0 !important',
    width: '100%',
  },
  tooltipMatterText: {
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
  },
}))

const UsersControl = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  const { avatars } = props

  const renderTooltipContent = user => {
    return (
      <>
        <UserHover
          showRoles={props.showRoles}
          renderUsersList={props.renderUsersList}
          user={user}
          showList={props.showList}
          setShowList={props.setShowList}
        />
      </>
    )
  }

  const renderUserAvatars = () => {
    return (
      <div data-test="assignee-chip">
        <UserAvatars
          users={avatars.sort((a, b) => a.isPlaceholder - b.isPlaceholder)}
          tooltipOptions={{
            show: true,
            onClick: (e, user) => onTooltipClick(e, user),
            onClose: (e, user) => onTooltipClose(e, user),
            render: renderTooltipContent,
          }}
          onClick={() => props.setShowList(!props.showList)}
        />
      </div>
    )
  }

  const renderOverflowAvatar = () => {
    return (
      <>
        {props.overflowAvatars?.length > 0 && (
          <Tooltip title={t('people.clickToSeeAllNames')}>
            <Avatar
              className={classNames(classes.overflowAvatar, {
                [classes.compact]: props.compact,
                [classes.large]: props.large,
                [classes.medium]: props.medium,
                [classes.noClickOverflow]: !props.showTooltip,
              })}
              data-test="overflow-avatar"
              onClick={e => {
                e.stopPropagation()
                props.setShowList(!props.showList)
              }}
            >
              <Typography variant="caption" style={{ cursor: 'pointer' }}>
                {'+' + props.overflowAvatars.length}
              </Typography>
            </Avatar>
          </Tooltip>
        )}
      </>
    )
  }

  const renderUsersList = () => {
    return props.renderUsersList && props.showList ? (
      <>
        <div
          onClick={() => props.setShowList(false)}
          style={{
            backgroundColor: 'transparent',
            width: window.innerWidth,
            height: window.innerHeight,
            position: 'absolute',
            top: 0,
            left: -480,
            zIndex: 3,
          }}
        ></div>
        <PopUpMenu
          onClick={() => props.setShowList(!props.showList)}
          onCloseClick={() => props.setShowList(false)}
          customCss={classNames(
            classes.usersListContainer,
            props.floatLeft ? classes.floatLeft : null
          )}
        >
          {props.renderUsersList()}
        </PopUpMenu>
      </>
    ) : null
  }

  const setHover = (user, hover) => {
    props.setAvatars(
      avatars.map(aUser =>
        user.id === aUser.id ? { ...aUser, hidden: hover } : aUser
      )
    )
  }

  const onTooltipClick = (e, user) => {
    e.stopPropagation()
    setHover(user, true)
  }

  const onTooltipClose = (e, user) => {
    setHover(user, false)
  }

  if (!props.showAvatarList) {
    return null
  }

  if (!avatars) return null

  return avatars.length > 0 ? (
    <div className={classes.root} data-test="users-control">
      {renderUserAvatars()}
      {renderOverflowAvatar()}
      {renderUsersList()}
    </div>
  ) : (
    <div className={classes.spacing} />
  )
}

UsersControl.propTypes = {
  renderUsersList: PropTypes.func,
}

export default UsersControl
