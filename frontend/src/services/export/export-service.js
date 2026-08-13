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

import { downloadXlsx } from '../helpers/fetch/fetch-helper'
import { EXPORT_NAMES } from './reports/common/constants-reports'

export const generateDownload = (
  t,
  exportName,
  format,
  reportData,
  options = {},
  callback = () => {}
) => {
  switch (exportName) {
    case EXPORT_NAMES.MATTER: {
      return downloadXlsx('export/matter/' + options.matterId)
    }
    case EXPORT_NAMES.WORKSTREAM_TASK_LIST: {
      return import('./reports/workstream-task-list/workstream-task-list-report-service').then(
        m => m.default(t, reportData, callback, options)
      )
    }
    case EXPORT_NAMES.TEMPLATE_TASK_LIST: {
      return import('./reports/template-task-list/template-task-list-report-service').then(
        m => m.default(t, reportData, callback, options)
      )
    }
    case EXPORT_NAMES.TASK_DETAILS: {
      return import('./reports/workstream-task-details/workstream-task-details-report-service').then(
        m => m.default(t, reportData, options)
      )
    }
    case EXPORT_NAMES.POST:
    case EXPORT_NAMES.MEETING_NOTE: {
      return import('./reports/post/post-report-service').then(m =>
        m.default(t, reportData, options)
      )
    }
    case EXPORT_NAMES.ACTIVE_USERS: {
      return import('./reports/active-users/active-user-report-service').then(
        m => m.default(t, reportData)
      )
    }
    case EXPORT_NAMES.DELETED_ORGS: {
      return import('./reports/deleted-orgs/deleted-orgs-report-service').then(
        m => m.default(t, reportData)
      )
    }
    case EXPORT_NAMES.ADVISOR_COSTS: {
      return import('./reports/Costs/cost-report-service').then(m =>
        m.default(t, reportData, options)
      )
    }
    case EXPORT_NAMES.CLIENT_COSTS: {
      return import('./reports/ClientCosts/client-cost-report-service').then(
        m => m.default(t, reportData, options)
      )
    }
    default:
      throw new Error('Unknown export type')
  }
}
