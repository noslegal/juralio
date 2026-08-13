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
  addTeamMember,
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

describe('projection_period_api_spec.cy', () => {
  let orgAdminUser, matterCreatorUser, nonMatterUser
  let org, period, matter, task, projectionPeriod, matter2
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
        createUser('', true, false, {
          roles: ['ROLE_USER'],
        }).then(u => {
          nonMatterUser = u
          sysadminAddUserToOrganisation(org, nonMatterUser)
        })
      })
    })
  })
  describe('when trying to create a projection period before setting up org costs', () => {
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
    it('Should not be allowed to create a projection period', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/projectionPeriod/${
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
  describe('When trying to create a projection period without costs role', () => {
    before(() => {
      cy.login(orgAdminUser)
      enableCosts().then(res => {
        expect(res.status).to.eq(200)
        enableOrgCosts(org.id).then(res => {
          expect(res.status).to.eq(200)
          setupOrgLevelCosts(orgAdminUser, org)
        })
      })
    })
    it('should not be allowed to create a projection period', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/projectionPeriod/${
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
  describe('When creating a projection period as a matter team member with org costs setup and costs role', () => {
    before(() => {
      cy.login(matterCreatorUser)
      addMatterCosts(matter.id, matterCreatorUser.id, matterCreatorUser)
      createProjectionPeriod(matterCreatorUser, matter.id).then(p => {
        period = p
      })
    })
    it('should be allowed to create a projection period', () => {
      cy.login(matterCreatorUser).then(() => {
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/costs/projectionPeriod/${
            matter.id
          }`,
          method: 'POST',
          body: {
            startDate: new Date(2020, 1, 1),
            endDate: new Date(2020, 11, 1),
            matterId: matter.id,
          },
        }).then(res => {
          expect(res.status).to.eq(200)
        })
      })
    })
  })
  describe('When trying to make a projection period as a user from a different org', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/projectionPeriod/${
          matter.id
        }`,
        method: 'POST',
        body: [{}],
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('When trying to create a projection period as a sysadmin', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/projectionPeriod/${
          matter.id
        }`,
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
        expect(res.status).to.eq(401)
      })
    })
  })

  describe('When updating a projection period as a matter team member with org costs setup and costs role', () => {
    before(() => {
      cy.login(matterCreatorUser)
      createAdvisorMatter('1', matterCreatorUser.username).then(m => {
        matter2 = m
        addTeamMember(m.id, orgAdminUser.id, matterCreatorUser)
        addMatterAdmin(m.id, orgAdminUser.id, matterCreatorUser)
        addMatterCosts(matter2.id, orgAdminUser.id, matterCreatorUser)
        createProject(m.id, 'P1').then(project => {
          createTask(m.id, project.id, 'not-started', 'T1').then(t => {
            task = t
            createProjectionPeriod(orgAdminUser.username, matter2.id).then(
              p => {
                projectionPeriod = p
              }
            )
          })
        })
      })
    })
    it('should be allowed to update a projection period', () => {
      cy.login(orgAdminUser).then(() => {
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/costs/projectionPeriod/${
            matter2.id
          }/${projectionPeriod.id}`,
          method: 'PATCH',
          body: {
            startDate: new Date(2020, 1, 1),
            endDate: new Date(2021, 11, 1),
            matterId: matter2.id,
          },
        }).then(res => {
          expect(res.status).to.eq(200)
        })
      })
    })

    it('should not be allowed to update a projection period as a non matter member', () => {
      cy.login(nonMatterUser).then(() => {
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/costs/projectionPeriod/${
            matter.id
          }/${projectionPeriod.id}`,
          method: 'PATCH',
          failOnStatusCode: false,
          body: {
            startDate: new Date(2020, 1, 1),
            endDate: new Date(2021, 11, 1),
            matterId: matter.id,
          },
        }).then(res => {
          expect(res.status).to.eq(403)
        })
      })
    })
    it('should not be allowed to update a projection period as a non org member', () => {
      cy.login('matter.creator@juralio.com').then(() => {
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/costs/projectionPeriod/${
            matter.id
          }/${projectionPeriod.id}`,
          failOnStatusCode: false,
          method: 'PATCH',
          body: {
            startDate: new Date(2020, 1, 1),
            endDate: new Date(2021, 11, 1),
            matterId: matter.id,
          },
        }).then(res => {
          expect(res.status).to.eq(403)
        })
      })
    })
  })
})
