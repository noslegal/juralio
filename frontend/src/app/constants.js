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

export const EMPTY_STRING = ''

export const ACTIVITIES = {
  MATTER_ADMIN: 'MATTER_ADMIN',
  MATTER_TEAM_MEMBER: 'MATTER_TEAM_MEMBER',
  MATTER_VIEWER: 'MATTER_VIEWER',
  MATTER_COSTS: 'MATTER_COSTS',
}

export const REGEX = {
  VALID_URL: /^(https):\/\/[^ "]+$/,
}

export const OPERATION_MODE = {
  EDIT: 'Edit',
  VIEW: 'View',
  CREATE: 'Create',
}

export const TASK_MAP_VIEW_MODE_ENUM = {
  STANDARD: 0,
  DETAILED: 1,
  COMPACT: 2,
}

export const API_ERROR_CODE = {
  DUPLICATE_PROJECT_NAME: '250',
  PROJECT_CREATION_NOT_PERMITTED: '259',

  OLD_PASSWORD_INCORRECT: '101',
  NEW_PASSWORDS_DO_NOT_MATCH: '102',
  PASSWORD_COMPLEXITY_NOT_MET: '103',
  NEW_PASSWORD_MATCHES_OLD_PASSWORD: '104',
  USER_ALREADY_HAS_ORGANISATION: '105',
  USER_LOCKED: '106',

  HAS_NOT_STARTED_PARENTS: 310,
  HAS_NOT_DONE_CHILDREN: 311,
  HAS_DONE_PARENTS: 312,
  HAS_ACTIVE_AND_DONE_CHILDREN: 313,
  HAS_NOT_STARTED_PARENTS_AND_NOT_DONE_CHILDREN: 314,
  HAS_DONE_PARENTS_AND_DONE_CHILDREN: 315,
  HAS_NOT_REQUIRED_PARENTS: 316,
  HAS_NOT_REQUIRED_PARENTS_AND_CHILDREN: 317,
  HAS_NOT_REQUIRED_CHILDREN: 318,

  HAS_PARENT_IN_PROGRESS_ASD_LATER_THAN_CHILD_DONE_AED: 319,
  DATE_CONSISTENCY_EXCEPTION: 320,
  INCONSISTENT_PLANNED_DATES_REMOVED: 321,

  LINKED_TASK_WOULD_START_BEFORE_PARENT: 328,
  LINKED_TASK_WOULD_END_AFTER_PARENT: 329,
  LINKED_TASK_WOULD_END_BEFORE_IT_STARTED: 330,
  LINKED_TASK_WOULD_START_AFTER_IT_FINISHED: 331,

  TASK_BLOCKED_BY_IN_PROGRESS: 335,

  POST_CONTENT_TOO_LONG: 350,

  FAILED_SSO_AUTHENTICATION: 370,
  NO_MATCHING_JURALIO_USER: 371,
  EXTERNAL_USER_NO_FORCE_ROLE_CHANGE: 372,
  USERNAME_ALREADY_IN_USE: 373,
  PASSWORD_DOES_NOT_MATCH: 374,
  MAGIC_LINK_EXPIRED: 375,
  MAGIC_LINK_ALREADY_USED: 376,
  BAD_MAGIC_LINK: 377,
}

export const LOGIN_FAILURE_REASONS = {
  INCORRECT_CREDENTIALS: 'INCORRECT_CREDENTIALS',
  LOCKED: 'LOCKED',
  PASSWORD_EXPIRED: 'EXPIRED',
  OLD_PASSWORD_INCORRECT: 'OLD_PASSWORD_INCORRECT',
  MFA_REGISTRATION_REQUIRED: 'MFA_REGISTRATION_REQUIRED',
  MFA_TOKEN_INVALID: 'MFA_TOKEN_INVALID',
  MFA_TOKEN_REQUIRED: 'MFA_TOKEN_REQUIRED',
  NO_ORGANISATION: 'NO_ORGANISATION',
  BAD_CREDENTIALS: 'BAD_CREDENTIALS',
  USER_DOES_NOT_EXIST: 'USER_DOES_NOT_EXIST',
  USER_LAPSED: 'USER_LAPSED',
}

export const MICROSOFT_AUTHENTICATION = {
  FAILED_SSO_AUTHENTICATION: 'Bad Microsoft Credentials',
  NO_MATCHING_JURALIO_USER: 'No User Exists',
}

export const SSO = {
  JURALIO: 'juralio',
  MICROSOFT: 'microsoft',
  OKTA: 'okta',
  SAML: 'saml',
  GOOGLE: 'google',
}

export const CONFIG = {
  TODO_RANGE_IN_DAYS: 28,
  SUBTASK_LIMIT: 8,
  LEVEL_A_TASK_LIMIT: 16,
  PROJECT_TASK_LIMIT: 300,
  POSTS_LIMIT: 500,
}

export const TASK_STATUS = {
  NOT_REQUIRED: 'task-not-required',
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
  DONE_MILESTONE: 'reached',
  NOT_STARTED_MILESTONE: 'not yet reached',
}

export const ASSUMPTION_STATUS = {
  ON_TARGET: 'on-target',
  AT_RISK: 'at-risk',
  MET: 'met',
  NOT_MET: 'not-met',
}

export const DATE_TYPES = {
  PLANNED_START: 'Planned Start Date',
  PLANNED_END: 'Planned End Date',
  ACTUAL_START: 'Actual Start Date',
  ACTUAL_END: 'Actual End Date',
}

export const MATTER_TYPE = {
  STANDARD: 'standard',
}

export const MATTER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CLOSED: 'closed',
  PENDING_DELETION: 'pending deletion',
}

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.NOT_REQUIRED]: 'Not required',
  [TASK_STATUS.NOT_STARTED]: 'Not started',
  [TASK_STATUS.IN_PROGRESS]: 'In progress',
  [TASK_STATUS.DONE]: 'Done',
  [TASK_STATUS.DONE_MILESTONE]: 'Reached',
  [TASK_STATUS.NOT_STARTED_MILESTONE]: 'Not yet reached',
}

