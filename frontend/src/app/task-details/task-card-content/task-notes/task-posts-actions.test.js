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

import { StatusCodes } from 'http-status-codes'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as dateHelper from '../../../../services/helpers/date-helper'
import * as routeContextHelper from '../../../../services/helpers/route/route-context-helper'
import postService from '../../../../services/post/post-service'
import { SHOW_SNACKBAR } from '../../../global-snackbar/global-snackbar-actions'
import {
  AUTO_SELECT_NEW_CREATED,
  clearItemSelection,
  CLEAR_NEW_CREATED,
  CLEAR_SELECTED_ITEM,
  createPost,
  CREATE_POST_IN_CONTEXT_SUCCESS,
  CREATE_POST_OUT_OF_CONTEXT_SUCCESS,
  fetchPostDetails,
  fetchTaskPosts,
  RECEIVE_POST_DETAILS_SUCCESS,
  RECEIVE_TASK_POST_SUCCESS,
  REQUEST_CREATE_POST,
  REQUEST_POST_DETAILS,
  REQUEST_TASK_POSTS,
  REQUEST_UPDATE_POST,
  reset,
  resetDetailsInitialEdit,
  resetNewCreated,
  RESET_INITIAL_EDIT,
  selectItem,
  SELECT_ITEM_IN_LIST,
  TASK_POSTS_RESET_STATE,
  updatePost,
  UPDATE_POST_SUCCESS,
} from './task-posts-actions'

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe('task-posts-actions', () => {
  describe('resetState', () => {
    let actions

    beforeEach(done => {
      const store = mockStore({})
      store.dispatch(reset())
      actions = store.getActions()
      done()
    })

    it('should dispatch TASK_POSTS_RESET_STATE', () => {
      expect(actions[0].type).toEqual(TASK_POSTS_RESET_STATE)
    })
  })

  describe('selectItem', () => {
    let actions

    beforeEach(done => {
      const store = mockStore({})
      store.dispatch(
        selectItem(undefined, undefined, undefined, undefined, 999)
      )
      actions = store.getActions()
      done()
    })

    it('should dispatch SELECT_ITEM_IN_LIST with the specified index', () => {
      expect(actions[0].type).toEqual(SELECT_ITEM_IN_LIST)
      expect(actions[0].selectedItemId).toEqual('999')
    })
  })

  describe('clearItemSelection', () => {
    let actions

    beforeEach(done => {
      const store = mockStore({})
      store.dispatch(clearItemSelection())
      actions = store.getActions()
      done()
    })

    it('should dispatch CLEAR_SELECTED_ITEM', () => {
      expect(actions[0].type).toEqual(CLEAR_SELECTED_ITEM)
    })
  })

  describe('resetNewCreated', () => {
    let actions

    beforeEach(done => {
      const store = mockStore({})
      store.dispatch(resetNewCreated())
      actions = store.getActions()
      done()
    })

    it('should dispatch CLEAR_NEW_CREATED', () => {
      expect(actions[0].type).toEqual(CLEAR_NEW_CREATED)
    })
  })

  describe('resetDetailsInitialEdit', () => {
    let actions

    beforeEach(done => {
      const store = mockStore({})
      store.dispatch(resetDetailsInitialEdit())
      actions = store.getActions()
      done()
    })

    it('should dispatch RESET_INITIAL_EDIT', () => {
      expect(actions[0].type).toEqual(RESET_INITIAL_EDIT)
    })
  })

  describe('fetchTaskPosts', () => {
    let actions

    beforeEach(() => {
      postService.getPostsByTaskId = jest
        .fn()
        .mockReturnValue(Promise.resolve({ body: 'test-response' }))

      dateHelper.sortObjectArrayByDateField = jest
        .fn()
        .mockReturnValue('sorted-response')

      const store = mockStore({})
      return store.dispatch(fetchTaskPosts(111, 222, 333)).then(() => {
        actions = store.getActions()
      })
    })

    it('postService.fetchTaskPosts is called with the passed in ids', () => {
      expect(postService.getPostsByTaskId).toHaveBeenCalledWith(
        111,
        222,
        333,
        true
      )
    })

    it('dateHelper.sortObjectArrayByDateField is called with the response body', () => {
      expect(dateHelper.sortObjectArrayByDateField).toHaveBeenCalledWith(
        'test-response',
        'dateCreated',
        true
      )
    })

    it('should dispatch REQUEST_TASK_POSTS', () => {
      expect(actions[0].type).toEqual(REQUEST_TASK_POSTS)
      expect(actions[0].taskId).toEqual(333)
    })

    it('should dispatch RECEIVE_TASK_POST_SUCCESS', () => {
      expect(actions[1].type).toEqual(RECEIVE_TASK_POST_SUCCESS)
      expect(actions[1].posts).toEqual('sorted-response')
    })
  })

  describe('fetchPostDetails', () => {
    let actions

    beforeEach(() => {
      postService.getPost = jest
        .fn()
        .mockReturnValue(
          Promise.resolve({ status: StatusCodes.OK, body: 'test-response' })
        )

      const store = mockStore({})
      return store.dispatch(fetchPostDetails(111, 222, 333, 444)).then(() => {
        actions = store.getActions()
      })
    })

    it('should dispatch REQUEST_POST_DETAILS', () => {
      expect(actions[0].type).toEqual(REQUEST_POST_DETAILS)
      expect(actions[0].postId).toEqual(444)
    })

    it('should dispatch RECEIVE_TASK_POST_SUCCESS', () => {
      expect(actions[1].type).toEqual(RECEIVE_POST_DETAILS_SUCCESS)
      expect(actions[1].post).toEqual('test-response')
    })
  })

  describe('updatePost', () => {
    let actions

    beforeEach(() => {
      postService.updatePost = jest
        .fn()
        .mockReturnValue(
          Promise.resolve({ body: 'test-response', status: StatusCodes.OK })
        )

      const store = mockStore({})
      return store.dispatch(updatePost(111, 222, 333, 444)).then(() => {
        actions = store.getActions()
      })
    })

    it('should dispatch REQUEST_UPDATE_POST', () => {
      expect(actions[0].type).toEqual(REQUEST_UPDATE_POST)
      expect(actions[0].postId).toEqual(444)
    })

    it('should dispatch UPDATE_POST_SUCCESS', () => {
      expect(actions[1].type).toEqual(UPDATE_POST_SUCCESS)
      expect(actions[1].updatedPost).toEqual('test-response')
    })
  })

  describe('createPost', () => {
    let actions

    describe('in context', () => {
      beforeEach(() => {
        postService.createPost = jest
          .fn()
          .mockReturnValue(Promise.resolve({ body: 'test-response' }))

        routeContextHelper.isInSpecificTaskContext = jest
          .fn()
          .mockReturnValue(true)

        const store = mockStore({})
        return store
          .dispatch(createPost(111, 222, 333, 'test-name', false))
          .then(() => {
            actions = store.getActions()
          })
      })

      it('should dispatch REQUEST_CREATE_NOTE', () => {
        expect(actions[0].type).toEqual(REQUEST_CREATE_POST)
      })

      it('should dispatch SHOW_SNACKBAR without action button', () => {
        expect(actions[1].type).toEqual(SHOW_SNACKBAR)
        expect(actions[1].action).toEqual(undefined)
      })

      it('should dispatch CREATE_POST_IN_CONTEXT_SUCCESS', () => {
        expect(actions[2].type).toEqual(AUTO_SELECT_NEW_CREATED)
      })

      it('should dispatch CREATE_POST_IN_CONTEXT_SUCCESS', () => {
        expect(actions[3].type).toEqual(CREATE_POST_IN_CONTEXT_SUCCESS)
        expect(actions[3].createdPost).toEqual('test-response')
      })
    })

    describe('out of context', () => {
      beforeEach(() => {
        postService.createPost = jest
          .fn()
          .mockReturnValue(Promise.resolve({ body: 'test-response' }))

        routeContextHelper.isInSpecificTaskContext = jest
          .fn()
          .mockReturnValue(false)

        const store = mockStore({})
        return store
          .dispatch(createPost(111, 222, 333, 'test-name'))
          .then(() => {
            actions = store.getActions()
          })
      })

      it('should dispatch REQUEST_CREATE_POST', () => {
        expect(actions[0].type).toEqual(REQUEST_CREATE_POST)
      })

      it('should dispatch CREATE_POST_OUT_OF_CONTEXT_SUCCESS with the created note', () => {
        expect(actions[2].type).toEqual(CREATE_POST_OUT_OF_CONTEXT_SUCCESS)
        expect(actions[2].createdPost).toEqual('test-response')
      })
    })
  })
})
