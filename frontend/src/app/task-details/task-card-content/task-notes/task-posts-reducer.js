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
  ADD_POST_AUTHOR_SUCCESS,
  DELETE_POST_AUTHOR_SUCCESS,
} from '../TaskAuthors/task-authors-actions'
import {
  ADD_POST_MEMBER_SUCCESS,
  DELETE_POST_MEMBER_SUCCESS,
} from '../TaskMembers/task-members-actions'
import { updatePostInList } from './post-helpers'
import {
  ARCHIVE_POST_SUCCESS,
  AUTO_SELECT_NEW_CREATED,
  CLEAR_INITIAL_SELECTED_CONTENT_ITEM,
  CLEAR_NEW_CREATED,
  CLEAR_SAVE_META,
  CLEAR_SELECTED_ITEM,
  CREATE_POST_IN_CONTEXT_SUCCESS,
  CREATE_POST_OUT_OF_CONTEXT_SUCCESS,
  RECEIVE_POST_DETAILS_FAIL,
  RECEIVE_POST_DETAILS_SUCCESS,
  RECEIVE_TASK_POST_SUCCESS,
  REQUEST_POST_DETAILS,
  REQUEST_UPDATE_POST,
  RESET_INITIAL_EDIT,
  SELECT_ITEM_IN_LIST,
  SET_INITIAL_SELECTED_CONTENT_ITEM,
  TASK_POSTS_RESET_STATE,
  TOGGLE_EDIT_MODE,
  UPDATE_POST_SUCCESS,
  UPDATE_POST_SUCCESS_DONT_SET_POST,
  UPDATE_POST_TEXT,
} from './task-posts-actions'

const initialState = {
  postList: [],
  selectedItemId: -1,
  isLoaded: false,
  postDetails: {
    post: undefined,
    isLoaded: false,
    isSaving: false,
    isAutoSaving: false,
    lastSaved: undefined,
    changesUnsaved: false,
  },
  newCreated: undefined,
  autoSelectNewCreated: false,
  initialSelectedItemId: null,
  initialDetailsInEdit: false,
  users: [],
  taskId: -1,
}

const addPostAuthor = (post, newAuthor) => {
  const formattedNewAuthor = { id: 0, user: newAuthor }
  let clonedPost = { ...post }
  clonedPost.authors = [formattedNewAuthor, ...clonedPost.authors]
  return clonedPost
}

const deletePostAuthor = (post, deletedAuthor) => {
  let clonedPost = { ...post }
  clonedPost.authors = clonedPost.authors.filter(
    author => author.user.id !== deletedAuthor.id
  )
  return clonedPost
}

const deletePostMember = (users, deletedUser) => {
  let clonedMembers = { users }
  clonedMembers = clonedMembers.users.filter(
    user => user.id !== deletedUser.user.id
  )
  return clonedMembers
}