export const TASK_MAP = {
  MAX_TASK_DEPTH: 6,
}

export const TASK_CELL_COLOUR = {
  FILTERED_OUT: 'FILTERED_OUT',
  FILTERED_IN: 'FILTERED_IN',
  NEW_TASKS: 'NEW_TASKS',
  NORMAL: 'NORMAL',
}

export const TASK_MAP_LEVELS = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
}

export const TASK_MAP_LEVELS_INTEGER_LOOKUP = {
  1: 'A',
  2: 'B',
  3: 'C',
  4: 'D',
  5: 'E',
  6: 'F',
}

export const DATE_FORMAT_FULL = 'ddd D MMM YYYY'
export const DATE_FORMAT_DAY_MONTH_YEAR = 'D MMM YYYY'
export const DAY_MONTH_FORMAT = 'D MMM'
export const DATE_FORMAT_NO_YEAR = 'ddd D MMM'
export const DATE_FORMAT_MONTH_YEAR = 'MMM YYYY'
export const TIME_FORMAT_HOURS_MINUTES = 'HH:mm'
export const TIME_FORMAT_HOURS_MINUTES_SECONDS = 'HH:mm:SS'
export const TIME_STAMP_FORMAT_FULL = 'YYYY-MM-DD-HH-mm'
export const DESKTOP_DIALOG_WIDTH = 520
export const DESKTOP_DIALOG_HEIGHT = 560

export const APP_CONTEXT = {
  ALL_MATTERS: 'ALL_MATTERS',
  PROJECT: 'PROJECT',
  TASK: 'TASK',
}

export const FAB_CONTEXT = {
  GLOBAL_CONTEXT: 'global_context',
  PROJECT_CONTEXT: 'project_context',
  POST_CONTEXT: 'post_context',
  TEMPLATE_CONTEXT: 'template_context',
  TEMPLATE_LIST_CONTEXT: 'template_list_context',
  ORG_ADMIN_CONTEXT: 'org_admin_context',
  SYS_ADMIN_CONTEXT: 'sys_admin_context',
  MATTER_ADMIN_CONTEXT: 'matter_admin_context',
  TASK_FROM_TEMPLATE_CONTEXT: 'task_from_template_context',
}

export const TASK_COUNT_SMALL_PROJECT_THRESHOLD = 60
export const MINI_MAP_VISIBILITY_THRESHOLD = 20

export const USER_ROLES = {
  ROLE_USER: 'ROLE_USER',
  ROLE_SYS_ADMIN: 'ROLE_SYSADMIN',
  ROLE_MATTER_CREATOR: 'ROLE_MATTER_CREATOR',
  ROLE_MATTER_VIEWER: 'ROLE_MATTER_VIEWER',
  ROLE_MATTER_EDITOR: 'ROLE_MATTER_EDITOR',
  ROLE_MATTER_ADMIN: 'ROLE_MATTER_ADMIN',
  ROLE_ORG_ADMIN: 'ROLE_ORG_ADMIN',
  ROLE_KNOWLEDGE_MANAGER: 'ROLE_KNOWLEDGE_MANAGER',
  ROLE_ORG_OWNER: 'ROLE_ORG_OWNER',
  ROLE_TEMPLATE_PROVIDER: 'ROLE_TEMPLATE_PROVIDER',
}

