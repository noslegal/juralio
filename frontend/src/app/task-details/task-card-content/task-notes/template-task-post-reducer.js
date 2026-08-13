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
  RECEIVE_TEMPLATE_TASK_POST_SUCCESS,
  RECEIVE_TEMPLATE_POST_DETAILS_SUCCESS,
  RESET_TEMPLATE_TASK_POST_LIST,
  CREATE_TEMPLATE_POST_OUT_OF_CONTEXT_SUCCESS,
  CREATE_TEMPLATE_POST_IN_CONTEXT_SUCCESS,
  SELECT_TEMPLATE_ITEM_IN_LIST,
  UPDATE_TEMPLATE_POST,
  UPDATE_TEMPLATE_POST_SUCCESS,
  CLEAR_SELECTED_ITEM,
  REMOVE_TEMPLATE_POST_SUCCESS,
  UPDATE_POST_TEXT,
  TOGGLE_EDIT_MODE,
  CLEAR_SAVE_META,
  RESET_INITIAL_EDIT,
  CLEAR_NEW_CREATED,
} from './template-task-post-actions'
import { updatePostInList } from './post-helpers'

const initialState = {
  postList: [],
  isLoaded: false,
  selectedItemId: -1,
  postDetails: {
    post: undefined,
    isLoaded: false,
    isSaving: false,
    isAutoSaving: false,
    lastSaved: undefined,
    changesUnsaved: false,
  },
  newCreated: undefined,
  initialDetailsInEdit: false,
}

export default function templateTaskPostReducer(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_TEMPLATE_TASK_POST_SUCCESS:
      return {
        ...state,
        postList: [...action.posts],
        isLoaded: true,
      }
    case SELECT_TEMPLATE_ITEM_IN_LIST:
      return {
        ...state,
        selectedItemId: action.selectedItemId,
      }
    case RESET_TEMPLATE_TASK_POST_LIST:
      return {
        postList: [],
        isLoaded: false,
        selectedItemId: -1,
        postDetails: {
          post: undefined,
          isLoaded: false,
        },
      }
    case RESET_INITIAL_EDIT:
      return {
        ...state,
        initialDetailsInEdit: false,
      }
    case CLEAR_SELECTED_ITEM:
      return {
        ...state,
        selectedItemId: -1,
        postDetails: {
          post: undefined,
          isLoaded: false,
        },
      }
    case CLEAR_NEW_CREATED:
      return {
        ...state,
        newCreated: undefined,
      }
    case CREATE_TEMPLATE_POST_IN_CONTEXT_SUCCESS:
      return {
        ...state,
        postList: [action.createdPost, ...state.postList],
        isLoaded: true,
        selectedItemId: action.createdPost.id,
        initialDetailsInEdit: true,
        newCreated: action.createdPost,
      }
    case CREATE_TEMPLATE_POST_OUT_OF_CONTEXT_SUCCESS:
      return {
        ...state,
        postList: [action.createdPost, ...state.postList],
        isLoaded: true,
        selectedItemId: action.createdPost.id,
        initialDetailsInEdit: true,
        newCreated: action.createdPost,
      }
    case RECEIVE_TEMPLATE_POST_DETAILS_SUCCESS:
      return {
        ...state,
        postDetails: {
          ...state.postDetails,
          post: action.post,
          isLoaded: true,
        },
      }
    case REMOVE_TEMPLATE_POST_SUCCESS:
      return {
        ...state,
        postList: state.postList.filter(post => post.id !== action.postId),
        selectedItemId: -1,
        postDetails: {
          post: undefined,
          isLoaded: false,
        },
      }
    case UPDATE_TEMPLATE_POST:
      return {
        ...state,
        postDetails: {
          ...state.postDetails,
          isSaving: true,
          isAutoSaving: action.isAutoSaving,
        },
      }
    case UPDATE_TEMPLATE_POST_SUCCESS:
      return {
        ...state,
        postList: updatePostInList(state.postList, action.post),
        postDetails: {
          ...state.postDetails,
          post: action.post,
          isLoaded: true,
          isSaving: false,
          isAutoSaving: false,
          changesUnsaved: false,
          lastSaved: new Date(),
        },
      }
    case UPDATE_POST_TEXT:
      return {
        ...state,
        postDetails: {
          ...state.postDetails,
          post: {
            ...state.postDetails.post,
            description: action.updatedPost,
          },
          changesUnsaved: true,
        },
      }
    case TOGGLE_EDIT_MODE:
      return {
        ...state,
        postDetails: {
          ...state.postDetails,
          editMode: action.editMode,
        },
      }
    case CLEAR_SAVE_META:
      return {
        ...state,
        postDetails: {
          ...state.postDetails,
          isSaving: false,
          lastSaved: undefined,
          changesUnsaved: false,
        },
      }
    default:
      return state
  }
}
