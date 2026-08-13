/* eslint-disable import/prefer-default-export */
//import dayjs from 'dayjs'
//import costsService from '../../../frontend/src/services/costs/costs-service'
import { enableCosts, enableOrgCosts } from '../admin/admin_api_helpers'
import { createMatter } from '../matterprojects/matter_api_helper'
import { createProject } from '../matterprojects/projects_api_helper'
import { createSubTask, createTask } from '../matterprojects/task_api_helper'
import {
  createOrganisation,
  createOrganisationGroup,
  sysadminAddUserToOrganisation,
} from '../organisation/organisation_api_helper'
import { createOrganisationUser, createUser } from '../users/user_api_helper'

// Generates org-level cost defaults for a given matter position. The
// grade/rate_type/otherCosts generateDefaults endpoints are position-scoped
// (groups-positions work), so a position must be passed. `positionName` selects
// which position the org costs are seeded for — this is what the matter-position
// gate (CostsAuthorisationService.orgCostsSetupForMatterPosition) checks:
//   Advisor → an org-level Advisor rate table must exist
//   Client  → org-level Client OtherCosts must exist
// For Advisor we therefore also seed an org rate table + rates; for other
// positions the three generateDefaults calls are sufficient.
// `options` is the 3rd arg (older callers passed unused positional args here —
// an undefined value falls back to the Advisor default, preserving behaviour).
export const setupOrgLevelCosts = (orgAdminUser, org, options = {}) => {
  const {
    positionName = 'Advisor',
    createOrgRateTable = positionName === 'Advisor',
  } = options || {}
  cy.apiSpecRequest({
    url: `${Cypress.env('serverBaseUrl')}/login`,
    method: 'POST',
    body: {
      username: orgAdminUser.username,
      password: Cypress.env('defaultPassword'),
    },
  }).then(response => {
    expect(response.status).to.eq(200)
    expect(response.body.roles).to.contain('ROLE_ORG_ADMIN')
    cy.login(orgAdminUser)
    cy.request({
      url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
      method: 'GET',
    })
      .its('body')
      .then(positions => {
        const position = positions.find(p => p.name === positionName)
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/grade/${
            org.id
          }/generateDefaults`,
          method: 'POST',
          body: { position: position?.id },
        })
          .its('body')
          .then(grades => {
            cy.request({
              url: `${Cypress.env('serverBaseUrl')}/rate_type/${
                org.id
              }/generateDefaults`,
              method: 'POST',
              body: { position: position?.id },
            })
              .its('body')
              .then(rateTypes => {
                cy.request({
                  url: `${Cypress.env('serverBaseUrl')}/otherCosts/${
                    org.id
                  }/generateDefaults`,
                  method: 'POST',
                  body: { position: position?.id },
                }).then(() => {
                  // The Advisor position is gated on an org rate table; other
                  // positions only need their generateDefaults seeded — but an
                  // org rate table can still be created (e.g. so the client
                  // setup form's "use existing rate card" option has one).
                  if (!createOrgRateTable) return
                  cy.request({
                    url: `${Cypress.env('serverBaseUrl')}/rate_table_detail`,
                    method: 'POST',
                    body: {
                      currency: 'GBP',
                      work_type: 'Example',
                      location: 'E2E',
                      client: false,
                      draft: false,
                      position: position?.id,
                    },
                  })
                    .its('body')
                    .then(rtd => {
                      cy.request({
                        url: `${Cypress.env('serverBaseUrl')}/periods`,
                        method: 'POST',
                        body: {
                          name: 'initial period',
                          startDate: new Date(2020, 1, 1),
                          endDate: null,
                          rateTableDetailId: rtd.id,
                        },
                      })
                        .its('body')
                        .then(newPeriod => {
                          const periodId = newPeriod.periodId
                            ? newPeriod.periodId
                            : newPeriod.id
                          const payload = []
                          grades.forEach(grade => {
                            payload.push({
                              gradeId: grade.id,
                              rateTypeId: rateTypes[0].id,
                              periodId,
                              rate: 100,
                              rate_table_detailsId: rtd.id,
                            })
                            payload.push({
                              gradeId: grade.id,
                              rateTypeId: rateTypes[1].id,
                              periodId,
                              rate: 100,
                              rate_table_detailsId: rtd.id,
                            })
                          })
                          cy.request({
                            url: `${Cypress.env('serverBaseUrl')}/rates/bulk`,
                            method: 'POST',
                            body: payload,
                          })
                        })
                    })
                })
              })
          })
      })
  })
}

export const setupMatterRates = (adminUser, orgId, matterId) => {
  return cy.login(adminUser).then(() => {
    cy.request({
      url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
      method: 'GET',
    })
      .its('body')
      .then(positions => {
        const advisorPosition = positions.find(p => p.name === 'Advisor')
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/rate_table_details/filter`,
          method: 'POST',
          body: { removeDraft: true, position: advisorPosition?.id },
        })
          .its('body')
          .then(rtds => {
            let rtd = rtds[0]
            cy.request({
              url: `${Cypress.env('serverBaseUrl')}/rate_type`,
              method: 'POST',
              body: { position: advisorPosition?.id },
            })
              .its('body')
              .then(rt => {
                let rateTypes = rt
                cy.request({
                  url: `${Cypress.env('serverBaseUrl')}/grades`,
                  method: 'POST',
                  body: { position: advisorPosition?.id },
                })
                  .its('body')
                  .then(gradeList => {
                    let grades = gradeList
                    cy.request({
                      url: `${Cypress.env('serverBaseUrl')}/rate_table_detail`,
                      method: 'POST',
                      body: {
                        currency: 'GBP',
                        work_type: 'Example',
                        location: 'E2E - Matter',
                        rateTableDetails: rtd.rateTableDetails.id,
                        client: false,
                        draft: false,
                        matter: matterId,
                        position: advisorPosition?.id,
                      },
                    })
                      .its('body')
                      .then(newrtd => {
                        let newRtd = newrtd
                        cy.request({
                          url: `${Cypress.env('serverBaseUrl')}/periods`,
                          method: 'POST',
                          body: {
                            name: 'initial period',
                            startDate: new Date(2020, 1, 1),
                            endDate: null,
                            rateTableDetailId: newRtd.id,
                          },
                        })
                          .its('body')
                          .then(newPeriod => {
                            period = newPeriod
                            let payload = []
                            grades.forEach(grade => {
                              payload.push({
                                gradeId: grade.id,
                                rateTypeId: rateTypes[0].id,
                                periodId: period.periodId
                                  ? period.periodId
                                  : period.id,
                                rate: 100,
                                rate_table_detailsId: newRtd.id,
                                matterId: matterId,
                              })
                            })
                            cy.request({
                              url: `${Cypress.env('serverBaseUrl')}/rates/bulk`,
                              method: 'POST',
                              body: payload,
                            })
                          })
                      })
                  })
              })
          })
      })
  })
}

