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
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { withStyles } from 'tss-react/mui'
import HomeScreenFtue from '../../components/data-display/ftue/home/HomeScreenFtue'
import { gettingStartedTutorialSteps } from '../../services/tour/steps/getting-started-tutorial-steps'
import { setTour } from '../../services/tour/tour-actions'
import { getDetailsAttribute } from '../../services/user/user-data-service'
import DesktopHomeLayout from './DesktopHomeLayout'

const styles = theme => ({
  root: {
    flex: 1,
    flexDirection: 'row',
    display: 'flex',

    /* render the recent tasks list, then the inbox on mobile (design is WIP, this may change) */
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  },
})

const Home = props => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const instanceSettings = useSelector(state => state.instanceSettings)
  const user = useSelector(state => state.auth.data.details)

  const [showSplashScreen, setShowSplashScreen] = useState(
    instanceSettings.settings.showFirstLoginSplashScreen !== false &&
      getDetailsAttribute(['isFirstLogin']) &&
      window.localStorage.getItem('hideSplash') !== 'true'
  )

  useEffect(() => {
    handleSplashClose()
  }, [instanceSettings.settings.showFirstLoginSplashScreen, user]) //eslint-disable-line

  const handleSplashClose = (force = false) => {
    if (force) {
      setShowSplashScreen(false)
    } else {
      setShowSplashScreen(
        instanceSettings.settings.showFirstLoginSplashScreen !== false &&
          getDetailsAttribute(['isFirstLogin']) &&
          window.localStorage.getItem('hideSplash') !== 'true'
      )
    }
  }

  const handleTutorialTour = (force = false) => {
    if (
      force ||
      getDetailsAttribute(['firstTimeUserExperience', 'hasSeenHomePage'])
    ) {
      if (window.sessionStorage.getItem('onInitialTutorial') === 'true') {
        if (
          document.querySelector('[data-test=template-card-initial]') != null
        ) {
          dispatch(
            setTour(
              'gettingStartedtutorial',
              gettingStartedTutorialSteps(t),
              true,
              false
            )
          )
        }
      }
    }
  }

  return (
    <div className={props.classes.root} data-test="home">
      {!showSplashScreen &&
        !getDetailsAttribute([
          'firstTimeUserExperience',
          'hasSeenHomePage',
        ]) && (
          <HomeScreenFtue
            onClose={() => {
              handleTutorialTour(true)
            }}
          />
        )}

      <DesktopHomeLayout />
    </div>
  )
}

export default withStyles(Home, styles)
