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

export const EXPORT_NAMES = {
  ACTIVE_USERS: 'ActiveUsers',
  MATTER: 'Matter',
  MEETING_NOTE: 'MeetingNote',
  POST: 'Post',
  TASK_DETAILS: 'TaskDetails',
  TEMPLATE_TASK_LIST: 'TemplateTaskList',
  WORKSTREAM_TASK_LIST: 'WorkStreamTaskList',
  DELETED_ORGS: 'DeletedOrgs',
  ADVISOR_COSTS: 'AdvisorCosts',
  CLIENT_COSTS: 'ClientCosts',
}

export const EXPORT_FORMATS = {
  EXCEL: 'xlsx',
  WORD: 'docx',
}

// Note these are in half points so double what is seen in the Word UI.
export const FONT_SIZES = {
  SMALLER: 12,
  SMALL: 16,
  NORMAL: 20,
  LARGE: 22,
  LARGER: 24,
  SUBHEADING: 28,
  HEADING_MEDIUM: 32,
  HEADING: 36,
}

export const FONTS = {
  STANDARD_FONT: { name: 'Montserrat' },
  STANDARD_FONT_SEMIBOLD: { name: 'Segoe UI Semibold' },
}

export const NEW_FONTS = {
  STANDARD_FONT: { name: 'Arial' },
}
