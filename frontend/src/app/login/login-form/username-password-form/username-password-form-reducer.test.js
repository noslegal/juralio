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

import usernamePasswordFormReducer from './username-password-form-reducer'
import {
  NO_USERNAME_AND_PASSWORD,
  NO_USERNAME,
  NO_PASSWORD,
  INCORRECT_CREDENTIALS,
  LOCKED,
} from './username-password-form-actions'
import { RESET_VALIDATION } from '../../login-forms-actions'

describe('username password login form state', () => {
  let state, output

  describe('given no initial state and unknown action', () => {
    beforeEach(() => {
      state = undefined
      output = usernamePasswordFormReducer(state, { type: 'UNKNOW' })
    })

    it('previous state is not mutated', () => {
      expect(state).toBeUndefined()
    })

    it('next state is initial state', () => {
      expect(output).toEqual({ passwordInvalid: false, usernameInvalid: false })
    })
  })

  describe('handle NO_USERNAME_AND_PASSWORD action', () => {
    const action = {
      type: NO_USERNAME_AND_PASSWORD,
    }

    beforeEach(() => {
      state = { passwordInvalid: false, usernameInvalid: false }
      output = usernamePasswordFormReducer(state, action)
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ passwordInvalid: false, usernameInvalid: false })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({ passwordInvalid: true, usernameInvalid: true })
    })
  })

  describe('handle NO_USERNAME action', () => {
    const action = {
      type: NO_USERNAME,
    }

    beforeEach(() => {
      state = { passwordInvalid: false, usernameInvalid: false }
      output = usernamePasswordFormReducer(state, action)
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ passwordInvalid: false, usernameInvalid: false })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({ passwordInvalid: false, usernameInvalid: true })
    })
  })

  describe('handle NO_PASSWORD action', () => {
    const action = {
      type: NO_PASSWORD,
    }

    beforeEach(() => {
      state = { passwordInvalid: false, usernameInvalid: false }
      output = usernamePasswordFormReducer(state, action)
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ passwordInvalid: false, usernameInvalid: false })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({ passwordInvalid: true, usernameInvalid: false })
    })
  })

  describe('handle INCORRECT_CREDENTIALS action', () => {
    const action = {
      type: INCORRECT_CREDENTIALS,
    }

    beforeEach(() => {
      state = { passwordInvalid: false, usernameInvalid: false }
      output = usernamePasswordFormReducer(state, action)
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ passwordInvalid: false, usernameInvalid: false })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({ passwordInvalid: true, usernameInvalid: true })
    })
  })

  describe('handle LOCKED action', () => {
    const action = {
      type: LOCKED,
    }

    beforeEach(() => {
      state = { passwordInvalid: false, usernameInvalid: false }
      output = usernamePasswordFormReducer(state, action)
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ passwordInvalid: false, usernameInvalid: false })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({ passwordInvalid: true, usernameInvalid: true })
    })
  })

  describe('handle RESET_VALIDATION action', () => {
    const action = {
      type: RESET_VALIDATION,
    }

    beforeEach(() => {
      state = { passwordInvalid: true, usernameInvalid: true }
      output = usernamePasswordFormReducer(state, action)
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ passwordInvalid: true, usernameInvalid: true })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({ passwordInvalid: false, usernameInvalid: false })
    })
  })
})
