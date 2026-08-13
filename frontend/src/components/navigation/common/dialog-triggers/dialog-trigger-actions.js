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

export const CREATE_ORGANISATION_FLOW = 'CREATE_ORGANISATION_FLOW'
export const CREATE_NOTE_FLOW = 'CREATE_NOTE_FLOW'
export const CREATE_TASK_FLOW = 'CREATE_TASK_FLOW'
export const CREATE_TASK_FROM_TEMPLATE_FLOW = 'CREATE_TASK_FROM_TEMPLATE_FLOW'
export const CREATE_TEMPLATE_FLOW = 'CREATE_TEMPLATE_FLOW'
export const CREATE_TEMPLATE_TASK_FLOW = 'CREATE_TEMPLATE_TASK_FLOW'
export const CREATE_TEMPLATE_MILESTONE_FLOW = 'CREATE_TEMPLATE_MILESTONE_FLOW'
export const CREATE_USER_FLOW = 'CREATE_USER_FLOW'
export const CREATE_TEMPLATE_NOTE_FLOW = 'CREATE_TEMPLATE_NOTE_FLOW'
export const CREATE_NEW_MATTER_FLOW = 'CREATE_NEW_MATTER_FLOW'
export const CREATE_MILESTONE_FLOW = 'CREATE_MILESTONE_FLOW'
export const RESET_DIALOG = 'RESET_DIALOG'
export const UNBLOCKED_TASKS_DIALOG = 'UNBLOCKED_TASKS_DIALOG'

export const triggerOrganisationFlow = () => {
  return {
    type: CREATE_ORGANISATION_FLOW,
  }
}
export const triggerCreateNoteFlow = () => {
  return {
    type: CREATE_NOTE_FLOW,
  }
}
export const triggerCreateTaskFlow = () => {
  return {
    type: CREATE_TASK_FLOW,
  }
}
export const triggerCreateTaskFromTemplateFlow = () => {
  return {
    type: CREATE_TASK_FROM_TEMPLATE_FLOW,
  }
}
export const triggerCreateTemplateFlow = () => {
  return {
    type: CREATE_TEMPLATE_FLOW,
  }
}
export const triggerCreateTemplateTaskFlow = () => {
  return {
    type: CREATE_TEMPLATE_TASK_FLOW,
  }
}
export const triggerCreateTemplateMilestoneFlow = () => {
  return {
    type: CREATE_TEMPLATE_MILESTONE_FLOW,
  }
}
export const triggerCreateUserFlow = () => {
  return {
    type: CREATE_USER_FLOW,
  }
}
export const triggerCreateTemplateNoteFlow = () => {
  return {
    type: CREATE_TEMPLATE_NOTE_FLOW,
  }
}
export const triggerCreateNewMatterFlow = () => {
  return {
    type: CREATE_NEW_MATTER_FLOW,
  }
}
export const triggerCreateMilestoneFlow = () => {
  return {
    type: CREATE_MILESTONE_FLOW,
  }
}
export const triggerResetDialog = () => {
  return {
    type: RESET_DIALOG,
  }
}

export const triggerUnblockedTasksDialog = () => {
  return {
    type: UNBLOCKED_TASKS_DIALOG,
  }
}
