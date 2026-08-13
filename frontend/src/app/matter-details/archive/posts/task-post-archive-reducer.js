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

import { postArchiveActionTypes as actions } from './task-post-archive-actions'

const initialState = {
  archive: {
    archivedPosts: [],
  },
  restore: {
    showDialog: false,
    originalTask: {
      isLoading: false,
      isLoaded: false,
      task: {},
    },
    originalProject: {},
  },
  isLoading: false,
  isLoaded: false,
}

const taskPostArchiveReducer = (state, action) => {
  if (!state) {
    return initialState
  }

  switch (action.type) {
    case actions.SHOW_RESTORE_POST_DIALOG:
      return {
        ...state,
        restore: {
          ...state.restore,
          showDialog: true,
          post: action.post,
        },
      }
    case actions.HIDE_RESTORE_POST_DIALOG:
      return {
        ...state,
        restore: {
          ...state.restore,
          showDialog: false,
        },
      }
    case actions.RESET_ARCHIVED_POSTS:
      return initialState
    case actions.GET_ARCHIVED_POSTS:
      return { ...state, isLoading: true }
    case actions.GET_TARGET_TASK:
      return {
        ...state,
        restore: {
          ...state.restore,
          originalTask: {
            isLoading: true,
            isLoaded: false,
            task: {},
          },
        },
      }
    case actions.RECEIVE_TARGET_TASK_SUCCESS:
      return {
        ...state,
        restore: {
          ...state.restore,
          originalTask: {
            isLoading: false,
            isLoaded: true,
            task: action.task,
          },
          originalProject: {
            project: action.project,
          },
        },
      }
    case actions.RECEIVE_ARCHIVED_POSTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        archive: { archivedPosts: action.archivedPosts },
      }
    case actions.RESTORED_POST_SUCCESS:
      return {
        ...state,
        archive: {
          archivedPosts: state.archive.archivedPosts.filter(
            post => post.id !== action.postId
          ),
        },
      }
    default:
      return state
  }
}

export default taskPostArchiveReducer
