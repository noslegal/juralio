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

import {
  RECEIVE_TASK_POST_SUCCESS,
  RECEIVE_POST_DETAILS_SUCCESS,
  UPDATE_POST_SUCCESS,
  CREATE_POST_IN_CONTEXT_SUCCESS,
  CREATE_POST_OUT_OF_CONTEXT_SUCCESS,
  ARCHIVE_POST_SUCCESS,
  SELECT_ITEM_IN_LIST,
  TASK_POSTS_RESET_STATE,
  RESET_INITIAL_EDIT,
  CLEAR_NEW_CREATED,
  CLEAR_SELECTED_ITEM,
  SET_INITIAL_SELECTED_CONTENT_ITEM,
  CLEAR_INITIAL_SELECTED_CONTENT_ITEM,
} from './task-posts-actions'

import taskPostsReducer from './task-posts-reducer'

describe('task-posts-reducer.test', () => {
  let state, output

  const MOCK_STATE = {
    postList: [
      { id: 1, name: 'test-post-1' },
      { id: 2, name: 'test-post-2' },
    ],
    isLoaded: true,
    postDetails: {
      post: 'test-post-details',
      isLoaded: true,
    },
    newCreated: undefined,
    initialSelectedItemId: null,
    initialDetailsInEdit: false,
  }

  describe('given no initial state and unknown action', () => {
    beforeEach(() => {
      state = undefined
      output = taskPostsReducer(state, { type: 'UNKNOWN' })
    })

    it('previous state is not mutated', () => {
      expect(state).toBeUndefined()
    })

    describe('and the initial state is returned', () => {
      it('should set postList to empty array', () => {
        expect(output.postList).toEqual([])
      })

      it('should set isLoaded to false', () => {
        expect(output.isLoaded).toEqual(false)
      })

      it('should set newCreated to undefined', () => {
        expect(output.newCreated).toEqual(undefined)
      })

      it('should set initialDetailsInEdit to false', () => {
        expect(output.initialDetailsInEdit).toEqual(false)
      })

      describe('the postDetails', () => {
        it('should have post as undefined', () => {
          expect(output.postDetails.post).toEqual(undefined)
        })

        it('should set isLoaded to false', () => {
          expect(output.postDetails.isLoaded).toEqual(false)
        })
      })
    })
  })

  describe('given RECEIVE_TASK_POST_SUCCESS action', () => {
    beforeEach(() => {
      state = MOCK_STATE
      output = taskPostsReducer(state, {
        type: RECEIVE_TASK_POST_SUCCESS,
        posts: ['noteA', 'noteB'],
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual(MOCK_STATE)
    })

    describe('and the new state is returned', () => {
      it('should set postList to the returned post list', () => {
        expect(output.postList).toEqual(['noteA', 'noteB'])
      })

      it('should set isLoaded to true', () => {
        expect(output.isLoaded).toEqual(true)
      })

      describe('the postDetails', () => {
        it('should have post not changed', () => {
          expect(output.postDetails.post).toEqual(MOCK_STATE.postDetails.post)
        })

        it('should not change isLoaded', () => {
          expect(output.postDetails.isLoaded).toEqual(true)
        })
      })
    })
  })

  describe('given RECEIVE_POST_DETAILS_SUCCESS action', () => {
    beforeEach(() => {
      state = MOCK_STATE
      output = taskPostsReducer(state, {
        type: RECEIVE_POST_DETAILS_SUCCESS,
        post: 'Note C',
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual(MOCK_STATE)
    })

    describe('and the new state is returned', () => {
      it('should not change the postList', () => {
        expect(output.postList).toEqual(MOCK_STATE.postList)
      })

      it('should not change isLoaded', () => {
        expect(output.isLoaded).toEqual(true)
      })

      describe('the postDetails', () => {
        it('should set post details by the post in action', () => {
          expect(output.postDetails.post).toEqual('Note C')
        })

        it('should set isLoaded to true', () => {
          expect(output.postDetails.isLoaded).toEqual(true)
        })
      })
    })
  })

  describe('given UPDATE_POST_SUCCESS action', () => {
    beforeEach(() => {
      state = MOCK_STATE
      output = taskPostsReducer(state, {
        type: UPDATE_POST_SUCCESS,
        updatedPost: { id: 2, name: 'Updated Note' },
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual(MOCK_STATE)
    })

    describe('and the new state is returned', () => {
      it('should update the matching element in the postList', () => {
        expect(output.postList).toEqual([
          { id: 1, name: 'test-post-1' },
          { id: 2, name: 'Updated Note' },
        ])
      })

      it('should not change isLoaded', () => {
        expect(output.isLoaded).toEqual(true)
      })

      describe('the postDetails', () => {
        it('should set post details by the post in action', () => {
          expect(output.postDetails.post).toEqual({
            id: 2,
            name: 'Updated Note',
          })
        })

        it('should set isLoaded to true', () => {
          expect(output.postDetails.isLoaded).toEqual(true)
        })
      })
    })
  })

  describe('given CREATE_POST_IN_CONTEXT_SUCCESS action', () => {
    beforeEach(() => {
      state = MOCK_STATE
      output = taskPostsReducer(state, {
        type: CREATE_POST_IN_CONTEXT_SUCCESS,
        createdPost: { id: 0, name: 'New Note' },
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual(MOCK_STATE)
    })

    describe('and the new state is returned', () => {
      it('should add the created post to top of the postList', () => {
        expect(output.postList).toEqual([
          { id: 0, name: 'New Note' },
          { id: 1, name: 'test-post-1' },
          { id: 2, name: 'test-post-2' },
        ])
      })

      it('should not change isLoaded', () => {
        expect(output.isLoaded).toEqual(true)
      })

      it('should set the newCreated to the created action', () => {
        expect(output.newCreated).toEqual({ id: 0, name: 'New Note' })
      })

      it('should set initialDetailsInEdit to true', () => {
        expect(output.initialDetailsInEdit).toEqual(true)
      })

      describe('the postDetails', () => {
        it('should set post details by the created post in action', () => {
          expect(output.postDetails.post).toEqual({ id: 0, name: 'New Note' })
        })

        it('should set isLoaded to true', () => {
          expect(output.postDetails.isLoaded).toEqual(true)
        })
      })
    })
  })

  describe('given CREATE_POST_OUT_OF_CONTEXT_SUCCESS action', () => {
    beforeEach(() => {
      state = MOCK_STATE
      output = taskPostsReducer(state, {
        type: CREATE_POST_OUT_OF_CONTEXT_SUCCESS,
        createdPost: { id: 0, name: 'New Note' },
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual(MOCK_STATE)
    })

    describe('and the new state is returned', () => {
      it('should set newCreated post to the returned post', () => {
        expect(output.newCreated).toEqual({ id: 0, name: 'New Note' })
      })

      it('should set initialDetailsInEdit to true', () => {
        expect(output.initialDetailsInEdit).toEqual(true)
      })
    })
  })

  describe('given SELECT_ITEM_IN_LIST action', () => {
    beforeEach(() => {
      state = MOCK_STATE
      output = taskPostsReducer(state, {
        type: SELECT_ITEM_IN_LIST,
        selectedItemId: 1,
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual(MOCK_STATE)
    })

    it('new state should have selectedItemId updated', () => {
      expect(output.selectedItemId).toEqual(1)
    })
  })

  describe('given CLEAR_SELECTED_ITEM action', () => {
    beforeEach(() => {
      state = MOCK_STATE
      output = taskPostsReducer(state, {
        type: CLEAR_SELECTED_ITEM,
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual(MOCK_STATE)
    })
    it('new state should have postDetails with post set to undefined', () => {
      expect(output.postDetails.post).toEqual(undefined)
    })
    it('new state should have postDetails with isLoaded set to false', () => {
      expect(output.postDetails.isLoaded).toEqual(false)
    })
    it('new state should have selectedItemId updated', () => {
      expect(output.selectedItemId).toEqual(-1)
    })
  })

  describe('given TASK_POSTS_RESET_STATE action', () => {
    beforeEach(() => {
      state = MOCK_STATE
      output = taskPostsReducer(state, { type: TASK_POSTS_RESET_STATE })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual(MOCK_STATE)
    })

    describe('the new state should be reset which', () => {
      it('should set postList to empty array', () => {
        expect(output.postList).toEqual([])
      })

      it('should set isLoaded to false', () => {
        expect(output.isLoaded).toEqual(false)
      })

      it('new state should have selectedItemId updated', () => {
        expect(output.selectedItemId).toEqual(-1)
      })

      describe('the postDetails', () => {
        it('should have post as undefined', () => {
          expect(output.postDetails.post).toEqual(undefined)
        })

        it('should set isLoaded to false', () => {
          expect(output.postDetails.isLoaded).toEqual(false)
        })
      })
    })
  })

  describe('given RESET_INITIAL_EDIT action', () => {
    beforeEach(() => {
      state = { initialDetailsInEdit: true }
      output = taskPostsReducer(state, { type: RESET_INITIAL_EDIT })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ initialDetailsInEdit: true })
    })

    describe('the new state', () => {
      it('should change the initialDetailsInEdit to false', () => {
        expect(output.initialDetailsInEdit).toEqual(false)
      })
    })
  })

  describe('given CLEAR_NEW_CREATED action', () => {
    beforeEach(() => {
      state = { newCreated: undefined }
      output = taskPostsReducer(state, { type: CLEAR_NEW_CREATED })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ newCreated: undefined })
    })

    describe('the new state', () => {
      it('should change the newCreated to undefined', () => {
        expect(output.newCreated).toEqual(undefined)
      })
    })
  })

  describe('given CLEAR_INITIAL_SELECTED_CONTENT_ITEM action', () => {
    beforeEach(() => {
      state = { selectedItemId: 12345 }
      output = taskPostsReducer(state, {
        type: CLEAR_INITIAL_SELECTED_CONTENT_ITEM,
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ selectedItemId: 12345 })
    })

    describe('the new state', () => {
      it('should change the selectedItemId to -1', () => {
        expect(output.selectedItemId).toEqual(-1)
      })
    })
  })

  describe('given SET_INITIAL_SELECTED_CONTENT_ITEM action', () => {
    beforeEach(() => {
      state = { initialSelectedItemId: -1 }
      output = taskPostsReducer(state, {
        type: SET_INITIAL_SELECTED_CONTENT_ITEM,
        itemId: 987,
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ initialSelectedItemId: -1 })
    })

    describe('the new state', () => {
      it('should change the selectedItemId to -1', () => {
        expect(output.initialSelectedItemId).toEqual(987)
      })
    })
  })

  describe('given ARCHIVE_POST_SUCCESS action', () => {
    beforeEach(() => {
      state = {
        selectedItemId: 123,
        postList: [{ id: 456 }, { id: 789 }],
      }
      output = taskPostsReducer(state, {
        type: ARCHIVE_POST_SUCCESS,
        postId: 456,
      })
    })

    describe('the new state', () => {
      it('should change the selectedItemId to -1', () => {
        expect(output.selectedItemId).toEqual(-1)
      })
      it('should remove the post from the post list', () => {
        expect(output.postList.length).toEqual(1)
      })
      it('should reset the post details', () => {
        expect(output.postDetails.post).toEqual(undefined)
        expect(output.postDetails.isLoaded).toEqual(false)
      })
    })
  })
})
