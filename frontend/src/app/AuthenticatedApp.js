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
import { useLocation } from 'react-router-dom'

import { decode } from '../services/helpers/magic-link-helper'
import { getParameterByName } from '../services/helpers/url/url-helpers'
import magicLinkService from '../services/magic-link/magic-link-service'
import userService from '../services/user/user-service'
import App from './App'
import './AppContainer.css'
import { API_ERROR_CODE } from './constants'
import LoginContainer from './login/LoginContainer'
import { ssoLogin } from './login/login-forms-actions'
import { useInstanceSettings } from '../hooks/instance-settings/instance-settings-hooks'

const AuthenticatedApp = props => {
  useInstanceSettings()
  const dispatch = useDispatch()
  const location = useLocation()
  const [oktaAccessToken, setOktaAccessToken] = useState(null)
  const [samlAccessToken, setSamlAccessToken] = useState(null)
  const [googleAccessToken, setGoogleAccessToken] = useState(null)
  const [magicLinkToken, setMagicLinkToken] = useState(null)
  const [microsoftAccessToken, setMicrosoftAccessToken] = useState(null)
  const [magicLinkState, setMagicLinkState] = useState(null)

  const isLoggedIn = useSelector(state => state.auth.isLoggedIn)
  const authData = useSelector(state => state.auth.data.auth)
  const details = useSelector(state => state.auth.data.details)

  useEffect(() => {
    if (
      !isLoggedIn &&
      !window.location.href.includes('login') &&
      !window.location.href.includes('?code')
    ) {
      window.sessionStorage.setItem('directUrl', window.location.href)
    }
  }, []) //eslint-disable-line

  useEffect(() => {
    if (!isLoggedIn && !window.location.href.includes('login')) {
      window.location.href = '#/login'
    }
  }, [isLoggedIn])

  // constructor(props) {
  //   super(props)
  //   setGoogleToken = setGoogleToken.bind(this)
  // }

  const clearMagicLinkFromUrl = () => {
    window.history.pushState(
      {},
      document.title,
      window.location.href.replace(
        '?magic_link=' +
          getParameterByName('magic_link', props.href).replaceAll(' ', '+'),
        '/'
      )
    )
  }

  const handleMagicLink = magicDetails => {
    setMagicLinkToken(magicDetails)
    setMagicLinkState('OK')
    clearMagicLinkFromUrl()
  }
  const clearMagicLink = () => {
    setMagicLinkToken(null)
    setMagicLinkState(null)
  }

  const handleDecoding = res => {
    if (res.status && res.status === API_ERROR_CODE.MAGIC_LINK_EXPIRED) {
      setMagicLinkToken(res.context)
      setMagicLinkState('EXPIRED')
    } else if (res.status && res.status === 400) {
      setMagicLinkState('BAD_REQUEST')
    } else if (
      res.status &&
      res.status === API_ERROR_CODE.MAGIC_LINK_ALREADY_USED
    ) {
      setMagicLinkToken(null)
      setMagicLinkState('USED')
    } else {
      handleMagicLink(res)
    }
  }

  const setGoogleToken = token => {
    setGoogleAccessToken(token)
    dispatch(ssoLogin())
  }

  useEffect(() => {
    // Get Okta access_token from URL
    let href = props.href
    if (href.includes('magic_link')) {
      let magicLink = getParameterByName('magic_link', href)
      try {
        let magicDetails = decode(magicLink)
        setMagicLinkState('DECODING')
        clearMagicLinkFromUrl()
        magicLinkService.decryptMagicLinkBase64(magicDetails).then(res => {
          handleDecoding(res)
        })
      } catch (error) {
        setMagicLinkState('DECODING')
        clearMagicLinkFromUrl()
        magicLinkService.decryptMagicLink(magicLink).then(res => {
          handleDecoding(res)
        })
      }
    }

    if (href.includes('saml_access_token')) {
      let access_token = getParameterByName('saml_access_token', href)
      setSamlAccessToken(access_token)
      dispatch(ssoLogin())
    } else if (href.includes('access_token')) {
      let access_token = getParameterByName('access_token', href)
      setOktaAccessToken(access_token)
      dispatch(ssoLogin())
    } else if (href.includes('code')) {
      let access_token = getParameterByName('code', href)
      let url = new URL(window.location.href)
      window.history.pushState(
        {},
        document.title,
        window.location.href.replace(url.search, '')
      )
      setMicrosoftAccessToken(access_token)
      dispatch(ssoLogin())
    }
    //eslint-disable-next-line
  }, [])

  useEffect(() => {
    const pathname = location.pathname

    //IF LOGGED IN
    if (isLoggedIn) {
      if (magicLinkToken !== undefined) {
        window.location.href.replace('?magic_link=' + magicLinkToken, '/')
        setMagicLinkToken(undefined)
      }

      userService.getVisit(details.id).then(res => {
        if (res.status === 200) {
          if (res.body.urlPartial) {
            userService.visit(details.id, null)
          }
        }
      })
    }

    //eslint-disable-next-line
  }, [isLoggedIn, magicLinkToken, details, authData, location])

  return isLoggedIn ? (
    <App
      {...props}
      authData={authData}
      isLoggedIn={isLoggedIn}
      clearMagicLink={clearMagicLink}
    />
  ) : (
    <LoginContainer
      oktaAccessToken={oktaAccessToken}
      samlAccessToken={samlAccessToken}
      googleAccessToken={googleAccessToken}
      setGoogleToken={setGoogleToken}
      magicLinkToken={magicLinkToken}
      magicLinkState={magicLinkState}
      clearMagicLink={clearMagicLink}
      microsoftAccessToken={microsoftAccessToken}
    />
  )
}
export default AuthenticatedApp
