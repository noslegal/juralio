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

import i18n from 'i18next'
import usersReducer from './users-reducer'
import {
  RESET_USERS_STATE,
  SELECT_USER,
  DESELECT_USER,
  CREATE_USER_REQUEST,
  CREATE_USER_SUCCESS,
  USERNAME_UNIQUE_FAILURE,
  RECEIVE_USERS_SUCCESS,
  UPDATE_USER_SUCCESS,
  CLEAR_USERNAME_VALIDATION,
  TEMPORARY_PASSWORD_REQUEST,
  TEMPORARY_PASSWORD_REQUEST_SUCCESS,
  RESET_TEMPORARY_PASSWORD_STATE,
} from './users-actions'

const expectedInitialState = {
  isCreated: false,
  isLoaded: false,
  selectedUser: undefined,
  usernameValidationMessage: undefined,
  users: [],
  temporaryPassword: undefined,
  newUsers: [],
  bulkCreateErrors: [],
}

jest.mock('i18next', () => ({
  t: jest.fn(key => {
    switch (key) {
      case 'userCreation.userAddFailed':
        return 'userCreation.userAddFailed.translated'
      default:
        return ''
    }
  }),
}))

const assertActionResult = (initialState, action, expectedState) => {
  const stateCopy = { ...initialState }
  let output = usersReducer(initialState, action)

  it('the expected state should be returned', () => {
    expect(output).toStrictEqual(expectedState)
  })

  it('the original given state should not be modified', () => {
    expect(initialState).toStrictEqual(stateCopy)
  })
}