export const createProjectionPeriod = (
  username,
  matter_id,
  { startDate = new Date(2020, 1, 1), endDate = new Date(2020, 11, 1) } = {}
) => {
  return cy.login(username).then(() => {
    cy.request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/costs/projectionPeriod/${matter_id}`,
      method: 'POST',
      body: {
        startDate,
        endDate,
        matterId: matter_id,
      },
    })
      .its('body')
      .then(period => {
        return period
      })
  })
}

export const createCostRatioPayload = (gradeList, period) => {
  let payload = []
  let gradeCategoryLists = new Map()
  console.log(gradeList)
  gradeList.forEach(grade => {
    let value = gradeCategoryLists.get(grade.group.id)
    if (value === undefined) {
      gradeCategoryLists.set(grade.group.id, {
        id: grade.group.id,
        name: grade.group.name,
        value: 0,
        colour: grade.colour_idx,
      })
    } else {
      gradeCategoryLists.set(grade.group.id, {
        id: grade.group.id,
        name: grade.group.name,
        value: 0,
        colour: grade.colour_idx,
      })
    }
  })
  if (gradeCategoryLists !== undefined || gradeCategoryLists.size !== 0) {
    const remainder = 100 % gradeCategoryLists.size
    if (remainder !== 0) {
      const valueNoRemainder = Math.floor(100 / gradeCategoryLists.size)
      const remainderValue = Math.ceil(remainder / gradeCategoryLists.size)
      gradeCategoryLists.forEach((category, index) => {
        let catValue = 0
        if (index >= gradeCategoryLists.size - remainder && remainder > 0) {
          catValue = valueNoRemainder + remainderValue
        } else {
          catValue = valueNoRemainder
        }
        let gradeCount = gradeList.filter(g => g.group.id === category.id)
          .length
        const gradeRemainder = catValue % gradeCount
        payload.push({
          categoryId: category.id,
          category: category,
          grades: gradeList
            .filter(g => g.group.id === category.id)
            .map((grade, index) => {
              let ratioValue = 0
              if (gradeRemainder !== 0) {
                const gradeValueNoRemainder = Math.floor(catValue / gradeCount)
                const gradeRemainderValue = Math.ceil(
                  gradeRemainder / gradeCount
                )

                if (
                  index >= gradeCount - gradeRemainder &&
                  gradeRemainder > 0
                ) {
                  ratioValue = gradeValueNoRemainder + gradeRemainderValue
                } else {
                  ratioValue = gradeValueNoRemainder
                }
              } else {
                ratioValue = catValue / gradeCount
              }
              return {
                grade: grade,
                gradeName: grade.name,
                gradeId: grade.id,
                ratioValue: ratioValue,
                recoveryRate: 100,
              }
            }),
          totalRatio: catValue,
          totalRecovery: 100,
        })
      })
    } else {
      gradeCategoryLists.forEach(category => {
        let catValue = 100 / gradeCategoryLists.size
        let gradeCount = gradeList.filter(g => g.group.id === category.id)
          .length
        const gradeRemainder = catValue % gradeCount
        payload.push({
          categoryId: category.id,
          category: category,
          grades: gradeList
            .filter(g => g.group.id === category.id)
            .map((grade, index) => {
              let ratioValue = 0
              if (gradeRemainder !== 0) {
                const gradeValueNoRemainder = Math.floor(catValue / gradeCount)
                const gradeRemainderValue = Math.ceil(
                  gradeRemainder / gradeCount
                )

                if (
                  index >= gradeCount - gradeRemainder &&
                  gradeRemainder > 0
                ) {
                  ratioValue = gradeValueNoRemainder + gradeRemainderValue
                } else {
                  ratioValue = gradeValueNoRemainder
                }
              } else {
                ratioValue = catValue / gradeCount
              }
              return {
                grade: grade,
                gradeName: grade.name,
                gradeId: grade.id,
                ratioValue: ratioValue,
                recoveryRate: 100,
                projectionPeriod: period.id,
              }
            }),
          totalRatio: 100 / gradeCategoryLists.size,
          totalRecovery: 100,
        })
      })
    }
  }
  let formattedPayload = []
  payload.forEach(category => {
    category.grades.forEach(grade => {
      formattedPayload.push(grade)
    })
  })
  return formattedPayload
}

export const createGradeRatios = (matter, period, grades) => {
  cy.request({
    url: `${Cypress.env('serverBaseUrl')}/costs/costRatio/${matter.id}`,
    method: 'POST',
    body: createCostRatioPayload(grades, period),
    failOnStatusCode: false,
  })
    .its('body')
    .then(gradeRatioList => {
      return gradeRatioList
    })
}

export const createCostTimeEstimates = (matter, period, task) => {
  cy.request({
    url: `${Cypress.env('serverBaseUrl')}/costs/costTimeEstimate/${matter.id}`,
    method: 'POST',
    body: [
      {
        hour_value: 100,
        taskId: task.id,
        projectionPeriod: period.id,
      },
    ],
    failOnStatusCode: false,
  })
    .its('body')
    .then(cte => {
      return cte
    })
}

export const createPricingPlans = (matter, period, task) => {
  cy.request({
    url: `${Cypress.env('serverBaseUrl')}/costs/pricing/${matter.id}`,
    method: 'POST',
    body: [
      {
        type: 0,
        value: null,
        reason: null,
        period: period.id,
        taskList: [task],
      },
    ],
    failOnStatusCode: false,
  }).then(res => {
    return res.body
  })
}

// Matter rates entered directly against the matter (NOT inherited from an org
// reference rate table). Mirrors the "manual rates" path of the costs wizard:
// the matter rate table detail is created WITHOUT a `rateTableDetails` reference.
// Returns a cy chain resolving to the created matter RateTableDetails.
export const setupMatterRatesManual = (
  adminUser,
  matterId,
  {
    currency = 'GBP',
    workType = 'Example',
    location = 'E2E - Matter',
    rate = 100,
  } = {}
) =>
  cy.login(adminUser).then(() =>
    cy
      .request({
        url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
        method: 'GET',
      })
      .its('body')
      .then(positions => {
        const advisorPosition = positions.find(p => p.name === 'Advisor')
        return cy
          .request({
            url: `${Cypress.env('serverBaseUrl')}/rate_type`,
            method: 'POST',
            body: { position: advisorPosition?.id },
          })
          .its('body')
          .then(rateTypes =>
            cy
              .request({
                url: `${Cypress.env('serverBaseUrl')}/grades`,
                method: 'POST',
                body: { position: advisorPosition?.id },
              })
              .its('body')
              .then(grades =>
                cy
                  .request({
                    url: `${Cypress.env('serverBaseUrl')}/rate_table_detail`,
                    method: 'POST',
                    body: {
                      currency,
                      work_type: workType,
                      location,
                      client: false,
                      draft: false,
                      matter: matterId,
                      position: advisorPosition?.id,
                    },
                  })
                  .its('body')
                  .then(newRtd =>
                    cy
                      .request({
                        url: `${Cypress.env('serverBaseUrl')}/periods`,
                        method: 'POST',
                        body: {
                          name: 'initial period',
                          startDate: new Date(2020, 1, 1),
                          endDate: null,
                          rateTableDetailId: newRtd.id,
                          matterId,
                        },
                      })
                      .its('body')
                      .then(period => {
                        const payload = grades.map(grade => ({
                          gradeId: grade.id,
                          rateTypeId: rateTypes[0].id,
                          periodId: period.periodId
                            ? period.periodId
                            : period.id,
                          rate,
                          rate_table_detailsId: newRtd.id,
                          matterId,
                        }))
                        return cy
                          .request({
                            url: `${Cypress.env('serverBaseUrl')}/rates/bulk`,
                            method: 'POST',
                            body: payload,
                          })
                          .then(() => newRtd)
                      })
                  )
              )
          )
      })
  )

// Configurable pricing arrangement for a projection period. Defaults to a fixed
// fee (type '1') so the snapshot carries revenue for the export's summary sheet.
// Pricing types (strings, as the wizard sends them):
//   '0' time-based (set cap '1' + value to cap it), '1' fixed fee (value = fee),
//   '2' no fee (set reason / fullReason).
export const addPricing = (
  matterId,
  period,
  tasks,
  adminUser,
  pricing = {}
) => {
  const {
    type = '1',
    value = 50000,
    cap = '0',
    reason = '0',
    fullReason = null,
  } = pricing
  return cy.login(adminUser).then(() =>
    cy
      .request({
        url: `${Cypress.env('serverBaseUrl')}/costs/pricing/${matterId}`,
        method: 'POST',
        body: [
          {
            matterId,
            type,
            value,
            fee: value,
            cap,
            reason,
            fullReason,
            type2control: '0',
            period: period.id,
            taskList: tasks,
          },
        ],
        failOnStatusCode: false,
      })
      .then(res => (Array.isArray(res.body) ? res.body[0] : res.body))
  )
}

// Out-of-scope terms for a projection period (the export's Out-of-Scope sheet).
// OutOfScopeDetails is keyed off the projection period server-side, so
// `projectionPeriodId` is required. `reason` mirrors the wizard: 'agreed',
// 'rates', or free text (max 300 chars); null when no written approval is needed.
export const addOutOfScopeDetails = (
  matterId,
  adminUser,
  { writtenApprovalNeeded = true, reason = 'agreed', projectionPeriodId } = {}
) =>
  cy.login(adminUser).then(() =>
    cy
      .request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/costs/outOfScopeDetails/${matterId}`,
        method: 'POST',
        body: { writtenApprovalNeeded, reason, projectionPeriodId },
      })
      .its('body')
  )

