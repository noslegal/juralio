import {
  enableCosts,
  enableOrgCosts,
} from '../../../../helpers/admin/admin_api_helpers'
import {
  createProjectionPeriod,
  setupOrgLevelCosts,
} from '../../../../helpers/costs/costs_helper'
import {
  addMatterAdmin,
  addMatterCosts,
  createAdvisorMatter,
} from '../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../helpers/matterprojects/projects_api_helper'
import { createTask } from '../../../../helpers/matterprojects/task_api_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('cost_time_estimate_api_spec.cy', () => {
  let orgAdminUser, matterCreatorUser
  let org, period, grades, rateTypes, rtd, matter, task
  //set up
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
        })
      })
    })
  })
  describe('when trying to create matter cte before setting up org costs', () => {
    before(() => {
      cy.login(matterCreatorUser)
      createAdvisorMatter('1', matterCreatorUser.username)
        .then(m => {
          matter = m
          addMatterAdmin(m.id, orgAdminUser.id, matterCreatorUser)
          createProject(m.id, 'P1').then(project => {
            createTask(m.id, project.id, 'not-started', 'T1').then(t => {
              task = t
            })
          })
        })
        .then(res => {
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
          })
        })
    })
    it('Should not be allowed to create a cost time estimate', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/costTimeEstimate/${matter.id}`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('When trying to create a cost time estimate without costs role', () => {
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
    it('should not be allowed to create a cost time estimate', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/costTimeEstimate/${matter.id}`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('When creating a cost time estimate as a matter team member with org costs setup and costs role', () => {
    before(() => {
      cy.login(matterCreatorUser)
      addMatterCosts(matter.id, matterCreatorUser.id, matterCreatorUser)
      createProjectionPeriod(matterCreatorUser, matter.id).then(p => {
        period = p
      })
    })
    it('should be allowed to create a cost time estimate', () => {
      cy.login(matterCreatorUser)
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
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
  describe('When trying to make a cost time estimate as a user from a different org', () => {
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
      cy.login('matter.creator@juralio.com')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/costTimeEstimate/${matter.id}`,
        method: 'POST',
        body: [],
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('When trying to create a cost time estimate as a sysadmin', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/costTimeEstimate/${matter.id}`,
        method: 'POST',
        body: [],
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })
  describe('the syncFromTasks endpoint', () => {
    it('should not be allowed for a user from a different org', () => {
      cy.login('matter.creator@juralio.com')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/costTimeEstimate/${matter.id}/sync`,
        method: 'POST',
        body: { projectionPeriod: period.id, taskList: [] },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
    it('should not be allowed for a sysadmin', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'sysadmin@juralio.com',
          password: 'Password1Password1$',
        },
      })
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/costTimeEstimate/${matter.id}/sync`,
        method: 'POST',
        body: { projectionPeriod: period.id, taskList: [] },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
    it('should be allowed for a matter team member with org costs setup and costs role', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/costTimeEstimate/${matter.id}/sync`,
        method: 'POST',
        body: { projectionPeriod: period.id, taskList: [] },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
})
