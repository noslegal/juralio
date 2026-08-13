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

import { LOGOUT, RECEIVE_LOGIN, RECEIVE_USER_DATA_UPDATE } from './auth-actions'
import authReducer from './auth-reducer'

describe('auth-reducer.test.js', () => {
  let state, output

  describe('handle RECEIVE_LOGIN action', () => {
    const action = {
      type: RECEIVE_LOGIN,
      userData: { username: 'user1' },
    }

    beforeEach(() => {
      state = { isLoggedIn: false }
      output = authReducer(state, action)
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ isLoggedIn: false })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        isLoggedIn: true,
        data: { username: 'user1' },
      })
    })
  })

  describe('handle LOGOUT action', () => {
    const action = {
      type: LOGOUT,
    }

    beforeEach(() => {
      global.localStorage.setItem('mockItem', 'mockValue')
      state = { isLoggedIn: false }
      output = authReducer(state, action)
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ isLoggedIn: false })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        isLoggedIn: false,
        data: undefined,
      })
    })

    it('clears localStorage', () => {
      expect(global.localStorage.length).toBe(0)
    })
  })
  describe('handle RECEIVE_USER_DATA_UPDATE action', () => {
    const action = {
      type: RECEIVE_USER_DATA_UPDATE,
      data: { hasSeenInbox: true },
    }

    beforeEach(() => {
      state = {}
      output = authReducer(state, action)
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({})
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        data: { hasSeenInbox: true },
      })
    })
  })
})
