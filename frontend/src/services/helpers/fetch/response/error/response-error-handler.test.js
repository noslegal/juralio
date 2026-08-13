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

import { StatusCodes } from 'http-status-codes'
import * as snackbarActions from '../../../../../app/global-snackbar/global-snackbar-actions'
import store from '../../../../../store/configure-store'
import { handleErrorStatus, handleUnknownError } from './reponse-error-handler'
import * as errorHelper from './response-error-helper'

describe('response-error-handler.test', () => {
  const assertSnackbarErrorRaised = () => {
    it('the showSnackbar action creator should be called with error message', () => {
      expect(snackbarActions.showSnackbar).toHaveBeenCalled()
    })

    it('dispatch should be called with the result of the showSnackbar call', () => {
      expect(store.dispatch).toHaveBeenCalledWith('show_snackbar_result')
    })
  }

  const assertSnackbarErrorNotRaised = () => {
    it('the showSnackbar action creator should NOT be called', () => {
      expect(snackbarActions.showSnackbar).not.toHaveBeenCalled()
    })

    it('dispatch should NOT be called', () => {
      expect(store.dispatch).not.toHaveBeenCalled()
    })
  }

  beforeEach(() => {
    store.dispatch = jest.fn()
    snackbarActions.showSnackbar = jest
      .fn()
      .mockReturnValueOnce('show_snackbar_result')
  })

  describe('handleErrorStatus', () => {
    let result

    describe('when the status is EXACTLY INTERAL_SERVER_ERROR(500)', () => {
      beforeEach(() => {
        result = handleErrorStatus({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        })
      })

      it('true should be returned', () => {
        expect(result).toBe(false)
      })
    })

    describe('when the status is EXACTLY UNAUTHORIZED(401)', () => {
      beforeEach(() => {
        result = handleErrorStatus({ status: StatusCodes.UNAUTHORIZED })
      })

      it('true should be returned', () => {
        expect(result).toBe(true)
      })

      it('the showSnackbar action creator should NOT be called', () => {
        expect(snackbarActions.showSnackbar).not.toHaveBeenCalled()
      })

      it('should dispatch action with LOGOUT', () => {
        expect(store.dispatch).toHaveBeenCalledWith({
          type: 'LOGOUT',
          data: { ssoType: undefined },
        })
      })
    })

    describe('when the status is LESS than INTERAL_SERVER_ERROR(500)', () => {
      beforeEach(() => {
        result = handleErrorStatus({ status: 499 })
      })

      it('false should be returned', () => {
        expect(result).toBe(false)
      })

      assertSnackbarErrorNotRaised()
    })
  })

  describe('handleUnknownError', () => {
    beforeEach(() => {
      errorHelper.hasUnknownError = jest.fn()
    })

    it('should call hasUnknownError on the error helper', () => {
      handleUnknownError('mock_response')
      expect(errorHelper.hasUnknownError).toHaveBeenCalledWith('mock_response')
    })

    describe('when the given response does have an unknown error', () => {
      beforeEach(() => {
        errorHelper.hasUnknownError.mockReturnValueOnce(true)
        handleUnknownError()
      })

      assertSnackbarErrorRaised()
    })

    describe('when the given response does NOT have an unknown error', () => {
      beforeEach(() => {
        errorHelper.hasUnknownError.mockReturnValueOnce(false)
        handleUnknownError()
      })

      assertSnackbarErrorNotRaised()
    })
  })
})
