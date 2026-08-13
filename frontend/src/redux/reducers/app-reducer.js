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

import { combineReducers } from 'redux'
import noticeboardReducer from '../../admin/noticeboard/noticeboard-reducer'
import organisationReducer from '../../admin/organisations/organisation-reducer'
import experimentalReducer from '../../app/experimental/experimental-reducer'
import globalConfirmationDialogReducer from '../../app/global-confirmation-dialog/global-confirmation-dialog-reducer'
import globalHeaderReducer from '../../app/global-header/global-header-reducer'
import globalSnackbarReducer from '../../app/global-snackbar/global-snackbar-reducer'
import inboxReducer from '../../app/home/inbox/state/inbox-reducer'
import overviewReducer from '../../app/home/overview/overview-reducer'
import recentTasksReducer from '../../app/home/side-panel/recent-tasks-reducer'
import lastLocationRecorderReducer from '../../app/last-location-recorder/last-location-recorder-reducer'
import login from '../../app/login/login-forms-reducer'
import matterCreateReducer from '../../app/matter-create/matter-create-reducer'
import taskPostArchiveReducer from '../../app/matter-details/archive/posts/task-post-archive-reducer'
import taskArchiveReducer from '../../app/matter-details/archive/tasks/task-archive-reducer'
import matterAdminLabelReducer from '../../app/matter-details/labels/redux/matter-admin-labels-reducer'
import matterDetailsReducer from '../../app/matter-details/matter-details-reducer'
import projects from '../../app/matter-details/projects/projects-reducer'
import matterListReducer from '../../app/matter-list/matter-list-reducer'
import labelReducer from '../../app/organisation/users/panels/redux/labels-reducer'
import projectReducer from '../../app/project/project-reducer'
import selectedTaskPostList from '../../app/task-details/task-card-content/task-notes/task-posts-reducer'
import templateTaskPostList from '../../app/task-details/task-card-content/task-notes/template-task-post-reducer'
import dateChangeReducer from '../../app/task-map/date-change/date-change-reducer'
import selectedTaskMenuReducer from '../../app/task-map/selected-task/selected-task-menu-reducer'
import selectedTaskReducer from '../../app/task-map/selected-task/selected-task-reducer'
import statusChangeReducer from '../../app/task-map/status-change/status-change-reducer'
import taskFilterReducer from '../../app/task-map/task-filter/task-filter-reducer'
import taskMapReducer from '../../app/task-map/task-map-reducer'
import templateListReducer from '../../app/template-list/template-list-reducer'
import selectedTemplateTaskReducer from '../../app/template-task-details/template-task-reducer'
import templateToProjectReducer from '../../app/template/project-creation/template-to-project-reducer'
import templateReducer from '../../app/template/template-reducer'
import usersReducer from '../../app/users/users-reducer'
import dialogTriggerReducer from '../../components/navigation/common/dialog-triggers/dialog-trigger-reducer'
import mattersFilterReducer from '../../components/navigation/global-header/project-selector/matters-filter-reducer'
import globalNotificationsReducer from '../../components/navigation/global-notifications/redux/global-notifications-reducer'
import mobileGlobalHeaderReducer from '../../components/navigation/mobile-global-header/mobile-global-header-reducer'
import tourReducer from '../../services/tour/tour-reducer'
import auth from '../../services/user/auth/auth-reducer'
import improvedTaskmapReducer from '../ducks/improved-taskmap'
import improvedTaskmapInteractionsReducer from '../ducks/improved-taskmap-interactions'
import matterHistoryReducer from '../ducks/matter-history'
import matterResources from '../ducks/matter-resources'
import matterTeam from '../ducks/matter-team'
import privateWorkstreamReducer from '../ducks/private-workstream-team'
import workstreamResources from '../ducks/workstream-resources'
import globalProjects from './global-projects-reducer'
import instanceSettingsReducer from './instance-management-reducer'
import matterCostsReducer from '../ducks/matter-costs'

export default combineReducers({
  auth,
  confirmationDialog: globalConfirmationDialogReducer,
  dateChange: dateChangeReducer,
  experimental: experimentalReducer,
  globalNotifications: globalNotificationsReducer,
  globalProjects: globalProjects,
  header: globalHeaderReducer,
  inbox: inboxReducer,
  instanceSettings: instanceSettingsReducer,
  labels: labelReducer,
  lastLocationRecorder: lastLocationRecorderReducer,
  login,
  matterAdminLabels: matterAdminLabelReducer,
  matterCreate: matterCreateReducer,
  matterDetails: matterDetailsReducer,
  matterHistory: matterHistoryReducer,
  matterResources: matterResources,
  matterTeam: matterTeam,
  matters: matterListReducer,
  mattersFilter: mattersFilterReducer,
  mobileGlobalHeader: mobileGlobalHeaderReducer,
  noticeboard: noticeboardReducer,
  organisation: organisationReducer,
  overview: overviewReducer,
  privateWorkstreamTeam: privateWorkstreamReducer,
  postArchive: taskPostArchiveReducer,
  project: projectReducer,
  projects,
  recentTasks: recentTasksReducer,
  selectedTask: selectedTaskReducer,
  selectedTaskPostList,
  selectedTemplateTask: selectedTemplateTaskReducer,
  snackbar: globalSnackbarReducer,
  statusChange: statusChangeReducer,
  taskArchive: taskArchiveReducer,
  taskMapFilter: taskFilterReducer,
  taskOperation: selectedTaskMenuReducer,
  taskmap: taskMapReducer,
  template: templateReducer,
  templateTaskPostList,
  templateToProject: templateToProjectReducer,
  templates: templateListReducer,
  tour: tourReducer,
  users: usersReducer,
  workstreamResources: workstreamResources,
  dialogTriggers: dialogTriggerReducer,
  improvedTaskmap: improvedTaskmapReducer,
  improvedTaskmapInteractions: improvedTaskmapInteractionsReducer,
  matterCosts: matterCostsReducer,
})