// Bulk-creates cost assumptions (the export's Assumptions sheet). Each item:
// { taskId, assumption, summary }.
export const addAssumptions = (matterId, adminUser, assumptions = []) => {
  if (!assumptions.length) return cy.wrap(null, { log: false })
  return cy.login(adminUser).then(() =>
    cy
      .request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/costs/assumption/${matterId}/bulk`,
        method: 'POST',
        body: assumptions,
      })
      .its('body')
  )
}

// Creates a Client-position rate table on the matter. A client matter needs its
// own rate table detail so out-of-scope terms (which key off it) can be saved.
// work_type/location are sent even though the Client branch doesn't require them
// — createRateTableDetails calls `.size()` on both, so null would NPE.
export const addClientMatterRateTable = (
  adminUser,
  matterId,
  { currency = 'GBP', workType = 'Example', location = 'E2E - Matter' } = {}
) =>
  cy.login(adminUser).then(() =>
    cy
      .request({
        url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
        method: 'GET',
      })
      .its('body')
      .then(positions => {
        const clientPosition = positions.find(p => p.name === 'Client')
        return cy
          .request({
            url: `${Cypress.env('serverBaseUrl')}/rate_table_detail`,
            method: 'POST',
            body: {
              currency,
              work_type: workType,
              location,
              client: false,
              draft: false,
              matter: matterId,
              position: clientPosition?.id,
            },
          })
          .its('body')
      })
  )

// Adds another projection period + pricing + cost time estimate + snapshot to an
// existing matter (e.g. to test multi-projection display / retiring one of
// several). Pass distinct period dates so it doesn't collide with existing
// periods. Resolves to { period, pricing, snapshot }.
export const createClientProjectionSnapshot = (
  adminUser,
  matter,
  task,
  { startDate, endDate, pricing = {} } = {}
) => {
  const out = {}
  return cy
    .wrap(null, { log: false })
    .then(() =>
      createProjectionPeriod(adminUser.username, matter.id, {
        startDate,
        endDate,
      })
    )
    .then(period => {
      out.period = period
    })
    .then(() => addPricing(matter.id, out.period, [task], adminUser, pricing))
    .then(savedPricing => {
      out.pricing = savedPricing
    })
    .then(() => createCostTimeEstimates(matter, out.period, task))
    .then(() => cy.login(adminUser))
    .then(() =>
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/snapshot/${matter.id}`,
        method: 'POST',
        body: {
          projectionPeriod: out.period.id,
          cteRevenueList: [],
          totalCost: 0,
        },
      })
    )
    .then(res => {
      out.snapshot = res.body
    })
    .then(() => out)
}

