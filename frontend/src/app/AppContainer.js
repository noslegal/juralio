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

import { Typography, useMediaQuery } from '@mui/material'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2'
import { enGB } from 'date-fns/locale'
import React, { Suspense } from 'react'
import { Provider } from 'react-redux'
import { HashRouter as Router } from 'react-router-dom'
import { useErrorBoundary } from 'use-error-boundary'
import image from '../assets/images/MartenLook.png'
import TranslationLoadingSpinner from '../components/feedback/translation-loading-spinner/TranslationLoadingSpinner'
import navigationBackgroundStyles from '../components/navigation/common/navigation-background-styles'
import * as userDataService from '../services/user/user-data-service'
import colorModifiers from '../theme/color-modifiers'
import {
  default as juralioTheme,
  default as theme,
} from '../theme/juralio-theme'
import rawColours from '../theme/raw-colours'
import store from '../store/configure-store'
import './AppContainer.css'
import AuthenticatedApp from './AuthenticatedApp'
import MobileVisit from './MobileVisit'

function AppContainer() {
  let params = new URLSearchParams(window.location.href.split('?')[1])

  let redirectHost = params.get('host')
  function inIframe() {
    try {
      return window.self !== window.top
    } catch (e) {
      return true
    }
  }

  if (redirectHost && !inIframe()) {
    window.location.replace(redirectHost)
  }

  const isMobileView = useMediaQuery(juralioTheme.breakpoints.down('md'))
  const { ErrorBoundary, didCatch } = useErrorBoundary()

  const getErrorPage = () => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          background: `url(${navigationBackgroundStyles.image})`,
          backgroundSize: navigationBackgroundStyles.size,
        }}
      >
        <img
          src={image}
          alt="Zero state graphic"
          data-test="zero-state-image"
          style={{
            width: '150px',
            height: '300px',
          }}
        />
        <Typography
          variant="h4"
          style={{
            color: colorModifiers.primaryText(rawColours.text.black),
          }}
        >
          Something has gone wrong on our end
        </Typography>
        <Typography
          variant="h6"
          style={{
            color: colorModifiers.primaryText(rawColours.text.black),
          }}
        >
          Refresh the page and everything should be back to normal
        </Typography>
        <Typography
          variant="h6"
          style={{
            color: colorModifiers.primaryText(rawColours.text.black),
          }}
        >
          If this problem persists, contact support@example.com
        </Typography>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', width: '100%' }} className="app">
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns} localeText={enGB}>
            <Suspense fallback={<TranslationLoadingSpinner />}>
              {isMobileView && <MobileVisit />}
              {!isMobileView && (
                <Provider store={store}>
                  <Router>
                    {didCatch ? (
                      getErrorPage()
                    ) : (
                      <ErrorBoundary>
                        <AuthenticatedApp href={window.location.href} />
                      </ErrorBoundary>
                    )}
                  </Router>
                </Provider>
              )}
            </Suspense>
          </LocalizationProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </div>
  )
}

export const Preloader = () => {
  userDataService.loadAccessToken()
  return AppContainer
}

export default Preloader()
