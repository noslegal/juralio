import {
  enableCosts,
  enableOrgCosts,
} from '../../../../helpers/admin/admin_api_helpers'
import {
  createProjectionPeriod,
  setupOrgLevelCosts,
  createCostRatioPayload,
  setupMatterRates,
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

/*
Purpose: Test the different response conditions for the gradeRatio controller

Test flow:  Sends requests at various stages of authentication for the process of creating gradeRatio objects


Date created: 30/05/24
*/

describe('grade_ratio_api_spec.cy', () => {
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
  describe('when trying to create cost ratios before setting up org costs', () => {
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
    it('Should not be allowed to create cost ratios', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/costRatio/${matter.id}`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('When trying to create cost ratios without costs role', () => {
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
    it('should not be allowed to create a cost ratio', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/costRatio/${matter.id}`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('When trying to create cost ratios with costs role but bad payload', () => {
    before(() => {
      cy.login(matterCreatorUser)
      addMatterCosts(matter.id, orgAdminUser.id, matterCreatorUser)
    })
    it('should not be allowed to create a cost ratio', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/costRatio/${matter.id}`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
  describe('When creating cost ratios as a matter team member with org costs setup and costs role', () => {
    before(() => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
        method: 'GET',
      })
        .its('body')
        .then(positions => {
          const advisorPosition = positions.find(p => p.name === 'Advisor')
          cy.request({
            url: `${Cypress.env('serverBaseUrl')}/grades`,
            method: 'POST',
            body: { position: advisorPosition?.id },
            failOnStatusCode: false,
          }).then(g => {
            grades = g.body
          })
        })
      createProjectionPeriod(orgAdminUser, matter.id).then(p => {
        period = p
        setupMatterRates(orgAdminUser, org.id, matter.id)
      })
    })
    it('should be allowed to create cost ratios', () => {
      cy.login(orgAdminUser)
      console.log(grades)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/costRatio/${matter.id}`,
        method: 'POST',
        body: createCostRatioPayload(grades, period),
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
  describe('When trying to make a Cost ratio as a user from a different org', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/costRatio/${matter.id}`,
        method: 'POST',
        body: [],
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('When trying to create a cost ratio as a sysadmin', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/costRatio/${matter.id}`,
        method: 'POST',
        body: [],
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })
})
