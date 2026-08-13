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

import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {
  closeSnackbar,
  CLOSE_SNACKBAR,
  displaySnackbar,
  showSnackbar,
  SHOW_SNACKBAR,
} from './global-snackbar-actions'

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe('showSnackbar', () => {
  it('should return an object including expected type and given message', () => {
    const returnValue = showSnackbar('test message', 'test action')
    expect(returnValue).toEqual({
      type: SHOW_SNACKBAR,
      snackbarMessage: 'test message',
      action: 'test action',
    })
  })
})

describe('closeSnackbar', () => {
  it('should return an object including expected type', () => {
    expect(closeSnackbar()).toEqual({
      type: CLOSE_SNACKBAR,
    })
  })
})

describe('displaySnackbar', () => {
  let store, actions

  beforeEach(() => {
    store = mockStore({})
    store.dispatch(displaySnackbar('test-message', 'test-action'))
    actions = store.getActions()
  })

  it('should dispatch showSnackbar with the passed in message', () => {
    expect(actions[0].type).toEqual(SHOW_SNACKBAR)
    expect(actions[0].snackbarMessage).toEqual('test-message')
    expect(actions[0].action).toEqual('test-action')
  })
})