export default function taskPostsReducer(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_TASK_POST_SUCCESS:
      return {
        ...state,
        selectedItemId:
          state.initialSelectedItemId !== null
            ? state.initialSelectedItemId
            : -1,
        postList: [...action.posts],
        initialSelectedItemId: null,
        isLoaded: true,
        taskId: action.taskId,
      }
    case REQUEST_POST_DETAILS:
      return {
        ...state,
        postDetails: {
          isLoaded: false,
        },
      }
    case RECEIVE_POST_DETAILS_SUCCESS:
      return {
        ...state,
        postDetails: {
          ...state.postDetails,
          post: action.post,
          isLoaded: true,
        },
      }
    case RECEIVE_POST_DETAILS_FAIL:
      return {
        ...state,
        postDetails: {
          post: undefined,
          isLoaded: true,
        },
      }
    case UPDATE_POST_SUCCESS:
      return {
        ...state,
        postList: updatePostInList(state.postList, action.updatedPost),
        postDetails: {
          ...state.postDetails,
          post: action.updatedPost,
          isSaving: false,
          isAutoSaving: false,
          changesUnsaved: false,
          lastSaved: new Date(),
        },
      }
    case UPDATE_POST_SUCCESS_DONT_SET_POST:
      return {
        ...state,
        postList: updatePostInList(state.postList, action.updatedPost),
        postDetails: {
          ...state.postDetails,
          isSaving: false,
          isAutoSaving: false,
          changesUnsaved: false,
        },
      }
    case CREATE_POST_IN_CONTEXT_SUCCESS:
      return {
        ...state,
        postList: [action.createdPost, ...state.postList],
        postDetails: {
          ...state.postDetails,
          post: action.createdPost,
          isLoaded: true,
        },
        newCreated: action.createdPost,
        initialDetailsInEdit: true,
      }
    case CREATE_POST_OUT_OF_CONTEXT_SUCCESS:
      return {
        ...state,
        newCreated: action.createdPost,
        initialDetailsInEdit: true,
      }
    case ARCHIVE_POST_SUCCESS: {
      return {
        ...state,
        postList: state.postList.filter(post => post.id !== action.postId),
        selectedItemId: -1,
        postDetails: {
          post: undefined,
          isLoaded: false,
        },
      }
    }
    case SELECT_ITEM_IN_LIST:
      return {
        ...state,
        selectedItemId: action.selectedItemId,
      }
    case SET_INITIAL_SELECTED_CONTENT_ITEM:
      return {
        ...state,
        initialSelectedItemId: action.itemId,
      }
    case CLEAR_INITIAL_SELECTED_CONTENT_ITEM:
      return {
        ...state,
        selectedItemId: -1,
      }
    case CLEAR_SELECTED_ITEM: {
      return {
        ...state,
        selectedItemId: -1,
        postDetails: {
          post: undefined,
          isLoaded: false,
        },
      }
    }
    case TASK_POSTS_RESET_STATE:
      return {
        ...state,
        postList: [],
        isLoaded: false,
        selectedItemId: -1,
        postDetails: {
          post: undefined,
          isLoaded: false,
        },
        taskId: -1,
      }
    case AUTO_SELECT_NEW_CREATED:
      return { ...state, autoSelectNewCreated: true }
    case CLEAR_NEW_CREATED:
      return {
        ...state,
        newCreated: undefined,
        autoSelectNewCreated: false,
      }
    case RESET_INITIAL_EDIT:
      return {
        ...state,
        initialDetailsInEdit: false,
      }
    case ADD_POST_AUTHOR_SUCCESS:
      return {
        ...state,
        postDetails: {
          post: addPostAuthor(state.postDetails.post, action.user),
          isLoaded: true,
        },
      }
    case DELETE_POST_AUTHOR_SUCCESS:
      return {
        ...state,
        postDetails: {
          post: deletePostAuthor(state.postDetails.post, action.user),
          isLoaded: true,
        },
        postList: action.removedSelfFromPrivatePost
          ? state.postList.filter(post => post.id !== state.postDetails.post.id)
          : state.postList,
      }
    case ADD_POST_MEMBER_SUCCESS:
      return {
        ...state,
        postDetails: {
          ...state.postDetails,
          post: {
            ...state.postDetails.post,
            members: action.users.map(pm => {
              return {
                id: pm.id,
                user: pm.user.length !== 0 ? pm.user[0] : pm.placeholder[0],
              }
            }),
          },
        },
      }
    case DELETE_POST_MEMBER_SUCCESS:
      return {
        ...state,
        postDetails: {
          ...state.postDetails,
          post: {
            ...state.postDetails.post,
            members: deletePostMember(
              state.postDetails.post.members,
              action.user
            ),
          },
        },
      }
    case REQUEST_UPDATE_POST:
      return {
        ...state,
        postDetails: {
          ...state.postDetails,
          isSaving: true,
          isAutoSaving: action.isAutoSaving,
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
