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
  clearValidation,
  RESET_VALIDATION,
  passwordExpired,
  PASSWORD_EXPIRED,
  registerMfa,
  REGISTER_MFA,
  requireMfaToken,
  REQUIRE_MFA_TOKEN,
  storeCredentials,
  STORE_CREDENTIALS,
  clearCredentials,
  CLEAR_CREDENTIALS,
} from './login-forms-actions'

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe('login-forms-actions', () => {
  let store, result

  describe('clearValidation', () => {
    beforeEach(() => {
      store = mockStore({})
      store.dispatch(clearValidation())
    })

    it('should dispatch RESET_VALIDATION', () => {
      const actions = store.getActions()
      expect(actions[0].type).toEqual(RESET_VALIDATION)
    })
  })

  describe('passwordExpired', () => {
    beforeEach(() => {
      result = passwordExpired()
    })

    it('should return an action typed as PASSWORD_EXPIRED', () => {
      expect(result).toEqual({
        type: PASSWORD_EXPIRED,
      })
    })
  })

  describe('registerMfa', () => {
    beforeEach(() => {
      result = registerMfa()
    })

    it('should return an action typed as REGISTER_MFA', () => {
      expect(result).toEqual({ type: REGISTER_MFA })
    })
  })

  describe('requireMfaToken', () => {
    beforeEach(() => {
      result = requireMfaToken()
    })

    it('should return an action typed as REQUIRE_MFA_TOKEN', () => {
      expect(result).toEqual({ type: REQUIRE_MFA_TOKEN })
    })
  })

  describe('storeCredentials', () => {
    beforeEach(() => {
      result = storeCredentials({
        username: 'test-username',
        password: 'test-password',
      })
    })

    it('should return an action typed as STORE_CREDENTIALS and has the passed in credentials', () => {
      expect(result).toEqual({
        type: STORE_CREDENTIALS,
        credentials: {
          username: 'test-username',
          password: 'test-password',
        },
      })
    })
  })

  describe('clearCredentials', () => {
    beforeEach(() => {
      result = clearCredentials()
    })

    it('should return an action typed as CLEAR_CREDENTIALS', () => {
      expect(result).toEqual({ type: CLEAR_CREDENTIALS })
    })
  })
})
