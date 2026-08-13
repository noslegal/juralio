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

import buildReport from '../../template-task-list/template-task-list-report-service'

// buildReport(t, reportData, callback, options) — callback has no default and
// is called unconditionally. Children only appear if they have a tasks array.
const reportData = {
  template: {
    name: 'Standard Litigation Template',
    referenceNumber: 'JUR900',
    tasks: [
      {
        level: 1,
        referenceNumber: 'JUR001',
        name: 'Phase A',
        tasks: [
          {
            level: 2,
            referenceNumber: 'JUR002',
            name: 'Sub-task A1',
            tasks: [],
          },
          {
            level: 2,
            referenceNumber: 'JUR003',
            name: 'Sub-task A2',
            tasks: [
              {
                level: 3,
                referenceNumber: 'JUR004',
                name: 'Deep task with a rather long descriptive name',
                tasks: [],
              },
            ],
          },
        ],
      },
      {
        level: 1,
        referenceNumber: 'JUR005',
        name: 'Phase B',
        tasks: [],
      },
    ],
  },
}

const noop = () => {}

export default [
  {
    id: 'template-task-list',
    run: t =>
      buildReport(t, reportData, noop, {
        selectedLevel: 6,
        printType: 'A4',
        includeLabels: true,
      }),
  },
  {
    id: 'template-task-list-level2-a3',
    run: t =>
      buildReport(t, reportData, noop, {
        selectedLevel: 2,
        printType: 'A3',
        includeLabels: false,
      }),
  },
]