export const MAX_ORG_OWNER_COUNT = 3

export const PASSWORD_CONTANTS = {
  MAX_PASSWORD_LENGTH: 128,
  MIN_PASSWORD_LENGTH: 15,
}

export const TASK_MENU_CONTEXT = {
  ROADMAP: 'ROADMAP',
  SUBTASK_PANEL: 'SUBTASK_PANEL',
  TASK_HEADER: 'TASK_HEADER',
  TASK_MAP: 'TASK_MAP',
}

export const HTTPS_PROTOCOL = 'https://'

export const MAX_FIELD_LENGTHS = {
  CLIENT_NAME: 60,
  MATTER_NAME: 70,
  DEPARTMENT: 60,
  MATTER_REFERENCE_NUMBER: 20,
  ORGANISATION_NAME: 50,
  POST_NAME: 50,
  PROJECT_NAME: 70,
  MATTER_PARTY_NAME: 30,
  PROJECT_DESCRIPTION: 500,
  TEMPLATE_NAME: 70,
  TASK_NAME: 70,
  TASK_DESCRIPTION: 500,
  URL: 2000,
  NOTICE: 255,
  LABEL: 20,
  RESOURCE_NAME: 30,
  PLACEHOLDER_NAME: 30,
}

export const LINK_RESOURCES = {
  MAX_COUNT: 15,
}

export const LABELS = {
  COUNT_LIMIT: {
    ORGANISATION: 20,
    MATTER_ADMIN: 20,
    MATTER_HASHTAGS: 20,
  },
}

export const MEGA_BYTE = 1000000
export const VALID_IMAGE_TYPES = ['image/jpg', 'image/jpeg', 'image/png']
export const MAX_IMAGE_WIDTH = 250

export const UNASSIGNED = 'UNASSIGNED'

export const OPERATOR = {
  OR: 'OR',
  AND: 'AND',
}

export const DATE_VARIABLES = {
  AED: 'AED',
  PED: 'PSED',
  ASD: 'ASD',
  PSD: 'PSD',
  START: 'start',
  END: 'end',
  PLANNED_START_DATE: 'plannedStartDate',
  PLANNED_END_DATE: 'plannedEndDate',
  ACTUAL_START_DATE: 'actualStartDate',
  ACTUAL_END_DATE: 'actualEndDate',
}

export const WORKSTREAM_TYPE = {
  BLANK: 'BLANK',
  FROM_TEMPLATE: 'FROM_TEMPLATE',
  SPLIT: 'SPLIT',
}

export const STATUS_TYPE = {
  ACTIVE: 'active',
  CLOSED: 'closed',
}

export const USER_STATUS_TYPE = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
}

export const ADMIN = 'admin'
export const EDITOR = 'editor'

export const NOTE_TYPES = {
  BLANK: 'Post',
  MEETING: 'Meeting',
  DOCUMENT: 'Document link',
  WEB: 'Web Link',
  GOOGLE_DOC: 'Google Doc',
  GOOGLE_SLIDES: 'Google Slides',
  GOOGLE_SHEET: 'Google Sheet',
  GOOGLE_FILE: 'Google Drive File',
  MS_WORD: 'Microsoft Word Document',
  MS_EXCEL: 'Microsoft Excel Spreadsheet',
  MS_POWERPOINT: 'Microsoft PowerPoint Presentation',
  MS_VISIO: 'Microsoft Visio Drawing',
  MS_ONEDRIVE: 'Microsoft OneDrive File',
  MS_ONENOTE: 'Microsoft OneNote File',
  MIRO: 'Miro Board',
  FIGMA: 'Figma File',
  ATLASSIAN: 'Atlassian',
}

export const GOOGLE_URLS = {
  DOCUMENT: 'docs.google.com/document',
  SHEET: 'docs.google.com/spreadsheets',
  SLIDES: 'docs.google.com/presentation',
  GENERIC: 'drive.google.com/file',
}

export const MICROSOFT_URL =
  /https:\/\/\S+\.sharepoint\.com\/:[wpxubo]:\/[a-z]\/\S+\/(doc\.aspx\?sourcedoc=\S+&file=\S+|\S+\?e=\S+){1}/i

export const MIRO_URL = {
  EMBED: 'miro.com/app/live-embed/',
  BOARD: 'miro.com/app/board/',
}

export const ATLASSIAN_URL = '.atlassian.net'

export const FIGMA_URL = {
  FILE_REGEX:
    '/https:\\/\\/([\\w\\.-]+\\.)?figma.com\\/(file|proto)\\/([0-9a-zA-Z]{22,128})(?:\\/.*)?$/',
}

