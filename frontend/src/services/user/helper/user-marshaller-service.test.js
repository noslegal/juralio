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

import { marshallAddTeamMemberResultToTeamListItem } from './user-marshaller-service'

describe('user-marshaller-service', () => {
  describe('marshallAddTeamMemberResultToTeamListItem', () => {
    let input, inputClone, result

    beforeEach(() => {
      input = {
        id: 'team_member_id',
        user: {
          id: 'user_id',
          firstname: 'lara',
          lastname: 'croft',
        },
      }
      inputClone = Object.assign({}, input)
      result = marshallAddTeamMemberResultToTeamListItem(input)
    })

    describe('the returned result', () => {
      it('should have a populated teamMemberId property', () => {
        expect(result.teamMemberId).toBe('team_member_id')
      })

      it('should have exacty 2 top-level properties', () => {
        expect(Object.keys(result).length).toBe(2)
      })

      describe('should have a user property', () => {
        it('should have a populated id proprty', () => {
          expect(result.user.id).toBe('user_id')
        })

        it('should contain other includes field from the input', () => {
          expect(result.user.firstname).toBe('lara')
          expect(result.user.lastname).toBe('croft')
        })

        it('should contain no other unexpected properties', () => {
          expect(Object.keys(result.user).length).toBe(3)
        })
      })

      it('should not modify the given input', () => {
        expect(input).toEqual(inputClone)
      })
    })
  })
})
