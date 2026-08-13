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

import ClearIcon from '@mui/icons-material/Clear'
import { IconButton, ListItem, ListItemText, Typography } from '@mui/material'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { withStyles } from 'tss-react/mui'
import { useIsViewOnly } from '../../../hooks/matter/viewer/matter-viewer-hooks'
import {
  formatUserDisplayName,
  getUserAuthorisationStatus,
} from '../../../services/user/helper/user-format-service'
import withUser from '../../../services/with-user/WithUser'
import juralioColours from '../../../theme/juralio-colours'
import InactiveAvatar from '../../data-display/user/user-avatar/InactiveAvatar'
import UserAvatar from '../../data-display/user/user-avatar/UserAvatar'
import LightButton from '../../inputs/light-button/LightButton'
import PlaceholderAvatar from '../../data-display/placeholders/PlaceholderAvatar'

const styles = theme => ({
  text: {
    marginLeft: theme.spacing(),
    display: 'flex',
    flexDirection: 'column',
  },
  disabledText: {
    color: juralioColours.darkText.secondary,
  },
  selectable: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: juralioColours.listItem.hoverBackground,
    },
  },
  alsoOn: {
    fontSize: theme.spacing(1.25),
    fontStyle: 'italic',
  },
})

const UserListItem = props => {
  const matter = useSelector(state => state.matterDetails.matter)
  const isMatterViewer = useIsViewOnly(matter)
  const ref = useRef()
  const { t } = useTranslation()

  const getUserIsActive = () => {
    if (props.isPrivate) {
      return props.user.enabled && props.user.isActiveOnWorkstream
    } else if (props.matterContext) {
      return props.user.enabled && props.user.isActiveOnMatter
    } else {
      if (props.user.isActiveOnWorkstream === undefined) {
        return props.user.enabled
      } else {
        return (
          props.user.enabled &&
          props.user.isActiveOnMatter &&
          props.user.isActiveOnWorkstream
        )
      }
    }
  }

  const userIsActive = getUserIsActive()

  const hideAuthorisationStatus = props.hideRole
  return (
    <div data-test="user-list-item">
      <ListItem
        className={props.selectable ? props.classes.selectable : null}
        onClick={() => {
          props.selectable && props.onSelect(props.user)
        }}
      >
        {userIsActive === true && !props.user.isPlaceholder && (
          <>
            <UserAvatar user={props.user} />
            <ListItemText
              data-test="name-text"
              className={props.classes.text}
              primary={
                <Typography className={props.classes.primary} variant="caption">
                  {props.userData.id === props.user.id
                    ? t('entity.currentUser') +
                      (props.user.isExternal ? ' (external)' : '')
                    : formatUserDisplayName(props.user)}
                </Typography>
              }
              secondary={
                hideAuthorisationStatus ? null : (
                  <Typography
                    variant="caption"
                    className={props.classes.disabledText}
                  >
                    {getUserAuthorisationStatus(props.user, t)}
                  </Typography>
                )
              }
            />
          </>
        )}
        {userIsActive === false &&
          props.user.enabled === true &&
          props.user.isActiveOnMatter === false &&
          !props.user.isPlaceholder && (
            <>
              <UserAvatar user={props.user} />
              <ListItemText
                data-test="name-text"
                className={props.classes.text}
                primary={
                  <Typography
                    className={props.classes.primary}
                    variant="caption"
                  >
                    {formatUserDisplayName(props.user)}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="caption"
                    className={props.classes.disabledText}
                  >
                    {t('UserListItem.NotMTM')}
                  </Typography>
                }
              />
            </>
          )}
        {userIsActive === false &&
          props.user.enabled === true &&
          props.user.isActiveOnMatter === true &&
          props.user.isActiveOnWorkstream === false &&
          !props.user.isPlaceholder && (
            <>
              <UserAvatar user={props.user} />
              <ListItemText
                data-test="name-text"
                className={props.classes.text}
                primary={
                  <Typography
                    className={props.classes.primary}
                    variant="caption"
                  >
                    {formatUserDisplayName(props.user)}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="caption"
                    className={props.classes.disabledText}
                  >
                    {t('UserListItem.NotInWorkstream')}
                  </Typography>
                }
              />
            </>
          )}
        {userIsActive === false &&
          props.user.enabled === false &&
          !props.user.isPlaceholder && (
            <>
              <InactiveAvatar user={props.user} />
              <ListItemText
                data-test="name-text"
                className={props.classes.text}
                primary={
                  <Typography className={props.classes.disabledText}>
                    {formatUserDisplayName(props.user)}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="caption"
                    className={props.classes.disabledText}
                  >
                    {t('UserListItem.Inactive')}
                  </Typography>
                }
              />
            </>
          )}
        {props.user.isPlaceholder && (
          <>
            <PlaceholderAvatar
              placeholderName={formatUserDisplayName(props.user)}
            />
            <ListItemText
              data-test="name-text"
              className={props.classes.text}
              primary={
                <Typography className={props.classes.disabledText}>
                  {formatUserDisplayName(props.user)}
                </Typography>
              }
            />
          </>
        )}

        {props.onRemoveClick &&
          props.hasChildren &&
          props.addToAllSubtasks &&
          !props.user.isOnAllSubtasks &&
          !props.postContext &&
          !isMatterViewer &&
          !props.viewOnly && (
            <LightButton
              isNotStarted={true}
              caption={t('UserListItem.addToSubtasks')}
              clickHandler={() => props.addToAllSubtasks(props.user)}
              viewOnly={false}
              data-test={'add-to-all-subtasks'}
            />
          )}
        {props.onRemoveClick &&
          props.hasChildren &&
          props.addToAllSubtasks &&
          props.user.isOnAllSubtasks &&
          !props.postContext &&
          !isMatterViewer &&
          !props.viewOnly && (
            <Typography
              className={props.classes.alsoOn}
              data-test="also-on-info-text"
            >
              {t('UserListItem.onAllSubtasks')}
            </Typography>
          )}
        {props.onRemoveClick &&
          !props.postContext &&
          !isMatterViewer &&
          !props.viewOnly && (
            <IconButton
              data-test="delete-icon"
              onClick={() => {
                if (
                  props.user.isOnSomeSubtasks ||
                  (props.placeholder && props.placeholder.isOnSomeSubtasks)
                ) {
                  props.selectRemoval(props.user, ref)
                } else {
                  props.onRemoveClick(props.user)
                }
              }}
              size="large"
              ref={ref}
            >
              <ClearIcon />
            </IconButton>
          )}
        {props.userData.id !== props.user.id &&
          !isMatterViewer &&
          props.postContext &&
          props.onRemoveClick && (
            <IconButton
              data-test="delete-icon"
              onClick={() => {
                props.onRemoveClick(props.user)
              }}
              size="large"
              ref={ref}
            >
              <ClearIcon />
            </IconButton>
          )}
      </ListItem>
    </div>
  )
}

export default withUser(withStyles(UserListItem, styles))
