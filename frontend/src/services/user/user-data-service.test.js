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

import { loadAccessToken, setSessionUserData } from './user-data-service'
import store from '../../store/configure-store'
import { receiveLogin } from './auth/auth-actions'

jest.mock('../../store/configure-store')
jest.mock('./auth/auth-actions')

describe('user-data-service', () => {
  beforeEach(() => {
    store.dispatch = jest.fn()
  })

  afterEach(() => {
    global.localStorage.clear()
  })

  describe('loadAccessToken', () => {
    describe('when session storage contains userData with auth and details', () => {
      const mockUserData = {
        username: 'juralio',
        auth: { access_token: 'token' },
        details: { id: 1 },
      }

      beforeEach(() => {
        global.localStorage.setItem('userData', JSON.stringify(mockUserData))
        loadAccessToken()
      })

      it('should dispatch receiveLogin action with userData', () => {
        expect(store.dispatch).toHaveBeenCalledWith(receiveLogin(mockUserData))
      })
    })

    describe('when session storage contains userData without auth or details', () => {
      beforeEach(() => {
        global.localStorage.setItem('userData', '{"username": "juralio"}')
        loadAccessToken()
      })

      it('should not dispatch any actions', () => {
        expect(store.dispatch).not.toHaveBeenCalled()
      })

      it('should remove userData from localStorage', () => {
        expect(global.localStorage.getItem('userData')).toBeNull()
      })
    })

    describe('when session storage does not contains userData and access token is stored in state', () => {
      beforeEach(() => {
        store.getState.mockReturnValue({
          user: {
            auth: {
              data: { access_token: 'something' },
            },
          },
        })
        loadAccessToken()
      })

      it('should not dispatch any actions', () => {
        expect(store.dispatch).not.toHaveBeenCalled()
      })
    })
  })

  describe('setSessionUserData', () => {
    const testUserData = { data: 'somedata' }

    beforeEach(() => {
      setSessionUserData(testUserData)
    })

    it('should set the data in localStorage', () => {
      expect(global.localStorage.getItem('userData')).toEqual(
        JSON.stringify(testUserData)
      )
    })
  })
})
