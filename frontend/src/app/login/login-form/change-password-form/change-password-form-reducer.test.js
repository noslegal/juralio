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

import changePasswordFormReducer from './change-password-form-reducer'
import {
  OLD_PASSWORD_INCORRECT,
  NEW_PASSWORDS_DO_NOT_MATCH,
  PASSWORD_COMPLEXITY_NOT_MET,
  NEW_PASSWORD_MATCHES_OLD_PASSWORD,
} from './change-password-form-actions'
import { RESET_VALIDATION } from './../../login-forms-actions'

describe('change password login form state', () => {
  let state, output

  describe('given no initial state and unknown action', () => {
    beforeEach(() => {
      state = undefined
      output = changePasswordFormReducer(state, { type: 'UNKNOW' })
    })

    it('previous state is not mutated', () => {
      expect(state).toBeUndefined()
    })

    it('next state is initial state', () => {
      expect(output).toEqual({
        oldPasswordInvalid: false,
        newPasswordInvalid: false,
        verifyNewPasswordInvalid: false,
      })
    })
  })

  describe('handle OLD_PASSWORD_INCORRECT action', () => {
    const action = {
      type: OLD_PASSWORD_INCORRECT,
    }

    beforeEach(() => {
      state = {
        oldPasswordInvalid: false,
        newPasswordInvalid: false,
        verifyNewPasswordInvalid: false,
      }
      output = changePasswordFormReducer(state, action)
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({
        oldPasswordInvalid: false,
        newPasswordInvalid: false,
        verifyNewPasswordInvalid: false,
      })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        oldPasswordInvalid: true,
        newPasswordInvalid: false,
        verifyNewPasswordInvalid: false,
      })
    })
  })

  describe('handle NEW_PASSWORDS_DO_NOT_MATCH action', () => {
    const action = {
      type: NEW_PASSWORDS_DO_NOT_MATCH,
    }

    beforeEach(() => {
      state = {
        oldPasswordInvalid: false,
        newPasswordInvalid: false,
        verifyNewPasswordInvalid: false,
      }
      output = changePasswordFormReducer(state, action)
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({
        oldPasswordInvalid: false,
        newPasswordInvalid: false,
        verifyNewPasswordInvalid: false,
      })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        oldPasswordInvalid: false,
        newPasswordInvalid: true,
        verifyNewPasswordInvalid: true,
      })
    })
  })

  describe('handle PASSWORD_COMPLEXITY_NOT_MET action', () => {
    const action = {
      type: PASSWORD_COMPLEXITY_NOT_MET,
    }

    beforeEach(() => {
      state = {
        oldPasswordInvalid: false,
        newPasswordInvalid: false,
        verifyNewPasswordInvalid: false,
      }
      output = changePasswordFormReducer(state, action)
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({
        oldPasswordInvalid: false,
        newPasswordInvalid: false,
        verifyNewPasswordInvalid: false,
      })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        oldPasswordInvalid: false,
        newPasswordInvalid: true,
        verifyNewPasswordInvalid: true,
      })
    })
  })

  describe('handle NEW_PASSWORD_MATCHES_OLD_PASSWORD action', () => {
    const action = {
      type: NEW_PASSWORD_MATCHES_OLD_PASSWORD,
    }

    beforeEach(() => {
      state = {
        oldPasswordInvalid: false,
        newPasswordInvalid: false,
        verifyNewPasswordInvalid: false,
      }
      output = changePasswordFormReducer(state, action)
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({
        oldPasswordInvalid: false,
        newPasswordInvalid: false,
        verifyNewPasswordInvalid: false,
      })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        oldPasswordInvalid: false,
        newPasswordInvalid: true,
        verifyNewPasswordInvalid: true,
      })
    })
  })

  describe('handle RESET_VALIDATION action', () => {
    const action = {
      type: RESET_VALIDATION,
    }

    beforeEach(() => {
      state = {
        oldPasswordInvalid: true,
        newPasswordInvalid: true,
        verifyNewPasswordInvalid: true,
      }
      output = changePasswordFormReducer(state, action)
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({
        oldPasswordInvalid: true,
        newPasswordInvalid: true,
        verifyNewPasswordInvalid: true,
      })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        oldPasswordInvalid: false,
        newPasswordInvalid: false,
        verifyNewPasswordInvalid: false,
      })
    })
  })
})