// API setup that produces a client matter ready for the fixed-fee SETUP FORM
// (the FixedFeeSetup wizard) — costs enabled, Client-position org costs AND a
// Client-position org rate table (so the wizard's "use existing rate card"
// option has one), a matter (creator is Client), and a couple of phases to
// scope. Deliberately stops BEFORE any projection/snapshot so the client view
// shows the "Get Started" entry point.
//
// Resolves to: { org, adminUser, matter, project, task1, task2 }
export const setupClientCostsMatter = () => {
  const ctx = {}
  return cy
    .wrap(null, { log: false })
    .then(() => createOrganisation('', false))
    .then(o => {
      ctx.org = o.body
    })
    .then(() =>
      createUser('', true, false, {
        roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
      })
    )
    .then(u => {
      ctx.adminUser = u
    })
    .then(() => sysadminAddUserToOrganisation(ctx.org, ctx.adminUser))
    .then(() =>
      cy.apiSpecRequest({
        url: `${Cypress.env('serverRootBaseUrl')}/api/admin/instance/settings`,
        method: 'PATCH',
        body: { enablePaymentPlatformIntegration: false },
      })
    )
    .then(() => cy.login(ctx.adminUser))
    .then(() => enableCosts())
    .then(() => enableOrgCosts(ctx.org.id))
    .then(() => {
      // Client org costs + a Client org rate table (the latter feeds the
      // wizard's "use existing rate card" picker).
      setupOrgLevelCosts(ctx.adminUser, ctx.org, {
        positionName: 'Client',
        createOrgRateTable: true,
      })
    })
    .then(() => createMatter('1', ctx.adminUser.username))
    .then(m => {
      ctx.matter = m
    })
    .then(() => createProject(ctx.matter.id, 'P1'))
    .then(project => {
      ctx.project = project
    })
    .then(() =>
      createTask(ctx.matter.id, ctx.project.id, 'not-started', 'Phase 1')
    )
    .then(task => {
      ctx.task1 = task
    })
    .then(() =>
      createTask(ctx.matter.id, ctx.project.id, 'not-started', 'Phase 2')
    )
    .then(task => {
      ctx.task2 = task
    })
    .then(() => ctx)
}

