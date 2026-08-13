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

import mfaFormReducer from './mfa-form-reducer'
import { STORE_QR_URL } from './mfa-form-actions'
import { CLEAR_CREDENTIALS } from '../../login-forms-actions'

describe('mfa-form-reducer', () => {
  let state, output

  describe('given no inital state and an unknown action', () => {
    beforeEach(() => {
      state = undefined
      output = mfaFormReducer(state, { type: 'UNKNOW' })
    })

    it('previous state is not mutated', () => {
      expect(state).toBeUndefined()
    })

    it('next state is initial state', () => {
      expect(output).toEqual({ qrUrl: '' })
    })
  })

  describe('given STORE_QR_URL action', () => {
    beforeEach(() => {
      state = { qrUrl: '' }
      output = mfaFormReducer(state, {
        type: STORE_QR_URL,
        qrUrl: 'test-qr',
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ qrUrl: '' })
    })

    it('next state should store the qr', () => {
      expect(output).toEqual({ qrUrl: 'test-qr' })
    })
  })

  describe('given CLEAR_CREDENTIALS action', () => {
    beforeEach(() => {
      state = { qrUrl: 'test-qr' }
      output = mfaFormReducer(state, { type: CLEAR_CREDENTIALS })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ qrUrl: 'test-qr' })
    })

    it('next state should clear qrUrl', () => {
      expect(output).toEqual({})
    })
  })
})
