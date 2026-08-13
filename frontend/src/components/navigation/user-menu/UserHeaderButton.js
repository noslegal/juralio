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

import HelpIcon from '@mui/icons-material/Help'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Button,
  Card,
  CardContent,
  ClickAwayListener,
  Divider,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { withStyles } from 'tss-react/mui'
import withRouter from '../../../services/navigation/WithRouter'
import organisationService from '../../../services/organisation/organisation-service'
import juralioColours from '../../../theme/juralio-colours'
import { SignOutIcon } from '../../../theme/navigation/CommonIcons'
import UserAvatar from '../../data-display/user/user-avatar/UserAvatar'

const styles = theme => ({
  container: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: 'fit-content',
    padding: '4px',
    cursor: 'pointer',
  },
  cardContainer: {
    position: 'absolute',
    left: 60,
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(),
    width: theme.spacing(35),
    cursor: 'auto',
    bottom: 0,
  },
  userDetailsContainer: {
    display: 'flex',
  },
  userDetailsInfoContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(),
  },
  userName: {
    fontSize: '14px',
    color: juralioColours.darkText.primary,
    whiteSpace: 'nowrap',
    width: theme.spacing(27),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  orgName: {
    fontSize: theme.spacing(1.5),
    color: juralioColours.darkText.secondary,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    float: 'left',
    width: '100%',
  },
  divider: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
    maxWidth: 248,
  },
  menuButton: {
    justifyContent: 'flex-start',
    color: juralioColours.darkText.primary,
    textTransform: 'none',
    width: theme.spacing(31),
    fontWeight: 'unset !important',
  },
  icon: {
    fill: juralioColours.named.black[100],
  },
})

const UserDetailsDropdownItem = props => {
  return (
    <div className={props.classes.userDetailsContainer}>
      <UserAvatar user={props.user} />
      <div
        className={props.classes.userDetailsInfoContainer}
        data-test="user-header-user-info-section"
      >
        <Typography className={props.classes.userName}>
          {props.user.firstname} {props.user.lastname}
        </Typography>
        {props.org && (
          <Typography className={props.classes.orgName}>{props.org}</Typography>
        )}
      </div>
    </div>
  )
}

const UserHeaderDropdown = props => {
  const { t } = useTranslation()

  return (
    <ClickAwayListener
      mouseEvent="onMouseDown"
      touchEvent="onTouchStart"
      onClickAway={e => setTimeout(() => props.close(e), 200)}
    >
      <Card
        className={props.classes.cardContainer}
        data-test="user-header-dropdown-menu"
      >
        <CardContent className={props.classes.cardContent}>
          <UserDetailsDropdownItem
            user={props.user}
            classes={props.classes}
            org={props.org}
          />
          <Divider className={props.classes.divider} />
          <Button
            fullWidth={true}
            className={props.classes.menuButton}
            component={Link}
            to={'/personalSettings'}
            onClick={props.close}
            startIcon={<SettingsIcon className={props.classes.icon} />}
            data-test="user-header-settings-menu-button"
          >
            {t('navigationLinks.settings')}
          </Button>
          <Button
            fullWidth={true}
            className={props.classes.menuButton}
            component={Link}
            to={'/how-to-use'}
            onClick={props.close}
            startIcon={<HelpIcon className={props.classes.icon} />}
            data-test="user-header-help-menu-button"
          >
            {t('navigationLinks.howToUse')}
          </Button>
          <Button
            fullWidth={true}
            className={props.classes.menuButton}
            component={Link}
            to={'/logout'}
            startIcon={<SignOutIcon className={props.classes.icon} />}
            data-test="user-header-logout-menu-button"
          >
            {t('navigationLinks.logout')}
          </Button>
        </CardContent>
      </Card>
    </ClickAwayListener>
  )
}

const UserHeaderButton = props => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [org, setOrg] = useState(undefined)

  useEffect(() => {
    organisationService.getCurrentOrganisation().then(res => {
      if (res.status === 200) {
        setOrg(res.body.name)
      }
    })
  }, [])

  const closeDropdown = event => {
    event.stopPropagation()
    setShowDropdown(false)
  }

  return (
    <div
      className={props.classes.container}
      onClick={() => !showDropdown && setShowDropdown(true)}
      data-test="user-header-navigation-button"
    >
      <UserAvatar user={props.user} />

      {showDropdown && (
        <UserHeaderDropdown
          isOrgAdmin={props.isOrgAdmin}
          location={props.router.location}
          user={props.user}
          classes={props.classes}
          close={closeDropdown}
          org={org}
        />
      )}
    </div>
  )
}

export default withRouter(withStyles(UserHeaderButton, styles))
