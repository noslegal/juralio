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

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { withStyles } from 'tss-react/mui'
import watermark from '../assets/images/juralio-watermark.svg'
import navigationBackgroundStyles from '../components/navigation/common/navigation-background-styles'
import NavFab from '../components/navigation/fab-button/NavFab'
import GlobalHeader from '../components/navigation/global-header/GlobalHeader'
import KeepAlive from '../components/utils/keep-alive/KeepAlive'
import NotificationFetcher from '../components/utils/notification-fetcher/NotificationFetcher'
import { getInstanceSettings } from '../redux/actions/instance-management-actions'
import TourContainer from '../services/tour/TourContainer'
import {
  isOrgAdmin,
  isOrgOwner,
  isSysAdmin,
} from '../services/user/helper/user-role-service'
import { JuralioNamedColours } from '../theme/juralio-named-colours'
import GlobalConfirmationDialog from './global-confirmation-dialog/GlobalConfirmationDialog'
import GlobalSnackbar from './global-snackbar/GlobalSnackbar'
import AdminRoutes from './routes/AdminRoutes'
import StandardUserRoutes from './routes/StandardUserRoutes'
import TaskAssigneesPopOverContainer from './task-map/task-assignees/TaskAssigneesPopOverContainer'
import OrgWarningBannerContainer from './warning-banner/OrgWarningBannerContainer'
import { useLocation } from 'react-router'
import { updateTitle } from '../helpers/title-helper'
import LeftHandNav from '../components/navigation/global-header/LeftHandNav'

const styles = theme => ({
  root: {
    display: 'flex',
    height: '100%',

    position: 'relative',
    background: JuralioNamedColours.beige[200],
    flexDirection: 'column',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: navigationBackgroundStyles.opacity,
    background: `url(${navigationBackgroundStyles.image})`,
    backgroundSize: navigationBackgroundStyles.size,

    [theme.breakpoints.down('md')]: {
      backgroundPositionX: navigationBackgroundStyles.mobilePositionX,
      backgroundPositionY: navigationBackgroundStyles.mobilePositionY,
    },
  },
  watermark: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.45,
    background: `url(${watermark})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right -12px',
  },
  navAndContent: {
    height: '100%',
    display: 'inline-flex',
    overflow: 'hidden',
  },
  subheaderAndBody: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flex: '1 1 0px',
    flexDirection: 'column',
    minWidth: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  bodyContent: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    overflow: 'auto',
  },
  leftHandNav: {
    zIndex: '1200',
  },
})

const App = props => {
  const dispatch = useDispatch()
  const { classes, isLoggedIn } = props
  const authData = useSelector(state => state.auth.data.auth)
  const details = useSelector(state => state.auth.data.details)

  const _isSysAdmin = isSysAdmin(authData)
  const _isOrgAdmin = isOrgAdmin(authData)
  const _isOrgOwner = isOrgOwner(authData)
  const auth = useSelector(state => state.auth)
  const state = useSelector(state => state)

  const location = useLocation()
  useEffect(() => {
    updateTitle()
  }, [location.pathname, state])

  const currentUser = auth.data.details
  const [showFab, setShowFab] = useState(true)

  useEffect(() => {
    dispatch(getInstanceSettings())
  }, []) //eslint-disable-line

  return !isLoggedIn ? null : (
    <div className={classes.root}>
      <OrgWarningBannerContainer
        _isOrgAdmin={_isOrgAdmin}
        _isOrgOwner={_isOrgOwner}
        details={details}
      />
      <TourContainer />
      <KeepAlive />
      <div className={classes.backgroundImage} />

      <div className={classes.watermark} />

      <GlobalSnackbar />
      <TaskAssigneesPopOverContainer />

      <GlobalConfirmationDialog />

      <div className={classes.navAndContent}>
        <div className={classes.leftHandNav}>
          <LeftHandNav
            isSysAdmin={_isSysAdmin}
            isOrgAdmin={_isOrgAdmin}
            user={currentUser}
            setShowFab={setShowFab}
            showFab={showFab}
          />
        </div>

        <div
          className={classes.subheaderAndBody}
          data-test="scrolling-content-frame"
        >
          <GlobalHeader
            isSysAdmin={_isSysAdmin}
            isOrgAdmin={_isOrgAdmin}
            user={currentUser}
            showFab={setShowFab}
          />
          {showFab && _isSysAdmin && (
            <NavFab mobile={false} inSysadmin={true} />
          )}

          {!_isSysAdmin && <NotificationFetcher />}

          <div
            className={classes.bodyContent}
            data-test="scrolling-content-frame"
          >
            {_isSysAdmin ? (
              <AdminRoutes redirect={props.redirect} />
            ) : (
              <StandardUserRoutes
                redirect={props.redirect}
                _state={props._state}
                clearMagicLink={props.clearMagicLink}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default withStyles(App, styles)
