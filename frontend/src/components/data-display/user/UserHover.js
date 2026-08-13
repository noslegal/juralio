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

import { Typography, Button, Paper, Tooltip } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import UserAvatar from './user-avatar/UserAvatar'
import { useTranslation } from 'react-i18next'
import juralioColours from '../../../theme/juralio-colours'
import { formatUserDisplayName } from '../../../services/user/helper/user-format-service'
import PlaceholderAvatar from '../placeholders/PlaceholderAvatar'
import { useSelector } from 'react-redux'
import GroupAvatar from '../../layouts/manage-users/GroupAvatar'

const useStyles = makeStyles()(theme => ({
  tooltip: {
    zIndex: 1,
    borderRadius: theme.spacing(0.5),
    width: '300px',
    maxHeight: '200px',
    fontSize: theme.typography.pxToRem(12),
    padding: 0,
    backgroundColor: 'white',
    color: juralioColours.darkText.primary,
  },
  tooltipContent: {
    padding: theme.spacing(1),
  },
  tooltipText: {
    width: theme.spacing(28),
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    display: 'inline-block',
  },
  tooltipTextGrey: {
    width: theme.spacing(28),
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    display: 'inline-block',
    color: juralioColours.darkText.secondary,
  },
  tooltipButtonText: {
    textTransform: 'none',
    color: juralioColours.darkText.secondary,
  },
  tooltipButton: {
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'block',
  },
  rolesWrapper: {
    marginLeft: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  rolesHeader: {
    backgroundColor: '#D9D9D94D',
    borderRadius: theme.spacing(0.75),
  },
  tooltipTextWrapper: {
    marginLeft: theme.spacing(1),
  },
  avatarWrapper: {
    alignContent: 'center',
    position: 'relative',
  },
  groupLogoBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  },
  tooltipWrapper: {
    display: 'flex',
  },
  paper: { width: '300px' },
}))

const UserHover = props => {
  const { user } = props
  const { classes } = useStyles()
  const { t } = useTranslation()

  const getUser = user => (user.user ? user.user : user)

  const convertRolesToString = user => {
    let string = ''
    if (user.matterViewerId > 0) {
      string = string.concat(t('common.view'))
    }
    if (user.teamMemberId > 0) {
      if (string !== '') {
        string = string.concat(' + ')
      }
      string = string.concat(t('common.edit'))
    }
    if (user.matterAdminId > 0) {
      if (string !== '') {
        string = string.concat(' + ')
      }
      string = string.concat(t('common.admin'))
    }
    if (user.costsId > 0) {
      if (string !== '') {
        string = string.concat(' + ')
      }
      string = string.concat(t('common.costs'))
    }

    return string
  }

  const group = user?.organisationGroup
  const positionsOfGroups = useSelector(
    state => state.matterDetails?.overview?.positionsOfGroups
  )
  const userPosition = positionsOfGroups?.find(
    item => item.group?.id === group?.id
  )?.position?.name

  const name = formatUserDisplayName(getUser(user))

  const username = getUser(user).email
    ? getUser(user).email
    : getUser(user).username

  const usernameNoName = name === username

  return (
    <Paper className={classes.paper} elevation={8}>
      <div className={classes.tooltip}>
        <div className={classes.tooltipContent}>
          <div className={classes.tooltipWrapper}>
            <div className={classes.avatarWrapper}>
              {getUser(user).isPlaceholder ? (
                <PlaceholderAvatar
                  large={true}
                  placeholderName={
                    getUser(user).firstname + ' ' + getUser(user).lastname
                  }
                />
              ) : (
                <UserAvatar large={true} user={getUser(user)} />
              )}
              {group && (
                <div className={classes.groupLogoBadge}>
                  <GroupAvatar
                    group={group}
                    orgId={group.organisationId}
                    sx={{ width: '100%', height: '100%', borderRadius: '4px' }}
                  />
                </div>
              )}
            </div>

            <div className={classes.tooltipTextWrapper}>
              <Typography
                variant="h6"
                data-test={`tooltip-text-${getUser(user).id}`}
                className={classes.tooltipText}
              >
                {name}
              </Typography>

              <Tooltip title={username}>
                <Typography
                  className={
                    username && usernameNoName !== true
                      ? classes.tooltipText
                      : classes.tooltipTextGrey
                  }
                >
                  {username && usernameNoName !== true
                    ? username
                    : usernameNoName
                      ? t('userHover.noName')
                      : t('userHover.noEmail')}
                </Typography>
              </Tooltip>

              <Typography className={classes.tooltipText}>
                {user?.organisationGroup?.name
                  ? user?.organisationGroup?.name
                  : 'Group go here'}
              </Typography>
            </div>
          </div>
          {props.showRoles && (
            <div className={classes.rolesHeader}>
              <div className={classes.rolesWrapper}>
                <Typography
                  className={classes.tooltipMatterText}
                  variant="caption"
                >
                  {t('common.thisMatter')}
                </Typography>
                {userPosition && (
                  <Typography
                    className={classes.tooltipMatterText}
                    variant="h6"
                  >
                    {userPosition}
                  </Typography>
                )}
                <Typography
                  data-test={`tooltip-role-${getUser(user).id}`}
                  className={classes.tooltipMatterText}
                  variant="body1"
                >
                  {convertRolesToString(user)}
                </Typography>
              </div>
            </div>
          )}

          {props.renderUsersList && (
            <Button
              className={classes.tooltipButton}
              variant="text"
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                props.setShowList(!props.showList)
              }}
              data-test={`tooltip-button-${getUser(user).id}`}
            >
              <Typography
                data-test="see-all-team"
                variant="caption"
                className={classes.tooltipButtonText}
              >
                {t('people.clickToSeeAllNames')}
              </Typography>
            </Button>
          )}
        </div>
      </div>
    </Paper>
  )
}

export default UserHover