// End-to-end API setup that produces a matter on the CLIENT costs view
// (ClientMatterCostsContainer) with a finalised projection snapshot, WITHOUT
// driving the costs UI. The cost-setup user is Client-positioned on the matter
// (the default internal group's position is Client), so org costs are seeded for
// the Client position and the user routes straight to the full client view where
// the projection download lives — no advisor flow or internal client group
// needed. (Advisor-side setup is a separate concern; the snapshot-creation UI is
// covered by create_snapshot.cy.js.)
//
// Builds: org + org-admin user, Client-position org costs, a matter (creator is
// Client) with costs access, a project + deliverable task, a projection period, a
// client matter rate table, pricing, cost time estimates, optional out-of-scope
// terms and assumptions, and finally a snapshot.
//
// Options (all optional):
//   currency / workType / location   client matter rate-table fields
//   pricing     { type, value, cap, reason, fullReason } — see addPricing.
//               Defaults to a fixed fee of 50000 so the snapshot has a fee.
//   outOfScope  { writtenApprovalNeeded, reason } | null (default null) — adds
//               out-of-scope terms keyed off the client matter rate table.
//   assumptions [{ assumption, summary, taskId? }] — taskId defaults to the
//               seeded deliverable task. Defaults to a few seeded assumptions so
//               the export's Assumptions sheet has data; pass [] for none.
//
// (The client costs export shows deliverables, dates and assumptions per phase,
// not hours — the cost time estimate only exists so the task appears in scope.)
//
// Returns a cy chain resolving to:
//   { org, adminUser, matter, project, task, period, rateTable, pricing,
//     outOfScope, assumptions, snapshot }
const DEFAULT_CLIENT_COSTS_ASSUMPTIONS = [
  {
    assumption: 'Scope assumes timely client instructions throughout.',
    summary: 'Timely instructions',
  },
  {
    assumption: 'No material change to the transaction structure.',
    summary: 'Stable structure',
  },
  {
    assumption: 'Counterparty provides requested documents promptly.',
    summary: 'Prompt disclosure',
  },
]

