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

import * as apiHelper from '../helpers/api-helper'
import userService from './user-service'

jest.mock('../helpers/api-helper')

describe('user-service', () => {
  describe('changePassword', () => {
    const credentials = { username: 'user', newPassword: 'new-password' }
    let promise

    describe('on success', () => {
      beforeEach(() => {
        apiHelper.default = jest.fn().mockReturnValue('path/')
        window.fetch = jest.fn().mockReturnValue(
          Promise.resolve({
            ok: true,
            json: () => 'some user data',
          })
        )
        promise = userService.changePassword(credentials)
      })

      describe('call login', () => {
        it('should call fetch path to login API', () => {
          expect(fetch.mock.calls[0][0]).toEqual('path/settings/user/password')
        })

        it('should call fetch POST method and stringified credentials', () => {
          expect(fetch.mock.calls[0][1]).toEqual({
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          })
        })

        it('should return expected data', () => {
          return promise.then(json => {
            expect(json).toEqual({ username: 'user', password: 'new-password' })
          })
        })
      })
    })

    describe('on failure', () => {
      beforeEach(() => {
        apiHelper.default = jest.fn().mockReturnValue('path/')
        window.fetch = jest.fn().mockReturnValue(
          Promise.resolve({
            ok: false,
          })
        )
        promise = userService.changePassword(credentials)
      })

      it('should return Promise.reject', () => {
        return expect(promise).rejects.toEqual({
          ok: false,
        })
      })
    })
  })
})
