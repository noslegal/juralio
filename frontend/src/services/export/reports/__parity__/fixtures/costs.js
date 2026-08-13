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

import buildReport from '../../Costs/cost-report-service'

// buildReport(t, reportData, options) — no callback, does not return the
// import promise; the harness polls saveAs instead.
const baseReportData = {
  matter: {
    clientName: 'Acme Corp',
    id: 42,
    userDefinedReferenceNumber: 'ACME-2024-01',
  },
  matter_name: 'Project Titan',
  snapshot: true,
  period: { startDate: '2025-01-01T00:00:00', endDate: '2025-03-31T00:00:00' },
  rtd: {
    rateTableDetails: { currency: 'GBP' },
    periods: [{ periodId: 1, startDate: null, endDate: null }],
  },
  costTimeEstimateList: [
    {
      id: 11,
      hourValue: 100,
      hourDistribution: null,
      task: {
        id: 501,
        name: 'Phase One',
        projectId: 1,
        startDate: '2025-01-01T00:00:00',
        endDate: '2025-03-31T00:00:00',
      },
    },
    {
      id: 12,
      hourValue: 40,
      hourDistribution: null,
      task: {
        id: 502,
        name: 'Phase Two',
        projectId: 1,
        startDate: '2025-02-01T00:00:00',
        endDate: '2025-05-31T00:00:00',
      },
    },
  ],
  costRatioList: [
    {
      id: 21,
      cteId: 11,
      projectId: 1,
      ratioValue: 100,
      recoveryRate: 90,
      grade: { id: 3 },
      gradeId: 3,
      gradeName: 'Partner',
      colour_idx: 0,
    },
    {
      id: 22,
      cteId: 0,
      projectId: 0,
      ratioValue: 0,
      recoveryRate: 100,
      gradeId: 4,
      gradeName: 'Associate',
      colour_idx: 1,
    },
  ],
  matterRatesList: [
    {
      gradeId: 3,
      gradeName: 'Partner',
      colour_idx: 0,
      rateId: 301,
      periodId: 1,
      rateValue: 500,
      rate: null,
      breakEvenRates: [{ rate: 300, startDate: null, endDate: null }],
    },
    {
      gradeId: 4,
      gradeName: 'Associate',
      colour_idx: 1,
      rateId: 302,
      periodId: 1,
      rateValue: 250,
      rate: null,
      breakEvenRates: [{ rate: 150, startDate: null, endDate: null }],
    },
  ],
  pricingDTOList: [{ id: 1, type: 0, value: 100000, cap: false }],
}

const allSheets = {
  hours: true,
  fees: true,
  costs: true,
  grossProfit: true,
  margin: true,
  rates: true,
  recoveryRate: false,
}

export default [
  {
    id: 'costs',
    run: t => buildReport(t, baseReportData, allSheets),
  },
  {
    id: 'costs-live-fixed-fee',
    run: t =>
      buildReport(
        t,
        {
          ...baseReportData,
          snapshot: null,
          pricingDTOList: [{ id: 1, type: 1, value: 250000, cap: 300000 }],
        },
        allSheets
      ),
  },
]