describe('users-reducer.test', () => {
  beforeEach(() => {
    i18n.t = jest.fn().mockReturnValueOnce('yoooha')
  })

  describe('when no action or state is given', () => {
    it('the expected initial state should be returned', () => {
      expect(usersReducer()).toEqual(expectedInitialState)
    })
  })

  describe('when an unrecognised action is given', () => {
    assertActionResult(
      { isLoaded: false, selectedUser: 'mockSelectedUser' },
      {
        type: 'unrecognised-action',
      },
      { isLoaded: false, selectedUser: 'mockSelectedUser' }
    )
  })

  describe('when the RESET_USERS_STATE state action is given', () => {
    assertActionResult(
      { isLoaded: false, selectedUser: 'mockSelectedUser' },
      {
        type: RESET_USERS_STATE,
        user: { username: 'mockSelectedUser', isThirdPartyUser: false },
      },
      { ...expectedInitialState }
    )
  })

  describe('when the SELECT_USER state action is given', () => {
    assertActionResult(
      { isLoaded: false, selectedUser: undefined },
      {
        type: SELECT_USER,
        user: { username: 'mockSelectedUser', isThirdPartyUser: false },
      },
      {
        isLoaded: false,
        selectedUser: { username: 'mockSelectedUser', isThirdPartyUser: false },
      }
    )
  })

  describe('when the DESELECT_USER state action is given', () => {
    assertActionResult(
      {
        isLoaded: false,
        otherProperty: 'otherValue',
        selectedUser: 'mockSelectedUser',
      },
      {
        type: DESELECT_USER,
      },
      {
        isLoaded: false,
        otherProperty: 'otherValue',
        selectedUser: undefined,
      }
    )
  })

  describe('when the CREATE_USER_REQUEST state action is given', () => {
    assertActionResult(
      {
        isCreated: false,
        isLoaded: false,
        otherProperty: 'otherValue',
        usernameValidationMessage: 'mockUsernameValidationMessage',
      },
      {
        type: CREATE_USER_REQUEST,
      },
      {
        isCreated: false,
        isLoaded: false,
        otherProperty: 'otherValue',
        usernameValidationMessage: undefined,
      }
    )
  })

  describe('when the CREATE_USER_SUCCESS state action is given', () => {
    assertActionResult(
      {
        isLoaded: false,
        usernameValidationMessage: 'mockUsernameValidationMessage',
        users: [
          { username: 'one', isThirdPartyUser: false },
          { username: 'two', isThirdPartyUser: false },
        ],
      },
      {
        type: CREATE_USER_SUCCESS,
        user: {
          username: 'new',
          isThirdPartyUser: false,
          temporaryPassword: {
            password: 'temp_password',
          },
        },
      },
      {
        isLoaded: false,
        usernameValidationMessage: undefined,
        users: [
          { username: 'new', isThirdPartyUser: false },
          { username: 'one', isThirdPartyUser: false },
          { username: 'two', isThirdPartyUser: false },
        ],
        temporaryPassword: {
          user: {
            username: 'new',
            isThirdPartyUser: false,
          },
          password: 'temp_password',
          isNewUser: true,
        },
        isCreated: true,
      }
    )
  })

  describe('when the USERNAME_UNIQUE_FAILURE state action is given', () => {
    assertActionResult(
      {
        isLoaded: false,
        usernameValidationMessage: undefined,
        users: ['mockUser'],
      },
      {
        type: USERNAME_UNIQUE_FAILURE,
      },
      {
        isLoaded: false,
        usernameValidationMessage: 'userCreation.userAddFailed.translated',
        users: ['mockUser'],
      }
    )
  })

  describe('when the RECEIVE_USERS_SUCCESS state action is given', () => {
    assertActionResult(
      {
        isLoaded: false,
        users: [],
      },
      {
        type: RECEIVE_USERS_SUCCESS,
        users: ['one', 'two', 'three'],
      },
      {
        isLoaded: true,
        users: ['one', 'two', 'three'],
      }
    )
  })

  describe('when the UPDATE_USER_SUCCESS state action is given', () => {
    assertActionResult(
      {
        isLoaded: false,
        users: [
          { id: 1, username: 'one' },
          { id: 2, username: 'two' },
          { id: 3, username: 'three' },
        ],
      },
      {
        type: UPDATE_USER_SUCCESS,
        user: { id: 2, username: 'updated', isThirdPartyUser: false },
      },
      {
        isLoaded: false,
        users: [
          { id: 1, username: 'one' },
          { id: 2, username: 'updated', isThirdPartyUser: false },
          { id: 3, username: 'three' },
        ],
      }
    )
  })

  describe('when the CLEAR_USERNAME_VALIDATION state action is given', () => {
    assertActionResult(
      {
        isLoaded: false,
        usernameValidationMessage: 'mockMessage',
      },
      {
        type: CLEAR_USERNAME_VALIDATION,
      },
      {
        isLoaded: false,
        usernameValidationMessage: undefined,
      }
    )
  })

  describe('when the TEMPORARY_PASSWORD_REQUEST state action is given', () => {
    assertActionResult(
      {
        isLoaded: false,
      },
      {
        type: TEMPORARY_PASSWORD_REQUEST,
        user: { username: 'test_user' },
      },
      {
        isLoaded: false,
        temporaryPassword: {
          user: { username: 'test_user' },
        },
      }
    )
  })

  describe('when the TEMPORARY_PASSWORD_REQUEST state action is given', () => {
    assertActionResult(
      {
        isLoaded: false,
        temporaryPassword: {
          user: { username: 'test_user' },
        },
      },
      {
        type: TEMPORARY_PASSWORD_REQUEST_SUCCESS,
        payload: { password: 'test_password' },
      },
      {
        isLoaded: false,
        temporaryPassword: {
          isAuthChange: false,
          user: { username: 'test_user' },
          password: 'test_password',
        },
      }
    )
  })

  describe('when the RESET_TEMPORARY_PASSWORD_STATE state action is given', () => {
    assertActionResult(
      {
        isLoaded: false,
        temporaryPassword: {
          isAuthChange: false,
          user: { username: 'test_user' },
          password: 'test_password',
        },
      },
      {
        type: RESET_TEMPORARY_PASSWORD_STATE,
      },
      {
        isLoaded: false,
        temporaryPassword: undefined,
      }
    )
  })
})
