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

import buildReport from '../../deleted-orgs/deleted-orgs-report-service'

// Rows as produced by generateDeletedOrgData: [name, deletedBy, permanentlyDeleted]
const deletedOrgRows = [
  ['Acme Corporation', 'admin@acme.example', '12 Mar 2025'],
  ['Blackstone & Partners LLP', 'owner@blackstone.example', '2 Jan 2025'],
  ['Tiny Co', 'sysadmin@juralio.com', '28 Feb 2025'],
]

export default [
  {
    id: 'deleted-orgs',
    run: t => buildReport(t, deletedOrgRows),
  },
]