export const setupClientCostsSnapshot = (options = {}) => {
  const {
    currency = 'GBP',
    workType = 'Example',
    location = 'E2E - Matter',
    pricing = {},
    outOfScope = null,
    assumptions = DEFAULT_CLIENT_COSTS_ASSUMPTIONS,
  } = options
  const ctx = {}
  return (
    cy
      .wrap(null, { log: false })
      .then(() => createOrganisation('', false))
      .then(o => {
        ctx.org = o.body
      })
      .then(() =>
        createUser('', true, false, {
          roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
        })
      )
      .then(u => {
        ctx.adminUser = u
      })
      .then(() => sysadminAddUserToOrganisation(ctx.org, ctx.adminUser))
      // Disable payment-platform integration before enabling costs — otherwise
      // enabling org costs / generating defaults attempts billing calls that fail
      // with no billing backend locally (surfacing as an opaque 500). Runs as
      // sysadmin: the session is still sysadmin from the add-to-org call above.
      .then(() =>
        cy.apiSpecRequest({
          url: `${Cypress.env(
            'serverRootBaseUrl'
          )}/api/admin/instance/settings`,
          method: 'PATCH',
          body: { enablePaymentPlatformIntegration: false },
        })
      )
      .then(() => cy.login(ctx.adminUser))
      .then(() => enableCosts())
      .then(() => enableOrgCosts(ctx.org.id))
      // Client-position org costs so the matter's Client position passes the
      // orgCostsSetupForMatterPosition gate (it checks Client OtherCosts).
      .then(() => {
        setupOrgLevelCosts(ctx.adminUser, ctx.org, { positionName: 'Client' })
      })
      // The creator's default group position is Client, so the matter positions
      // the creator as Client → routes straight to the client costs view.
      .then(() => createMatter('1', ctx.adminUser.username))
      .then(m => {
        ctx.matter = m
        // No explicit costs grant needed: matter creation
        // (activateForCurrentUser) already makes the creator a matter admin +
        // team member and — because Client org costs are set up above —
        // auto-creates their MatterCosts record, giving costs+admin access for
        // the snapshot. Granting again would violate MatterCosts'
        // `user unique: 'matter'` constraint.
      })
      .then(() => createProject(ctx.matter.id, 'P1'))
      .then(project => {
        ctx.project = project
      })
      .then(() =>
        createTask(ctx.matter.id, ctx.project.id, 'not-started', 'T1')
      )
      .then(task => {
        ctx.task = task
        createSubTask(
          ctx.matter.id,
          ctx.project.id,
          'not-started',
          'deliverable subtask',
          task.id,
          false,
          true
        )
      })
      .then(() => createProjectionPeriod(ctx.adminUser.username, ctx.matter.id))
      .then(period => {
        ctx.period = period
      })
      .then(() =>
        addClientMatterRateTable(ctx.adminUser, ctx.matter.id, {
          currency,
          workType,
          location,
        })
      )
      .then(rtd => {
        ctx.rateTable = rtd
      })
      .then(() =>
        addPricing(
          ctx.matter.id,
          ctx.period,
          [ctx.task],
          ctx.adminUser,
          pricing
        )
      )
      .then(savedPricing => {
        ctx.pricing = savedPricing
      })
      .then(() => createCostTimeEstimates(ctx.matter, ctx.period, ctx.task))
      .then(() =>
        outOfScope
          ? addOutOfScopeDetails(ctx.matter.id, ctx.adminUser, {
              ...outOfScope,
              projectionPeriodId: ctx.period.id,
            })
          : null
      )
      .then(savedOos => {
        ctx.outOfScope = savedOos
      })
      .then(() =>
        addAssumptions(
          ctx.matter.id,
          ctx.adminUser,
          assumptions.map(a => ({ taskId: ctx.task.id, ...a }))
        )
      )
      .then(savedAssumptions => {
        ctx.assumptions = savedAssumptions
      })
      .then(() => cy.login(ctx.adminUser))
      .then(() =>
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/costs/snapshot/${
            ctx.matter.id
          }`,
          method: 'POST',
          body: {
            projectionPeriod: ctx.period.id,
            cteRevenueList: [],
            totalCost: 0,
          },
        })
      )
      .then(res => {
        ctx.snapshot = res.body
      })
      .then(() => ctx)
  )
}

// Bolts an "external advisor" onto a matter that already has an internal
// CLIENT group (which both setupClientCostsSnapshot and setupClientCostsMatter
// produce — the creator sits in the default internal group, positioned Client).
//
// Creates a NON-internal org group, an ROLE_USER in it, adds that user to the
// matter (team + costs) and PATCHes the matter so the external group holds the
// ADVISOR position. The viewing user is therefore an advisor whose own group is
// not internal — which, because the matter has an internal client group, routes
// them to the READ-ONLY client costs view (MatterCostsContainer rule 2).
//
// Mutates and resolves the passed `ctx`, adding { advisorUser, externalGroup }.
// Expects ctx.org, ctx.adminUser (org admin) and ctx.matter to be present.
const attachExternalAdvisor = ctx => {
  const username = `external.advisor${new Date()
    .getTime()
    .toString()
    .slice(8)}@juralio.com`
  return (
    cy
      .login(ctx.adminUser)
      .then(() =>
        createOrganisationGroup(ctx.org.id, 'External Advisors', false)
      )
      .then(group => {
        ctx.externalGroup = group
      })
      // Org-admin session above lets createOrganisationUser POST into this org;
      // `group` puts the new user in the external (non-internal) group.
      .then(() =>
        createOrganisationUser({
          firstname: 'External',
          lastname: 'Advisor',
          username,
          group: ctx.externalGroup.id,
        })
      )
      .then(user => {
        ctx.advisorUser = user
      })
      // Everything below runs as the org admin (matter admin on this matter).
      .then(() => cy.login(ctx.adminUser))
      .then(() =>
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            ctx.matter.id
          }/teammembers`,
          method: 'POST',
          body: { matter: ctx.matter.id, user: ctx.advisorUser.id },
        })
      )
      .then(() =>
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            ctx.matter.id
          }/costs`,
          method: 'POST',
          body: { matter: ctx.matter.id, id: ctx.advisorUser.id },
        })
      )
      .then(() =>
        cy
          .request({
            url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
            method: 'GET',
          })
          .its('body')
      )
      .then(positions => {
        const advisorPosition = positions.find(p => p.name === 'Advisor')
        return cy.request({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            ctx.matter.id
          }/matterGroupPosition`,
          method: 'PATCH',
          body: {
            groupId: ctx.externalGroup.id,
            positionId: advisorPosition.id,
          },
        })
      })
      .then(() => ctx)
  )
}

