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

import { getTypeObject } from './action-helper'

export const templateToProjectActions = {
  RESET_TEMPLATE_TO_PROJECT_STATE: 'RESET_TEMPLATE_TO_PROJECT_STATE',
  UPDATE_INCLUDE_POSTS_OPTION: 'UPDATE_INCLUDE_POSTS_OPTION',
  UPDATE_INCLUDE_DESCRIPTIONS_OPTION: 'UPDATE_INCLUDE_DESCRIPTIONS_OPTION',
  UPDATE_INCLUDE_RESOURCES_OPTION: 'UPDATE_INCLUDE_RESOURCES_OPTION',
  UPDATE_NEW_PROJECT_NAME: 'UPDATE_NEW_PROJECT_NAME',
  UPDATE_USE_FULL_TEMPLATE: 'UPDATE_USE_FULL_TEMPLATE',
  UPDATE_USE_TEMPLATE_OPTION_CONFIRMED: 'UPDATE_USE_TEMPLATE_OPTION_CONFIRMED',
  UPDATE_TASK_SELECTION_CONFIRMED: 'UPDATE_TASK_SELECTION_CONFIRMED',
}
const actions = templateToProjectActions

const _resetTemplateToProjectState = () =>
  getTypeObject(actions.RESET_TEMPLATE_TO_PROJECT_STATE)

const _updateIncludePostsOption = includeDescriptions => {
  return getTypeObject(actions.UPDATE_INCLUDE_POSTS_OPTION, {
    includePosts: includeDescriptions,
  })
}
const _updateIncludeDescriptionsOption = includeDescriptions => {
  return getTypeObject(actions.UPDATE_INCLUDE_DESCRIPTIONS_OPTION, {
    includeDescriptions: includeDescriptions,
  })
}

const _updateIncludeResourcesOption = includeResources => {
  return getTypeObject(actions.UPDATE_INCLUDE_RESOURCES_OPTION, {
    includeResources: includeResources,
  })
}

const _updateUseFullTemplate = useFullTemplate => {
  return getTypeObject(actions.UPDATE_USE_FULL_TEMPLATE, {
    useFullTemplate: useFullTemplate,
  })
}

const _updateUseTemplateOptionConfirmed = useTemplateOptionConfirmed => {
  return getTypeObject(actions.UPDATE_USE_TEMPLATE_OPTION_CONFIRMED, {
    useTemplateOptionConfirmed: useTemplateOptionConfirmed,
  })
}

const _updateNewProjectName = newName => {
  return getTypeObject(actions.UPDATE_NEW_PROJECT_NAME, {
    newProjectName: newName,
  })
}

const _updateTaskSelectionConfirmed = taskSelectionConfirmed => {
  return getTypeObject(actions.UPDATE_TASK_SELECTION_CONFIRMED, {
    taskSelectionConfirmed: taskSelectionConfirmed,
  })
}
export const templateToProject = {
  resetTemplateToProjectState: () => dispatch =>
    dispatch(_resetTemplateToProjectState()),

  updateIncludePostsOption: includePosts => dispatch =>
    dispatch(_updateIncludePostsOption(includePosts)),

  updateIncludeDescriptionsOption: includeDescriptions => dispatch =>
    dispatch(_updateIncludeDescriptionsOption(includeDescriptions)),

  updateUseFullTemplate: useFullTemplate => dispatch =>
    dispatch(_updateUseFullTemplate(useFullTemplate)),

  updateUseTemplateOptionConfirmed: useFullTemplate => dispatch =>
    dispatch(_updateUseTemplateOptionConfirmed(useFullTemplate)),

  updateNewProjectName: newProjectName => dispatch =>
    dispatch(_updateNewProjectName(newProjectName)),

  updateTaskSelectionConfirmed: taskSelectionConfirmed => dispatch =>
    dispatch(_updateTaskSelectionConfirmed(taskSelectionConfirmed)),

  updateIncludeResourcesOption: includeResources => dispatch =>
    dispatch(_updateIncludeResourcesOption(includeResources)),
}
