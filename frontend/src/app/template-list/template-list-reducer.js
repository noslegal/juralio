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
  REQUEST_TEMPLATES,
  RECEIVE_TEMPLATES,
  FAVOURITE_TEMPLATE_IN_LIST,
} from './template-list-actions'
import {
  CREATE_TEMPLATE_SUCCESS,
  VIEWED_ONCE_AFTER_CREATION,
} from '../template/template-actions'

const initialTemplateStates = {
  isLoaded: false,
  viewedOnceAfterCreation: true,
  templates: [],
}

export default function templatestReducer(
  state = initialTemplateStates,
  action
) {
  switch (action.type) {
    case FAVOURITE_TEMPLATE_IN_LIST:
      const templates = [...state.templates]
      templates.forEach(template => {
        if (template.id === action.templateId) {
          template.isFavourited = action.isFavourited
        }
      })
      return { ...state, templates }
    case REQUEST_TEMPLATES:
      return { ...state, isLoaded: false }
    case RECEIVE_TEMPLATES:
      return { ...state, templates: action.templates, isLoaded: true }
    case CREATE_TEMPLATE_SUCCESS:
      return {
        ...state,
        templates: [...state.templates, action.template],
        viewedOnceAfterCreation: false,
      }
    case VIEWED_ONCE_AFTER_CREATION:
      return { ...state, viewedOnceAfterCreation: true }
    default:
      return state
  }
}
