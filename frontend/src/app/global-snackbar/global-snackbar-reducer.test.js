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

import { CLOSE_SNACKBAR, SHOW_SNACKBAR } from './global-snackbar-actions'
import globalSnackbarReducer from './global-snackbar-reducer'

describe('when the given action type', () => {
  describe('does NOT match any supported type', () => {
    let state
    beforeEach(() => (state = globalSnackbarReducer(undefined, {})))

    it('the initial state containing "open" set to false should be returned', () => {
      expect(state).toEqual({
        open: false,
        options: {
          anchorOrigin: {
            horizontal: 'center',
            vertical: 'top',
          },
          autoHideDuration: 6000,
          showDismiss: true,
        },
      })
    })
  })

  describe('matches SHOW_SNACKBAR, ', () => {
    let state
    const previousState = {}

    beforeEach(
      () =>
        (state = globalSnackbarReducer(previousState, {
          type: SHOW_SNACKBAR,
          snackbarMessage: 'test message',
          action: 'test action',
        }))
    )

    describe('the returned state', () => {
      it('should include "open" set to true', () => {
        expect(state.open).toEqual(true)
      })

      it('should include "message" set to the given message', () => {
        expect(state.snackbarMessage).toEqual('test message')
      })

      it('should include "action" set to given action', () => {
        expect(state.action).toEqual('test action')
      })

      it('should include one other properties', () => {
        expect(Object.keys(state).length).toEqual(4)
      })
    })

    it('should not alter the previous state', () => {
      expect(previousState).toEqual({})
    })
  })

  describe('matches CLOSE_SNACKBAR, ', () => {
    let state
    const previousState = {}

    beforeEach(
      () =>
        (state = globalSnackbarReducer(previousState, {
          type: CLOSE_SNACKBAR,
        }))
    )

    describe('the returned state', () => {
      it('should include "open" set to false', () => {
        expect(state.open).toEqual(false)
      })

      it('should include an options properties', () => {
        expect(Object.keys(state).length).toEqual(2)
      })
    })

    it('should not alter the previous state', () => {
      expect(previousState).toEqual({})
    })
  })
})
