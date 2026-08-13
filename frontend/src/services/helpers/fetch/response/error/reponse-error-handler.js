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

import { Button } from '@mui/material'
import { StatusCodes } from 'http-status-codes'
import i18n from 'i18next'
import React from 'react'
import { showSnackbar } from '../../../../../app/global-snackbar/global-snackbar-actions'
import store from '../../../../../store/configure-store'
import juralioColours from '../../../../../theme/juralio-colours'
import { logout } from '../../../../user/auth/auth-actions'
import responseHandler from '../response-handler'
import { hasUnknownError } from './response-error-helper'

export const handleErrorStatus = response => {
  if (response.status === StatusCodes.UNAUTHORIZED) {
    store.dispatch(logout())
    return true
  }
  if (response.status === StatusCodes.TOO_MANY_REQUESTS) {
    const retryAfter = response.headers?.get('Retry-After') || '60'
    store.dispatch(
      showSnackbar(
        i18n.t('commonValidationMessages.tooManyRequests', {
          seconds: retryAfter,
        })
      )
    )
    return true
  }
  if (response.status >= StatusCodes.INTERNAL_SERVER_ERROR) {
    try {
      response
        .then(response => response)
        .then(responseJson => {
          if (responseJson.message !== 'HibernateOptimisticLockingFailure') {
            store.dispatch(
              showSnackbar(
                i18n.t('commonValidationMessages.somethingWentWrong'),
                <Button
                  style={{
                    color: juralioColours.darkText.primary,
                    fontSize: '0.8125rem',
                  }}
                  onClick={() => {
                    window.location.reload()
                  }}
                >
                  {i18n.t('common.refresh')}
                </Button>
              )
            )
            return true
          } else {
            return false
          }
        })
    } catch (e) {
      return false
    }
  } else if (response.status === StatusCodes.FORBIDDEN) {
    store.dispatch(
      showSnackbar(
        i18n.t('commonValidationMessages.somethingWentWrong'),
        <Button
          style={{
            color: juralioColours.darkText.primary,
            fontSize: '0.8125rem',
          }}
          onClick={() => {
            window.location.reload()
          }}
        >
          {i18n.t('common.refresh')}
        </Button>
      )
    )
    return true
  } else {
    return false
  }
}

export const handleUnknownError = response => {
  if (hasUnknownError(response)) {
    store.dispatch(
      showSnackbar(
        i18n.t('commonValidationMessages.somethingWentWrong'),
        <Button
          style={{
            color: juralioColours.darkText.primary,
            fontSize: '0.8125rem',
          }}
          onClick={() => {
            window.location.reload()
          }}
        >
          {i18n.t('common.refresh')}
        </Button>
      )
    )
  }
}

export const responseErrorHandler = response => {
  if (response && response.status) {
    return responseHandler(response)
  }
  return new Promise(resolve => {
    // The fetch has managed to fail before making the call
    // this typically means that there was a CORS issue
    // or the user was trying to escape out of the search and do something malicious
    // just return an empty response
    resolve({ status: StatusCodes.BAD_REQUEST, body: [] })
  })
}