// Read-only client costs scenario WITH a finalised snapshot: an external advisor
// viewing a matter that has a finalised client projection. Logging in as
// `ctx.advisorUser` and visiting /#/matter/${matter.id}/costs renders the
// read-only ClientCostsDashboard. `options` are forwarded to
// setupClientCostsSnapshot (e.g. { outOfScope }).
//
// Resolves to the snapshot ctx plus { advisorUser, externalGroup }.
export const setupClientCostsReadOnlyAdvisor = (options = {}) =>
  setupClientCostsSnapshot(options).then(attachExternalAdvisor)

// Read-only client costs scenario WITHOUT a snapshot: an external advisor on a
// client matter that has no finalised projection yet. The advisor sees the
// CostsReadOnlyNotSetup empty state ("Financial plan for this matter pending").
//
// Resolves to the matter ctx plus { advisorUser, externalGroup }.
export const setupClientCostsReadOnlyAdvisorNoSnapshot = () =>
  setupClientCostsMatter().then(attachExternalAdvisor)

export const finaliseAdvisorProjection = (adminUser, matter, task, period) =>
  cy.login(adminUser.username ? adminUser.username : adminUser).then(() =>
    cy
      .request({
        url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
        method: 'GET',
      })
      .its('body')
      .then(positions => {
        const advisorPosition = positions.find(p => p.name === 'Advisor')
        return cy
          .request({
            url: `${Cypress.env('serverBaseUrl')}/grades`,
            method: 'POST',
            body: { position: advisorPosition?.id },
          })
          .its('body')
          .then(grades => {
            createGradeRatios(matter, period, grades)
            createCostTimeEstimates(matter, period, task)
            addPricing(matter.id, period, [task], adminUser)
            return cy.request({
              url: `${Cypress.env('serverBaseUrl')}/costs/snapshot/${
                matter.id
              }`,
              method: 'POST',
              body: {
                projectionPeriod: period.id,
                cteRevenueList: [],
                totalCost: 0,
              },
            })
          })
      })
  )

