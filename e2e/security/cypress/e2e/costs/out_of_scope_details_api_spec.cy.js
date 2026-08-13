import {
  enableCosts,
  enableOrgCosts,
} from '../../../../helpers/admin/admin_api_helpers'
import {
  createProjectionPeriod,
  setupMatterRates,
  setupOrgLevelCosts,
} from '../../../../helpers/costs/costs_helper'
import {
  addMatterAdmin,
  addMatterCosts,
  createAdvisorMatter,
} from '../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../helpers/matterprojects/projects_api_helper'
import { createTask } from '../../../../helpers/matterprojects/task_api_helper'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('out_of_scope_details_api_spec.cy', () => {
  let orgAdminUser, matterCreatorUser
  let org, grades, rateTypes, rtd, matter, task, rateTableDetailsId, oosDetail
  // The out-of-scope save now requires a projectionPeriodId that belongs to the
  // matter (createOutOfScopeDetails resolves the period and checks ownership).
  let projectionPeriodId
  // Org-level costs are position-scoped (groups-positions work). These tests
  // exercise the Advisor flow, so org costs are seeded for Advisor and the
  // position-scoped rate-table filter must be told which position to report on.
  let advisorPosition

  before(() => {
    createOrganisation('', false).then(o => {
      org = o.body
      createUser('', true, false, {
        roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
      }).then(u => {
        orgAdminUser = u
        sysadminAddUserToOrganisation(org, orgAdminUser)
        createUser('', true, false, {
          roles: ['ROLE_MATTER_CREATOR'],
        }).then(u => {
          matterCreatorUser = u
          sysadminAddUserToOrganisation(org, matterCreatorUser)
          cy.login(orgAdminUser).then(() => {
            cy.request({
              url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
              method: 'GET',
            })
              .its('body')
              .then(positions => {
                advisorPosition = positions.find(p => p.name === 'Advisor')?.id
              })
          })
        })
      })
    })
  })

  describe('when trying to create out of scope details without costs enabled', () => {
    before(() => {
      cy.login(matterCreatorUser)
      createAdvisorMatter('1', matterCreatorUser.username).then(m => {
        matter = m
        addMatterAdmin(m.id, orgAdminUser.id, matterCreatorUser)
        createProject(m.id, 'P1').then(project => {
          createTask(m.id, project.id, 'not-started', 'T1').then(t => {
            task = t
          })
        })
      })
    })
    it('should not be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/outOfScopeDetails/${
          matter.id
        }`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })

  describe('when trying to create out of scope details with costs enabled but no costs role', () => {
    before(() => {
      cy.login(orgAdminUser)
      enableCosts().then(res => {
        expect(res.status).to.eq(200)
        enableOrgCosts(org.id).then(res => {
          expect(res.status).to.eq(200)
          setupOrgLevelCosts(orgAdminUser, org, rtd, grades, rateTypes)
        })
      })
    })
    it('should not be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/outOfScopeDetails/${
          matter.id
        }`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })

  describe('when trying to create out of scope details with costs enabled and costs role but invalid body', () => {
    before(() => {
      cy.login(matterCreatorUser)
      addMatterCosts(matter.id, orgAdminUser.id, matterCreatorUser)
      setupMatterRates(orgAdminUser, org.id, matter.id).then(() => {
        cy.login(orgAdminUser)
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/rate_table_details/filter`,
          method: 'POST',
          body: { matterId: matter.id, position: advisorPosition },
        }).then(res => {
          rateTableDetailsId =
            res.body[0]?.rateTableDetails?.id || res.body[0]?.id
        })
      })
    })
    it('should fail with BAD_REQUEST', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/outOfScopeDetails/${
          matter.id
        }`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })

  describe('when trying to create out of scope details with costs enabled and costs role and valid body', () => {
    before(() => {
      createProjectionPeriod(orgAdminUser, matter.id).then(p => {
        projectionPeriodId = p.id
      })
    })
    it('should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/outOfScopeDetails/${
          matter.id
        }`,
        method: 'POST',
        body: {
          writtenApprovalNeeded: false,
          projectionPeriodId,
          rateTableDetailsId,
          reason: 'security test',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
        oosDetail = res.body
      })
    })
  })

  describe('when trying to create out of scope details as a sysadmin', () => {
    before(() => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'sysadmin@juralio.com',
          password: 'Password1Password1$',
        },
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.roles).to.contain('ROLE_SYSADMIN')
      })
    })
    it('should not be allowed', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'sysadmin@juralio.com',
          password: 'Password1Password1$',
        },
      })
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/outOfScopeDetails/${
          matter.id
        }`,
        method: 'POST',
        body: {
          writtenApprovalNeeded: false,
          rateTableDetailsId,
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })

  describe('when trying to create out of scope details as user from another org', () => {
    before(() => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'matter.creator@juralio.com',
          password: 'Password2Password2$',
        },
      }).then(response => {
        expect(response.status).to.eq(200)
      })
    })
    it('should not be allowed', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'matter.creator@juralio.com',
          password: 'Password2Password2$',
        },
      })
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/outOfScopeDetails/${
          matter.id
        }`,
        method: 'POST',
        body: {
          writtenApprovalNeeded: false,
          rateTableDetailsId,
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })

  describe('when trying to update out of scope details as a valid user', () => {
    before(() => {
      cy.login(orgAdminUser)
    })
    it('should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/outOfScopeDetails/${
          matter.id
        }/${oosDetail.id}`,
        method: 'PATCH',
        body: {
          reason: 'updated reason',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })

  describe('when trying to update out of scope details as a sysadmin', () => {
    before(() => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'sysadmin@juralio.com',
          password: 'Password1Password1$',
        },
      })
    })
    it('should not be allowed', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'sysadmin@juralio.com',
          password: 'Password1Password1$',
        },
      })
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/outOfScopeDetails/${
          matter.id
        }/${oosDetail.id}`,
        method: 'PATCH',
        body: { reason: 'sysadmin reason' },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })

  describe('when trying to update out of scope details as user from another org', () => {
    before(() => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'matter.creator@juralio.com',
          password: 'Password2Password2$',
        },
      })
    })
    it('should not be allowed', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'matter.creator@juralio.com',
          password: 'Password2Password2$',
        },
      })
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/outOfScopeDetails/${
          matter.id
        }/${oosDetail.id}`,
        method: 'PATCH',
        body: { reason: 'other org reason' },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })

  describe('when trying to delete out of scope details as a sysadmin', () => {
    before(() => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'sysadmin@juralio.com',
          password: 'Password1Password1$',
        },
      })
    })
    it('should not be allowed', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'sysadmin@juralio.com',
          password: 'Password1Password1$',
        },
      })
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/outOfScopeDetails/${
          matter.id
        }/${oosDetail.id}`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })

  describe('when trying to delete out of scope details as user from another org', () => {
    before(() => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'matter.creator@juralio.com',
          password: 'Password2Password2$',
        },
      })
    })
    it('should not be allowed', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'matter.creator@juralio.com',
          password: 'Password2Password2$',
        },
      })
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/outOfScopeDetails/${
          matter.id
        }/${oosDetail.id}`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })

  describe('when trying to delete out of scope details as a valid user', () => {
    before(() => {
      cy.login(orgAdminUser)
    })
    it('should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/outOfScopeDetails/${
          matter.id
        }/${oosDetail.id}`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
})
