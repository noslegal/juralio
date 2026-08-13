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

import { isSysAdmin, isOrgAdmin } from './user-role-service'
import { USER_ROLES } from '../../../app/constants'

describe('user-role-service.test', () => {
  describe('hasRole', () => {
    test.each`
      userData                        | role                         | expected | description
      ${undefined}                    | ${USER_ROLES.ROLE_SYS_ADMIN} | ${false} | ${'undefined user data'}
      ${{}}                           | ${USER_ROLES.ROLE_SYS_ADMIN} | ${false} | ${'empty user data'}
      ${{ roles: [] }}                | ${undefined}                 | ${false} | ${'empty user roles, undefined role'}
      ${{ roles: [] }}                | ${USER_ROLES.ROLE_SYS_ADMIN} | ${false} | ${'a user with no roles'}
      ${{ roles: ['MOCK_ROLE'] }}     | ${undefined}                 | ${false} | ${'non-empty user roles, undefined role'}
      ${{ roles: ['MOCK_ROLE'] }}     | ${USER_ROLES.ROLE_SYS_ADMIN} | ${false} | ${'non-matching role'}
      ${{ roles: ['ROLE_SYSADMIN'] }} | ${USER_ROLES.ROLE_SYS_ADMIN} | ${true}  | ${'matching role'}
    `('returns $expected when given $description', ({ userData, expected }) => {
      expect(isSysAdmin(userData)).toBe(expected)
    })
  })
  describe('isSysAdmin', () => {
    test.each`
      userData                        | expected | description
      ${undefined}                    | ${false} | ${'undefined'}
      ${{}}                           | ${false} | ${'an empty object'}
      ${{ roles: [] }}                | ${false} | ${'a user with no roles'}
      ${{ roles: ['MOCK_ROLE'] }}     | ${false} | ${'a user without sysadmin role'}
      ${{ roles: ['ROLE_SYSADMIN'] }} | ${true}  | ${'a user with sysadmin role'}
    `('returns $expected when given $description', ({ userData, expected }) => {
      expect(isSysAdmin(userData)).toBe(expected)
    })
  })

  describe('isOrgAdmin', () => {
    test.each`
      userData                         | expected | description
      ${undefined}                     | ${false} | ${'undefined'}
      ${{}}                            | ${false} | ${'an empty object'}
      ${{ roles: [] }}                 | ${false} | ${'a user with no roles'}
      ${{ roles: ['MOCK_ROLE'] }}      | ${false} | ${'a user without role org admin role'}
      ${{ roles: ['ROLE_ORG_ADMIN'] }} | ${true}  | ${'a user with role org admin role'}
    `('returns $expected when given $description', ({ userData, expected }) => {
      expect(isOrgAdmin(userData)).toBe(expected)
    })
  })
})
