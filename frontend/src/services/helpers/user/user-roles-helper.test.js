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

import { getUserRoles } from './user-roles-helper'

describe('user-roles-helper', () => {
  describe('when calling getUserRoles for a matter creator', () => {
    let t, userRoles
    beforeAll(() => {
      t = jest.fn(() => 'Matter creator')
      userRoles = ['ROLE_USER', 'ROLE_MATTER_CREATOR']
    })

    it('should return a Matter creator string', () => {
      expect(
        getUserRoles(userRoles, t.mockReturnValue('Matter creator'))
      ).toEqual(['Matter creator'])
      expect(t.mock.calls[0][0]).toBe('userList.matterCreator')
    })
  })

  describe('when calling getUserRoles for an org admin', () => {
    let t, userRoles
    beforeAll(() => {
      t = jest.fn(() => 'Org admin')
      userRoles = ['ROLE_USER', 'ROLE_ORG_ADMIN']
    })

    it('should return a Org admin string', () => {
      expect(getUserRoles(userRoles, t.mockReturnValue('Org admin'))).toEqual([
        'Org admin',
      ])
      expect(t.mock.calls[0][0]).toBe('userList.orgadmin')
    })
  })

  describe('when calling getUserRoles for a system admin', () => {
    let t, userRoles
    beforeAll(() => {
      t = jest.fn(() => 'System admin')
      userRoles = ['ROLE_USER', 'ROLE_SYSADMIN']
    })

    it('should return a Matter creator string', () => {
      expect(
        getUserRoles(userRoles, t.mockReturnValue('System admin'))
      ).toEqual(['System admin'])
      expect(t.mock.calls[0][0]).toBe('userList.sysadmin')
    })
  })

  describe('when calling getUserRoles for a normal user', () => {
    let t, userRoles
    beforeAll(() => {
      t = jest.fn(() => '')
      userRoles = [{ roleId: 1, authority: 'ROLE_USER' }]
    })

    it('should return an empty string', () => {
      expect(getUserRoles(userRoles, t)).toEqual([])
    })
  })

  describe('when calling getUserRoles when no roles are given', () => {
    let t, userRoles
    beforeAll(() => {
      t = jest.fn(() => '')
      userRoles = undefined
    })

    it('should return an empty string', () => {
      expect(getUserRoles(userRoles, t)).toEqual('')
    })
  })
})
