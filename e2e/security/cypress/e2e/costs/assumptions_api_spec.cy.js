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

describe('assumptions_api_spec.cy', () => {
  let orgAdminUser, matterCreatorUser
  let org, matter, task, assumption
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
  describe('when trying to create an assumption without costs enabled', () => {
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
    it('should not be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('when trying to create a assumption with costs enabled but without costs role', () => {
    before(() => {
      cy.login(orgAdminUser)
      enableCosts().then(res => {
        expect(res.status).to.eq(200)
        enableOrgCosts(org.id).then(res => {
          expect(res.status).to.eq(200)
          setupOrgLevelCosts(orgAdminUser, org, { positionName: 'Advisor' })
        })
      })
    })
    it('should not be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('when trying to create a assumption with costs enabled and costs role but with invalid body', () => {
    before(() => {
      cy.login(matterCreatorUser)
      addMatterCosts(matter.id, orgAdminUser.id, matterCreatorUser)
    })
    it('should not be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })
  describe('when trying to create a assumption with costs enabled and costs role and valid body', () => {
    it('should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}`,
        method: 'POST',
        body: {
          taskId: task.id,
          assumption: 'test',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
  describe('when trying to create a assumption as a sysadmin', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}`,
        method: 'POST',
        body: {
          taskId: task.id,
          assumption: 'test',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })
  describe('when trying to create a assumption as user from another org', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}`,
        method: 'POST',
        body: {
          taskId: task.id,
          assumption: 'test',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })
  describe('when trying to access a assumption as a valid user', () => {
    before(() => {
      cy.login(orgAdminUser)
    })
    it('should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
        assumption = res.body
      })
    })
  })
  describe('when trying to access a assumption as a sysadmin', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}`,
        method: 'GET',
        body: {
          taskId: task.id,
          assumption: 'test',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })
  describe('when trying to access a assumption as user from another org', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })
  describe('when trying to update a assumption as a valid user', () => {
    before(() => {
      cy.login(orgAdminUser)
    })
    it('should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}/${
          assumption[0].id
        }`,
        method: 'PATCH',
        body: {
          assumption: 'test2',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
  describe('when trying to update a assumption as a sysadmin', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}/${
          assumption[0].id
        }`,
        method: 'PATCH',
        body: {
          assumption: 'test2',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })
  describe('when trying to update a assumption as user from another org', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}/${
          assumption[0].id
        }`,
        method: 'PATCH',
        body: {
          assumption: 'test2',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })

  describe('when trying to delete a assumption as a valid user', () => {
    before(() => {
      cy.login(orgAdminUser)
    })
    it('should NOT be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}/${
          assumption[0].id
        }`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
  describe('when trying to delete a assumption as a sysadmin', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}/${
          assumption[0].id
        }`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })
  describe('when trying to delete a assumption as user from another org', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}/${
          assumption[0].id
        }`,
        method: 'DELETE',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })

  describe('when trying to bulk save assumptions as a valid user with invalid body', () => {
    before(() => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}`,
        method: 'POST',
        body: { taskId: task.id, assumption: 'restored for bulk tests' },
        failOnStatusCode: false,
      }).then(res => {
        assumption = [res.body]
      })
    })
    it('should fail with BAD_REQUEST', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${
          matter.id
        }/bulk`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.be.oneOf([400, 500])
      })
    })
  })

  describe('when trying to bulk save assumptions as a valid user', () => {
    it('should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${
          matter.id
        }/bulk`,
        method: 'POST',
        body: [{ taskId: task.id, assumption: 'bulk 1' }],
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })

  describe('when trying to bulk save assumptions as a sysadmin', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${
          matter.id
        }/bulk`,
        method: 'POST',
        body: [{ taskId: task.id, assumption: 'sysadmin bulk' }],
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })

  describe('when trying to bulk save assumptions as user from another org', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${
          matter.id
        }/bulk`,
        method: 'POST',
        body: [{ taskId: task.id, assumption: 'cross-org' }],
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })

  describe('when trying to bulk update assumptions as a valid user', () => {
    it('should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${
          matter.id
        }/bulk`,
        method: 'PATCH',
        body: [{ assumptionId: assumption[0].id, assumption: 'bulk updated' }],
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })

  describe('when trying to bulk update assumptions as a sysadmin', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${
          matter.id
        }/bulk`,
        method: 'PATCH',
        body: [{ assumptionId: assumption[0].id, assumption: 'sa update' }],
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })

  describe('when trying to bulk update assumptions as user from another org', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${
          matter.id
        }/bulk`,
        method: 'PATCH',
        body: [
          { assumptionId: assumption[0].id, assumption: 'cross-org update' },
        ],
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })

  describe('when trying to fetch a single assumption by id as a valid user', () => {
    it('should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}/${
          assumption[0].id
        }`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })

  describe('when trying to fetch a single assumption by id as a sysadmin', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}/${
          assumption[0].id
        }`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })

  describe('when trying to fetch a single assumption by id as user from another org', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}/${
          assumption[0].id
        }`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(401)
      })
    })
  })
})
