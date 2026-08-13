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

import { templateToProjectActions as actions } from './template-to-project-actions'

const initialTemplateToProjectState = {
  newProjectName: '',
  includePosts: true,
  includeDescriptions: true,
  includeResources: true,
  useFullTemplate: true,
  useTemplateOptionConfirmed: false,
  taskSelectionConfirmed: false,
}

export default function templateToProjectReducer(
  state = initialTemplateToProjectState,
  action
) {
  switch (action.type) {
    case actions.UPDATE_NEW_PROJECT_NAME:
      return { ...state, newProjectName: action.newProjectName }
    case actions.UPDATE_INCLUDE_POSTS_OPTION:
      return { ...state, includePosts: action.includePosts }
    case actions.UPDATE_INCLUDE_RESOURCES_OPTION:
      return { ...state, includeResources: action.includeResources }
    case actions.UPDATE_USE_FULL_TEMPLATE:
      return { ...state, useFullTemplate: action.useFullTemplate }
    case actions.UPDATE_USE_TEMPLATE_OPTION_CONFIRMED:
      return {
        ...state,
        useTemplateOptionConfirmed: action.useTemplateOptionConfirmed,
      }
    case actions.RESET_TEMPLATE_TO_PROJECT_STATE:
      return { ...initialTemplateToProjectState }
    case actions.UPDATE_TASK_SELECTION_CONFIRMED:
      return {
        ...state,
        taskSelectionConfirmed: action.taskSelectionConfirmed,
      }
    case actions.UPDATE_INCLUDE_DESCRIPTIONS_OPTION:
      return { ...state, includeDescriptions: action.includeDescriptions }
    default:
      return state
  }
}
