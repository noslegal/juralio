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

import buildReport from '../../ClientCosts/client-cost-report-service'

const baseReportData = {
  matter: {
    name: 'Project Titan',
    clientName: 'Acme Corp',
    userDefinedReferenceNumber: 'ACME-2024-01',
    numProjects: 2,
  },
  currency: 'GBP',
  advisor: 'Beacon Legal LLP',
  period: { startDate: '2025-01-01T00:00:00', endDate: '2025-06-30T00:00:00' },
  workstreamNames: { 1: 'Litigation', 2: 'Advisory' },
  // Time-based fee capped at value (300,000); cap is a boolean flag. Actual
  // revenue (250,000) shows as the fee amount, the cap limit as the Cap row.
  pricingDTOList: [{ type: 0, value: 300000, cap: true }],
  revenueValuesDTO: { totalRevenue: 250000 },
  costTimeEstimateList: [
    {
      task: {
        id: 501,
        projectId: 1,
        name: 'Disclosure',
        status: 'in-progress',
        startDate: '2025-01-01T00:00:00',
        endDate: '2025-03-31T00:00:00',
        deliverables: [
          { name: 'Disclosure report' },
          { name: 'Privilege log' },
        ],
      },
    },
    {
      task: {
        id: 502,
        projectId: 2,
        name: 'Advice note',
        status: 'done',
        startDate: '2025-02-01T00:00:00',
        endDate: '2025-04-30T00:00:00',
        deliverables: [],
      },
    },
    {
      task: {
        id: 503,
        projectId: 1,
        name: 'Witness statements',
        status: 'not-started',
        startDate: '2025-03-01T00:00:00',
        endDate: '2025-05-31T00:00:00',
        deliverables: [{ name: 'Statement bundle' }],
      },
    },
  ],
  assumptionList: [
    {
      id: 91,
      task: { id: 501 },
      summary: 'Docs provided on time',
      assumption: 'Client supplies all documents by week 2.',
      status: 'met',
    },
    {
      id: 92,
      taskId: 502,
      summary: 'Single jurisdiction',
      assumption: 'Advice limited to English law.',
      status: 'at-risk',
    },
  ],
  outOfScopeDetails: { writtenApprovalNeeded: true, reason: 'rates' },
  matterRatesList: [
    { gradeId: 3, gradeName: 'Partner', rateValue: 500 },
    { gradeId: 4, gradeName: 'Associate', rateValue: 250 },
    { gradeId: 3, gradeName: 'Partner', rateValue: 999 },
  ],
}

const allSheets = {
  summary: true,
  scope: true,
  assumptions: true,
  outOfScope: true,
}

export default [
  {
    id: 'client-costs',
    run: t => buildReport(t, baseReportData, allSheets),
  },
  {
    id: 'client-costs-single-ws-no-fee',
    run: t =>
      buildReport(
        t,
        {
          ...baseReportData,
          matter: { ...baseReportData.matter, numProjects: 1 },
          pricingDTOList: [{ type: 2, value: 0, cap: null }],
          revenueValuesDTO: null,
          outOfScopeDetails: null,
          matterRatesList: [],
        },
        allSheets
      ),
  },
]
