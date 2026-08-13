import faker from 'faker'
import HttpStatus from 'http-status-codes'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('named_sys_admin_creation', () => {
  const USER = {
    SYSADMIN_USER: {
      username: 'sysadmin@juralio.com',
      password: 'Password1Password1$',
    },
    STANDARD_USER: {
      username: 'matter.creator@juralio.com',
      password: 'Password2Password2$',
    },
  }

  const URL = 'users'
  let orgAdmin
  let body
  describe('as a sysadmin', () => {
    before(() => {
      body = {
        username: faker.internet.email().toLowerCase(),
        enabled: true,
        isExternal: false,
        roles: ['ROLE_SYSADMIN'],
      }
      cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      createUser('', true, true, { roles: ['ROLE_ORG_ADMIN'] }).then(
        user => (orgAdmin = user)
      )
    })
    it('allows sysadmins to add a sysadmin', () => {
      cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'POST',
        body: body,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.CREATED)
      })
    })
  })
  describe('as an org admin', () => {
    before(() => {
      body = {
        username: faker.internet.email().toLowerCase(),
        enabled: true,
        isExternal: false,
        roles: ['ROLE_USER', 'ROLE_SYSADMIN'],
      }
      cy.login(orgAdmin)
    })
    it('does not allow org admins to add a sysadmin', () => {
      cy.login(orgAdmin)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'POST',
        body: body,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
  describe('as a sysadmin', () => {
    before(() => {
      body = {
        username: faker.internet.email().toLowerCase(),
        enabled: true,
        isExternal: false,
        roles: ['ROLE_SYSADMIN', 'ROLE_MATTER_CREATOR'],
      }
      cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      createUser('', true, true, { roles: ['ROLE_ORG_ADMIN'] }).then(
        user => (orgAdmin = user)
      )
    })
    it('I cannot add a sysadmin with more roles', () => {
      cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'POST',
        body: body,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.CREATED)
        expect(response.body.roles).to.have.length(2)
        expect(response.body.roles[0]).to.eq('ROLE_USER')
        expect(response.body.roles[1]).to.eq('ROLE_SYSADMIN')
      })
    })
  })
  describe('as a sysadmin', () => {
    before(() => {
      body = {
        username: faker.internet.email().toLowerCase(),
        enabled: true,
        isExternal: false,
        organisation: { id: 11 },
        roles: ['ROLE_SYSADMIN', 'ROLE_MATTER_CREATOR'],
      }
      cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      createUser('', true, true, { roles: ['ROLE_ORG_ADMIN'] }).then(
        user => (orgAdmin = user)
      )
    })
    it('I cannot add a sysadmin with an organisation', () => {
      cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'POST',
        body: body,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
  describe('as a sysadmin', () => {
    before(() => {
      body = {
        usernames: [faker.internet.email().toLowerCase()],
        enabled: true,
        isExternal: false,
        organisation: { id: 11 },
        roles: ['ROLE_SYSADMIN', 'ROLE_MATTER_CREATOR'],
      }
      cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      createUser('', true, true, { roles: ['ROLE_ORG_ADMIN'] }).then(
        user => (orgAdmin = user)
      )
    })
    it('I cannot bulk add sysadmins', () => {
      cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}/bulk`,
        method: 'POST',
        body: body,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})