export const LABEL_TYPES = {
  RISK: 'risk',
  WORKFLOW: 'workflow',
  USER_DEFINED: 'user_defined',
}

export const LABEL_MODIFIERS = {
  RED: 'red',
  AMBER: 'amber',
  GREEN: 'green',
}

export const USER_TYPES = {
  STANDARD: 'standard',
  LIMITED: 'limited',
}

export const CONFIMRATION_STATUS = {
  TRIALING: 'trialing',
  WHITELISTED: 'whitelisted',
  CONFIRMED: 'confirmed',
  LAPSED: 'lapsed',
}
export const DATE_STRINGS = {
  TODAY: 'Today',
}

export const DATE_SHIFT = {
  FORWARD: 'forward',
  BACKWARD: 'backward',
}

export const ROADMAP_CONST = {
  START: 'start',
  END: 'end',
  FILL: 'fill',
  STROKE: 'stroke',
}
export const CATEGORY_COLOURS = [
  { primary: '#832DA4', secondary: '#CDABDB', text: '#1D1917' },
  { primary: '#4599DF', secondary: '#B5D6F2', text: '#1D1917' },
  { primary: '#E25D33', secondary: '#F3BEAD', text: '#1D1917' },
  { primary: '#C63361', secondary: '#E8ADC0', text: '#1D1917' },
  { primary: '#88B253', secondary: '#CFE0BA', text: '#1D1917' },
  { primary: '#9FDBCD', secondary: '#D9F1EB', text: '#1D1917' },
  { primary: '#E39735', secondary: '#F4D5AE', text: '#1D1917' },
  { primary: '#EDC14B', secondary: '#F8E6B7', text: '#1D1917' },
  { primary: '#D88177', secondary: '#EFCDC9', text: '#1D1917' },
  { primary: '#74574A', secondary: '#C7BCB7', text: '#1D1917' },
  { primary: '#AAAAAA', secondary: '#AAAAAA', text: '#AAAAAA' },
]

export const CATEGORY_COLOURS_GREYSCALE = [
  { primary: '#535353', secondary: '#535353', text: '#1D1917' },
  { primary: '#878787', secondary: '#878787', text: '#1D1917' },
  { primary: '#808080', secondary: '#808080', text: '#1D1917' },
  { primary: '#646464', secondary: '#646464', text: '#1D1917' },
  { primary: '#9A9A9A', secondary: '#9A9A9A', text: '#1D1917' },
  { primary: '#C7C7C7', secondary: '#C7C7C7', text: '#1D1917' },
  { primary: '#A3A3A3', secondary: '#A3A3A3', text: '#1D1917' },
  { primary: '#C1C1C1', secondary: '#C1C1C1', text: '#1D1917' },
  { primary: '#D6D6D6', secondary: '#D6D6D6', text: '#1D1917' },
  { primary: '#5E5E5E', secondary: '#5E5E5E', text: '#1D1917' },
  { primary: '#AAAAAA', secondary: '#AAAAAA', text: '#AAAAAA' },
]

export const RATE_TABLE_TYPES = {
  ORGANISATION: 'organisation',
  CLIENT: 'client',
  ADVISOR_AGREED: 'advisor agreed',
}
export const RATE_TABLE_BUILD_FORM = {
  ANY: 'any',
  SPECIFIC: 'specific',
}

export const CURRENCIES = [
  { name: 'AUD - Australian Dollar' },
  { name: 'CAD - Canadian Dollar' },
  { name: 'CHF - Swiss Franc' },
  { name: 'CNY - Yuan Renminbi' },
  { name: 'EUR - Euro' },
  { name: 'GBP - Pound Sterling' },
  { name: 'HKD - Hong Kong Dollar' },
  { name: 'INR - Indian Rupee' },
  { name: 'JPY - Yen' },
  { name: 'SGD - Singapore Dollar' },
  { name: 'USD - US Dollar' },
]

export const GOOGLE_API = {
  DEVELOPER_KEY: '',
  CLIENT_ID: '',
  SCOPE: ['https://www.googleapis.com/auth/drive.file'],
  APP_ID: '',
}

export const gradeDialogConsts = {
  matter: 'matter',
  workstream: 'workstream',
  phase: 'task',
}

export const POSITIONS = {
  CLIENT: { name: 'Client', value: 0, id: 17 },
  ADVISOR: { name: 'Advisor', value: 1, id: 18 },
}

export const FIXED_FEE_SETUP_STEP_KEYS = [
  'periodCurrency',
  'feeType',
  'reviewScope',
  'finalReview',
]
