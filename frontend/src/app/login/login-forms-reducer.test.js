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

import { loginForms } from './login-forms-reducer'
import {
  RESET_VALIDATION,
  PASSWORD_EXPIRED,
  STORE_CREDENTIALS,
  CLEAR_CREDENTIALS,
  REGISTER_MFA,
  REQUIRE_MFA_TOKEN,
} from './login-forms-actions'

describe('login forms state', () => {
  let state, output

  describe('given no initial state and unknown action', () => {
    beforeEach(() => {
      state = undefined
      output = loginForms(state, {
        type: 'UNKNOW',
        message: 'test-message',
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toBeUndefined()
    })

    it('next state is initial state', () => {
      expect(output).toEqual({
        validationMessage: 'test-message',
        username: '',
        displayForm: 'USERNAME_PASSWORD',
      })
    })
  })

  describe('given RESET_VALIDATION state', () => {
    beforeEach(() => {
      state = {
        validationMessage: 'test-message',
      }
      output = loginForms(state, {
        type: RESET_VALIDATION,
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ validationMessage: 'test-message' })
    })

    it('next state is initial state', () => {
      expect(output).toEqual({ validationMessage: '' })
    })
  })

  describe('given STORE_CREDENTIALS state', () => {
    beforeEach(() => {
      state = {}
      output = loginForms(state, {
        type: STORE_CREDENTIALS,
        credentials: {
          username: 'test-username',
          password: 'test-password',
        },
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({})
    })

    it('next state should setup the credentials', () => {
      expect(output).toEqual({
        username: 'test-username',
        password: 'test-password',
      })
    })
  })

  describe('given CLEAR_CREDENTIALS state', () => {
    beforeEach(() => {
      state = {
        username: 'test-username',
        password: 'test-password',
      }
      output = loginForms(state, { type: CLEAR_CREDENTIALS })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({
        username: 'test-username',
        password: 'test-password',
      })
    })

    it('next state should clear stored credentials', () => {
      expect(output).toEqual({ username: '', password: '' })
    })
  })

  describe('given PASSWORD_EXPIRED state', () => {
    beforeEach(() => {
      state = {
        validationMessage: 'test-message',
        displayForm: 'USERNAME_PASSWORD',
      }
      output = loginForms(state, {
        type: PASSWORD_EXPIRED,
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({
        validationMessage: 'test-message',
        displayForm: 'USERNAME_PASSWORD',
      })
    })

    it('next state should set displayForm to CHANGE_PASSWORD', () => {
      expect(output).toEqual({
        validationMessage: '',
        displayForm: 'CHANGE_PASSWORD',
      })
    })
  })

  describe('given REGISTER_MFA state', () => {
    beforeEach(() => {
      state = {
        validationMessage: 'test-message',
        displayForm: 'USERNAME_PASSWORD',
      }
      output = loginForms(state, {
        type: REGISTER_MFA,
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({
        validationMessage: 'test-message',
        displayForm: 'USERNAME_PASSWORD',
      })
    })

    it('next state should set displayForm to REGISTER_MFA', () => {
      expect(output).toEqual({
        validationMessage: '',
        displayForm: 'REGISTER_MFA',
        showQR: true,
      })
    })
  })

  describe('given REQUIRE_MFA_TOKEN state', () => {
    describe('while in MFA form', () => {
      beforeEach(() => {
        state = {
          validationMessage: 'test-message',
          displayForm: 'REGISTER_MFA',
        }
        output = loginForms(state, {
          type: REQUIRE_MFA_TOKEN,
        })
      })

      it('previous state is not mutated', () => {
        expect(state).toEqual({
          validationMessage: 'test-message',
          displayForm: 'REGISTER_MFA',
        })
      })

      it('next state should set validation message to "Incorrect authentication code"', () => {
        expect(output).toEqual({
          validationMessage: 'login.incorrectAuthenticationCode',
          displayForm: 'REGISTER_MFA',
        })
      })
    })

    describe('while not in MFA form', () => {
      beforeEach(() => {
        state = {
          validationMessage: 'test-message',
          displayForm: 'USERNAME_PASSWORD',
        }
        output = loginForms(state, {
          type: REQUIRE_MFA_TOKEN,
        })
      })

      it('previous state is not mutated', () => {
        expect(state).toEqual({
          validationMessage: 'test-message',
          displayForm: 'USERNAME_PASSWORD',
        })
      })

      it('next state should set validation message to blank', () => {
        expect(output).toEqual({
          validationMessage: '',
          displayForm: 'REGISTER_MFA',
          showQR: false,
        })
      })
    })
  })
})
