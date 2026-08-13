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

import React from 'react'
import { makeStyles } from 'tss-react/mui'
import { USER_ROLES } from '../../../app/constants'
import commonNavLinks from '../../../theme/navigation/common-nav-links'
import {
  OrganisationsUsersIcon,
  TemplatesIcon,
} from '../../../theme/navigation/CommonIcons'
import NavigationMenu from '../common/NavigationMenu'
import NavFab, { buttonHeight } from '../fab-button/NavFab'

const upperNavigationLinks = {
  home: commonNavLinks.home,
  templates: {
    linkText: 'navigationLinks.templates',
    linkLocation: '/templates',
    icon: TemplatesIcon,
    dataTest: 'templates',
    excludesRole: USER_ROLES.ROLE_SYS_ADMIN,
  },
}

const lowerNavigationLinks = {
  organisationUsers: {
    linkText: 'navigationLinks.organisation',
    linkLocation: '/organisation',
    icon: OrganisationsUsersIcon,
    requiresRole: USER_ROLES.ROLE_ORG_ADMIN,
    dataTest: 'organisation',
  },
  signOut: commonNavLinks.signOut,
}

const useStyles = makeStyles()(() => ({
  upper: {
    flex: '5 0 auto',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  lower: {
    flex: '0 0 auto',
  },
  spacer: {
    flex: '1 1 0px',
  },
  navMenuContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    flex: '1 1 0px',
    overflow: 'hidden',
  },
  navSpacer: {
    flex: `0 0 ${buttonHeight}px`,
  },
}))

const UpperNavMenu = props => {
  const { classes } = useStyles()
  const links = Object.values(upperNavigationLinks)
  return (
    <div className={classes.upper}>
      <NavigationMenu displayTooltips={props.displayTooltips} links={links} />
    </div>
  )
}

const LowerNavMenu = props => {
  const { classes } = useStyles()
  const links = Object.values(lowerNavigationLinks)

  return (
    <div className={classes.lower}>
      <NavigationMenu
        displayTooltips={props.displayTooltips}
        links={[
          ...links,
          {
            linkText: props.open
              ? 'navigationLinks.collapse'
              : 'navigationLinks.expand',
            icon: props.open
              ? commonNavLinks.header.closeMenuIcon
              : commonNavLinks.header.menuIcon,
            onClick: props.open ? props.closeDrawer : props.openDrawer,
            dataTest: props.open ? 'collapse' : 'expand',
          },
        ]}
        lower
      />
    </div>
  )
}

const NavColumn = props => {
  const { classes } = useStyles()

  return (
    <div
      className={classes.navMenuContainer}
      data-test="navigation-menu"
      onClick={props.closeOnNavigate ? props.handleDrawerClose : undefined}
    >
      <UpperNavMenu displayTooltips={!props.open} />
      {props.inlineFab ? (
        <NavFab mobile={false} drawerOpen={props.open} />
      ) : (
        <div className={classes.navSpacer} />
      )}
      <div className={classes.spacer} />
      <LowerNavMenu
        displayTooltips={!props.open}
        open={props.open}
        openDrawer={props.handleDrawerOpen}
        closeDrawer={props.handleDrawerClose}
      />
    </div>
  )
}

export default NavColumn