export const createClientRateTableFlow = () => {
  before(() => {
    cy.visit('/#/organisation/costs')
    cy.wait(3000)
    cy.get('[data-test="close-icon"]').click()
    cy.get('[data-test="ftueSkipButton"]').click()
    cy.get('[data-test=continue-flow]').click()
    cy.get(
      ':nth-child(2) > .MuiButtonBase-root > .PrivateSwitchBase-input'
    ).click()
    cy.get('.css-wnftxj-confirmBox > span').click()
    cy.get('[data-test=client-name-field]').click()
    cy.wait(3000)
    cy.get('body').type('testClient')
    cy.get('[data-test=select-currency]').click()
    cy.get('[data-test="GBP"]').should('exist')
    cy.get('[data-test="GBP"]').click()
    cy.get('[data-test=select-location]').should('exist')
    cy.get('[data-test="any-location"]').click()
    cy.get('[data-test=select-worktype]').should('exist')
    cy.get('[data-test="any-worktype"]').click()
    cy.get('[data-test="choose-ref-table"] > .MuiSelect-select').click()
    cy.get('[data-test="ref-table"]').click()
    cy.get('[data-test=continue-flow]').click()
    cy.wait(2000)
    cy.get('[data-test=continue-flow]').click()
  })
  it('should have created a Client card ', () => {
    cy.get('[data-test=rate-table-card]').should('exist')
  })
}
