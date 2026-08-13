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

import { Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { getToken } from '../../../3rd-party-services/okta/okta-user-service'
import BigDataSpinner from '../../../components/feedback/big-data-spinner/BigDataSpinner'
import { login } from '../../../services/user/auth/auth-actions'
import { API_ERROR_CODE } from '../../constants'
import { invalidSSO } from '../login-forms-actions'

const SSOContainer = props => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { classes } = makeStyles()(theme => ({
    wrapper: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      marginTop: theme.spacing(4),
    },
    authenticatingText: {
      display: 'flex',
      marginLeft: 'auto',
      marginRight: 'auto',
      fontSize: theme.spacing(2),
      paddingTop: theme.spacing(8),
    },
  }))()

  useEffect(() => {
    //if been redirected from microsoft
    if (props.microsoftAccessToken) {
      dispatch(
        login({
          username: 'microsoft',
          password: props.microsoftAccessToken,
        })
      )
    }
  }, [dispatch, props.microsoftAccessToken])

  useEffect(() => {
    if (props.oktaAccessToken) {
      // Save user details and do validation
      getToken(props.oktaAccessToken).then(r => {
        if (r.status === API_ERROR_CODE.NO_MATCHING_JURALIO_USER) {
          dispatch(invalidSSO(API_ERROR_CODE.NO_MATCHING_JURALIO_USER))
        } else if (r.status === API_ERROR_CODE.FAILED_SSO_AUTHENTICATION) {
          dispatch(invalidSSO(API_ERROR_CODE.FAILED_SSO_AUTHENTICATION))
        }
        // Attempt log in
        dispatch(
          login({
            username: 'okta',
            password: props.oktaAccessToken,
          })
        )
      })
    }
  }, [dispatch, props.oktaAccessToken])

  useEffect(() => {
    if (props.samlAccessToken) {
      window.history.pushState(
        {},
        document.title,
        window.location.href.replace(window.location.search, '')
      )
      dispatch(
        login({
          username: 'saml',
          password: props.samlAccessToken,
        })
      )
    }
  }, [props.samlAccessToken]) //eslint-disable-line

  useEffect(() => {
    //if been redirected from google
    if (props.googleAccessToken) {
      dispatch(
        login({
          username: 'google',
          password: props.googleAccessToken,
        })
      )
    }
  }, [dispatch, props.googleAccessToken])

  const renderLoadingText = () => {
    if (props.oktaAccessToken?.length > 0) {
      return t('login.authenticatingWithOkta')
    } else if (props.samlAccessToken?.length > 0) {
      return t('login.authenticatingWithSaml')
    } else if (props.microsoftAccessToken?.length > 0) {
      return t('login.authenticatingWithMicrosoft')
    } else if (props.googleAccessToken?.length > 0) {
      return t('login.authenticatingWithGoogle')
    } else {
      return t('login.authenticatingWithMicrosoft')
    }
  }

  return (
    <div className={classes.wrapper}>
      <BigDataSpinner size={80} />
      <Typography className={classes.authenticatingText}>
        {renderLoadingText()}
      </Typography>
    </div>
  )
}

export default SSOContainer
