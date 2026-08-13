import {
  enableCosts,
  enableOrgCosts,
} from '../../../../helpers/admin/admin_api_helpers'
import { setupOrgLevelCosts } from '../../../../helpers/costs/costs_helper'
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

describe('cost_api_spec.cy', () => {
  let orgAdminUser, matterCreatorUser, noCostsUser
  let org, grades, rateTypes, rtd, matter, task
  // Org-level costs are position-scoped (groups-positions work). These tests
  // exercise the Advisor flow, so org costs are seeded for Advisor and the
  // stageData endpoint must be told which position to report on.
  let advisorPosition
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
          createUser('', true, false, {
            roles: ['ROLE_MATTER_CREATOR'],
          }).then(v => {
            noCostsUser = v
            sysadminAddUserToOrganisation(org, noCostsUser)
          })
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
  //before org costs setup
  describe('org stage data whithout costs enabled', () => {
    before(() => {
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
    it('Should not be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/stageData`,
        method: 'POST',
        body: { position: advisorPosition },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('org stage data whithout being an org admin', () => {
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
    it('Should not be allowed', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/stageData`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('org stage data as an org admin', () => {
    before(() => {
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
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/stageData`,
        method: 'POST',
        body: { position: advisorPosition },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
  describe('org stage data as an sysadmin', () => {
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
        expect(response.body.roles).to.not.contain('ROLE_ORG_ADMIN')
      })
    })
    it('Should not be allowed', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/stageData`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('Matter stage data without matter costs role', () => {
    before(() => {
      cy.login(matterCreatorUser)
      createAdvisorMatter('1', matterCreatorUser.username)
        .then(m => {
          matter = m
          addMatterAdmin(m.id, orgAdminUser.id, matterCreatorUser)
          // A matter admin with read access but no costs role — used to assert
          // the costs endpoints are gated on the costs role specifically.
          addMatterAdmin(m.id, noCostsUser.id, matterCreatorUser)
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
    it('Should not be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/matterStageData/${
          matter.id
        }`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('Matter stage data with matter costs role', () => {
    before(() => {
      cy.login(matterCreatorUser)
      addMatterCosts(matter.id, orgAdminUser.id, matterCreatorUser)
    })
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/matterStageData/${
          matter.id
        }`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
  describe('matter stage data as an sysadmin', () => {
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
        expect(response.body.roles).to.not.contain('ROLE_ORG_ADMIN')
      })
    })
    it('Should not be allowed', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/matterStageData/${
          matter.id
        }`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('Client matter stage data with matter costs role', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/clientMatterStageData/${
          matter.id
        }`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
  describe('Client matter stage data without matter costs role', () => {
    it('Should not be allowed', () => {
      cy.login(noCostsUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/clientMatterStageData/${
          matter.id
        }`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('Client matter stage data as a sysadmin', () => {
    it('Should not be allowed', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/clientMatterStageData/${
          matter.id
        }`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('Client matter stage data as a cross-org user', () => {
    it('Should not be allowed', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'matter.creator@juralio.com',
          password: 'Password2Password2$',
        },
      })
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/clientMatterStageData/${
          matter.id
        }`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.be.oneOf([401, 403])
      })
    })
  })
})
