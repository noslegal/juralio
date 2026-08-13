import faker from 'faker'
import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
} from '../../../../../helpers/organisation/organisation_api_helper'

describe('external_user_knowledge_manager_role.cy', () => {
  let externalUser, fixture, orgUsers, otherOrgUsers, template
  before(() => {
    createDefaultOrgTestUsers()
      .then(users => {
        orgUsers = users
      })
      .then(() => createPopulatedDummyOrg('otherOrg'))
      .then(users => {
        otherOrgUsers = users
      })
      .then(() => {
        const seed = {
          matter: {
            prefix: 'Matter',
            teamMembers: [
              orgUsers.teamMember,
              orgUsers.matterAdminAndTeamMember,
              orgUsers.knowledgeManager,
            ],
            matterAdmins: [
              orgUsers.matterAdmin,
              orgUsers.matterAdminAndTeamMember,
            ],
            projects: [
              {
                name: 'Project',
                tasks: [],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when trying to create a external knowledge manager as an org admin', () => {
    it('should not allow this action', () => {
      cy.login(otherOrgUsers.orgAdmin.username, 'Password2Password2$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/users`,
        method: 'POST',
        body: {
          roles: ['ROLE_USER', 'ROLE_KNOWLEDGE_MANAGER'],
          isExternal: true,
          organisation: { id: otherOrgUsers.orgAdmin.organisation.id },
          username: faker.internet.email().toLowerCase(),
        },
        failOnStatusCode: false,
      }).then(response => expect(response.status).to.eq(HttpStatus.BAD_REQUEST))
    })
  })
  describe('when trying to make an external user a knowledge manager as an org admin', () => {
    it('should not allow the external user to be a knowledge manager', () => {
      cy.login(otherOrgUsers.orgAdmin.username, 'Password2Password2$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/users`,
        method: 'POST',
        body: {
          roles: ['ROLE_USER'],
          isExternal: true,
          organisation: { id: otherOrgUsers.orgAdmin.organisation.id },
          username: faker.internet.email().toLowerCase(),
        },
        failOnStatusCode: false,
      }).then(response => {
        let newUser = response.body
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/users/${newUser.id}`,
          method: 'PATCH',
          body: {
            roles: ['ROLE_USER', 'ROLE_KNOWLEDGE_MANAGER'],
          },
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })
  })
  describe('when trying to make a knowledge manager external as an org admin', () => {
    it('should not allow the external user to be a knowledge manager', () => {
      cy.login(otherOrgUsers.orgAdmin.username, 'Password2Password2$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/users`,
        method: 'POST',
        body: {
          roles: ['ROLE_USER', 'ROLE_KNOWLEDGE_MANAGER'],
          organisation: { id: otherOrgUsers.orgAdmin.organisation.id },
          username: faker.internet.email().toLowerCase(),
        },
        failOnStatusCode: false,
      }).then(response => {
        let newUser = response.body
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/users/${newUser.id}`,
          method: 'PATCH',
          body: {
            isExternal: true,
          },
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.eq(372)
        })
      })
    })
  })

  describe('when trying to create a external knowledge manager as an sys admin', () => {
    it('should not allow this action', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/users`,
        method: 'POST',
        body: {
          roles: ['ROLE_USER', 'ROLE_KNOWLEDGE_MANAGER'],
          isExternal: true,
          username: faker.internet.email().toLowerCase(),
        },
        failOnStatusCode: false,
      }).then(response => expect(response.status).to.eq(HttpStatus.BAD_REQUEST))
    })
  })
  describe('when trying to make an external user a knowledge manager as an sys admin', () => {
    it('should not allow the external user to be a knowledge manager', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/users`,
        method: 'POST',
        body: {
          roles: ['ROLE_USER'],
          isExternal: true,
          username: faker.internet.email().toLowerCase(),
        },
        failOnStatusCode: false,
      }).then(response => {
        let newUser = response.body
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/users/${newUser.id}`,
          method: 'PATCH',
          body: {
            roles: ['ROLE_USER', 'ROLE_KNOWLEDGE_MANAGER'],
          },
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })
  })
  describe('when trying to make a knowledge manager external as an sys admin', () => {
    it('should not allow the external user to be a knowledge manager', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/users`,
        method: 'POST',
        body: {
          roles: ['ROLE_USER', 'ROLE_KNOWLEDGE_MANAGER'],
          username: faker.internet.email().toLowerCase(),
        },
        failOnStatusCode: false,
      }).then(response => {
        let newUser = response.body
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/users/${newUser.id}`,
          method: 'PATCH',
          body: {
            isExternal: true,
          },
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.eq(372)
        })
      })
    })
  })

  describe('when forcing to make an external user a knowledge manager as an org admin', () => {
    it('should  allow the external user to be a knowledge manager', () => {
      cy.login(otherOrgUsers.orgAdmin.username, 'Password2Password2$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/users`,
        method: 'POST',
        body: {
          roles: ['ROLE_USER'],
          isExternal: true,
          organisation: { id: otherOrgUsers.orgAdmin.organisation.id },
          username: faker.internet.email().toLowerCase(),
        },
        failOnStatusCode: false,
      }).then(response => {
        let newUser = response.body
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/users/${newUser.id}`,
          method: 'PATCH',
          body: {
            roles: ['ROLE_USER', 'ROLE_KNOWLEDGE_MANAGER'],
            forceUpdate: true,
          },
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })
  describe('when forcing to make a knowledge manager external as an org admin', () => {
    it('should  allow the external user to be a knowledge manager', () => {
      cy.login(otherOrgUsers.orgAdmin.username, 'Password2Password2$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/users`,
        method: 'POST',
        body: {
          roles: ['ROLE_USER', 'ROLE_KNOWLEDGE_MANAGER'],
          organisation: { id: otherOrgUsers.orgAdmin.organisation.id },
          username: faker.internet.email().toLowerCase(),
        },
        failOnStatusCode: false,
      }).then(response => {
        let newUser = response.body
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/users/${newUser.id}`,
          method: 'PATCH',
          body: {
            isExternal: true,
            forceUpdate: true,
          },
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })
  describe('when trying to make an external user a knowledge manager as an sys admin', () => {
    it('should  allow the external user to be a knowledge manager', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/users`,
        method: 'POST',
        body: {
          roles: ['ROLE_USER'],
          isExternal: true,
          username: faker.internet.email().toLowerCase(),
        },
        failOnStatusCode: false,
      }).then(response => {
        let newUser = response.body
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/users/${newUser.id}`,
          method: 'PATCH',
          body: {
            roles: ['ROLE_USER', 'ROLE_KNOWLEDGE_MANAGER'],
            forceUpdate: true,
          },
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })
  describe('when trying to make a knowledge manager external as an sys admin', () => {
    it('should  allow the external user to be a knowledge manager', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/users`,
        method: 'POST',
        body: {
          roles: ['ROLE_USER', 'ROLE_KNOWLEDGE_MANAGER'],
          username: faker.internet.email().toLowerCase(),
        },
        failOnStatusCode: false,
      }).then(response => {
        let newUser = response.body
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/users/${newUser.id}`,
          method: 'PATCH',
          body: {
            isExternal: true,
            forceUpdate: true,
          },
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })
})
