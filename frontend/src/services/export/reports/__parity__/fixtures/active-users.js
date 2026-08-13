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

import buildReport from '../../active-users/active-user-report-service'

// Shape from active-users-helper downloadClickHandler: { period, records }.
// Period is a past month so the "up to today" branch in getDateForDownload
// stays off and the output is deterministic.
const reportData = {
  period: '2025-03-01',
  records: [
    {
      username: 'zara.whitfield@example.com',
      activeFullMonth: true,
      firstActivation: null,
      lastDeactivation: null,
      lastActivatingUser: null,
    },
    {
      username: 'adam.brookes@example.com',
      activeFullMonth: true,
      firstActivation: null,
      lastDeactivation: null,
      lastActivatingUser: null,
    },
    {
      username: 'maya.lindqvist@example.com',
      activeFullMonth: false,
      firstActivation: '2025-03-05T10:15:00Z',
      lastDeactivation: '2025-03-20T16:45:00Z',
      lastActivatingUser: { username: 'admin@example.com' },
    },
    {
      username: 'carlos.duarte@example.com',
      activeFullMonth: false,
      firstActivation: '2025-03-12T09:00:00Z',
      lastDeactivation: null,
      lastActivatingUser: null,
    },
  ],
}

const emptyReportData = {
  period: '2025-02-01',
  records: [],
}

export default [
  {
    id: 'active-users',
    run: t => buildReport(t, reportData),
  },
  {
    id: 'active-users-empty',
    run: t => buildReport(t, emptyReportData),
  },
]
