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

import buildReport from '../../workstream-task-list/workstream-task-list-report-service'

// A real 1x1 PNG so the customer-logo path embeds a valid image, matching the
// production data-URI shape produced by blobToBase64.
const onePixelPng =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

// Every task that must appear in the tree needs a tasks array (leaves: []).
const project = {
  name: 'Litigation Workstream',
  referenceNumber: 'P1',
  isPrivate: false,
  // Mirrors the API: per-status counts only, no top-level total. The "N tasks
  // in total" line derives 2+1+2=5 and excludes notRequiredCount.
  taskCounts: {
    notRequiredCount: 3,
    notStartedCount: 2,
    inProgressCount: 1,
    doneCount: 2,
  },
  people: [
    { id: 101, taskCount: 3 },
    { id: 102, taskCount: 0 },
  ],
  privateWorkstreamTeam: [{ id: 101 }],
  tasks: [
    {
      level: 1,
      referenceNumber: 'JUR001',
      name: 'Phase One',
      isMilestone: false,
      isDeliverable: false,
      status: 'in-progress',
      plannedStartDate: '2025-01-06T00:00:00',
      actualStartDate: '2025-01-08T00:00:00',
      plannedEndDate: '2025-03-31T00:00:00',
      actualEndDate: null,
      labels: [
        { type: 'risk', name: 'High risk', modifier: 'red' },
        { type: 'workflow', name: 'Awaiting client', modifier: null },
        { type: 'user_defined', name: 'urgent', modifier: null },
      ],
      teamMembers: [
        {
          firstname: 'Ada',
          lastname: 'Lovelace',
          isExternal: false,
          username: 'ada',
          email: 'ada@example.com',
        },
        {
          firstname: 'Ext',
          lastname: 'Counsel',
          isExternal: true,
          username: 'ext',
          email: 'ext@example.com',
        },
      ],
      tasks: [
        {
          level: 2,
          referenceNumber: 'JUR002',
          name: 'Normal task',
          status: 'done',
          isMilestone: false,
          isDeliverable: false,
          plannedStartDate: '2025-01-10T00:00:00',
          actualStartDate: '2025-01-11T00:00:00',
          plannedEndDate: '2025-02-01T00:00:00',
          actualEndDate: '2025-02-05T00:00:00',
          labels: [{ type: 'risk', name: 'Watch', modifier: 'amber' }],
          teamMembers: [],
          tasks: [],
        },
        {
          level: 2,
          referenceNumber: 'JUR003',
          name: 'Milestone task',
          status: 'not-started',
          isMilestone: true,
          isDeliverable: false,
          plannedStartDate: '2025-02-15T00:00:00',
          actualStartDate: null,
          plannedEndDate: null,
          actualEndDate: null,
          labels: [{ type: 'risk', name: 'On track', modifier: 'green' }],
          teamMembers: [],
          tasks: [],
        },
        {
          level: 2,
          referenceNumber: 'JUR004',
          name: 'Deliverable task',
          status: 'done',
          isMilestone: false,
          isDeliverable: true,
          plannedStartDate: null,
          actualStartDate: null,
          plannedEndDate: '2025-03-01T00:00:00',
          actualEndDate: '2025-03-02T00:00:00',
          labels: [],
          teamMembers: [],
          tasks: [
            {
              level: 3,
              referenceNumber: 'JUR006',
              name: 'Nested review step',
              status: 'not-started',
              isMilestone: false,
              isDeliverable: false,
              plannedStartDate: '2025-02-20T00:00:00',
              actualStartDate: null,
              plannedEndDate: '2025-02-28T00:00:00',
              actualEndDate: null,
              labels: [],
              teamMembers: [],
              tasks: [],
            },
          ],
        },
        {
          level: 2,
          referenceNumber: 'JUR005',
          name: 'No-dates task',
          status: 'not-started',
          isMilestone: false,
          isDeliverable: false,
          plannedStartDate: null,
          actualStartDate: null,
          plannedEndDate: null,
          actualEndDate: null,
          labels: [],
          teamMembers: [],
          tasks: [],
        },
      ],
    },
  ],
}

const baseReportData = {
  username: 'Ada Lovelace',
  logo: { blob: onePixelPng, width: 124, height: 36 },
  matter: {
    id: 42,
    clientName: 'Acme Corp',
    name: 'Project Titan',
    userDefinedReferenceNumber: 'ACME-2024-01',
    numProjects: 2,
    organisation: { id: 7 },
  },
  project,
  team: [
    {
      user: {
        id: 101,
        firstname: 'Ada',
        lastname: 'Lovelace',
        isExternal: false,
        isPlaceholder: false,
        username: 'ada',
        email: 'ada@example.com',
        roles: [],
      },
      matterAdminId: 1,
      teamMemberId: 1,
    },
    {
      user: {
        id: 102,
        firstname: '',
        lastname: '',
        isExternal: true,
        isPlaceholder: true,
        username: 'placeholder@example.com',
        email: 'placeholder@example.com',
        roles: [],
      },
      matterAdminId: 0,
      teamMemberId: 0,
    },
  ],
}

const noop = () => {}

export default [
  {
    id: 'workstream-full',
    run: t =>
      buildReport(t, baseReportData, noop, {
        teams: true,
        taskList: true,
        roadmap: true,
        level: 6,
        includeLabels: true,
        printType: 'A4',
      }),
  },
  {
    id: 'workstream-private-fallback-logo-a3',
    run: t =>
      buildReport(
        t,
        {
          ...baseReportData,
          logo: null,
          matter: { ...baseReportData.matter, numProjects: 1 },
          project: { ...project, isPrivate: true },
        },
        noop,
        {
          teams: true,
          taskList: true,
          roadmap: true,
          level: 2,
          includeLabels: false,
          printType: 'A3',
        }
      ),
  },
]
