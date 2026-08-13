import faker from 'faker'
import HttpStatus from 'http-status-codes'
import {
  createUser,
  DEFAULT_ORGANISATION_ID,
} from '../../../../helpers/users/user_api_helper'

describe('bulk_user_creation', () => {
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

  const URL = 'users/bulk'
  let body
  let orgAdmin
  let internalGroupId
  describe('as a sysadmin', () => {
    before(() => {
      cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/groups`,
        method: 'GET',
      }).then(response => {
        const internalGroup = response.body.find(
          group =>
            group.organisation &&
            group.organisation.id === DEFAULT_ORGANISATION_ID &&
            group.isInternal
        )
        internalGroupId = internalGroup && internalGroup.id
        body = {
          usernames: [
            faker.internet.email().toLowerCase(),
            faker.internet.email().toLowerCase(),
          ],
          enabled: true,
          isExternal: false,
          roles: ['ROLE_USER'],
          group: internalGroupId,
        }
      })
      createUser('', true, true, { roles: ['ROLE_ORG_ADMIN'] }).then(
        user => (orgAdmin = user)
      )
    })
    it('allows me to bulk add users', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'POST',
        body: body,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body.createdUsers.length).to.eq(2)
        expect(response.body.errors.length).to.eq(0)
      })
    })
    it('doesnt let me add the same users twices', () => {
      cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'POST',
        body: body,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body.createdUsers.length).to.eq(0)
        expect(response.body.errors.length).to.eq(2)
      })
    })
  })
  describe('as a orgadmin', () => {
    before(() => {
      body = {
        usernames: [
          faker.internet.email().toLowerCase(),
          faker.internet.email().toLowerCase(),
        ],
        enabled: true,
        isExternal: false,
        roles: ['ROLE_USER'],
        group: internalGroupId,
      }
      cy.login(orgAdmin.username)
    })
    it('allows me to bulk add users', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'POST',
        body: body,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body.createdUsers.length).to.eq(2)
        expect(response.body.errors.length).to.eq(0)
      })
    })
    it('doesnt let me add the same users twices', () => {
      cy.login(orgAdmin.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'POST',
        body: body,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body.createdUsers.length).to.eq(0)
        expect(response.body.errors.length).to.eq(2)
      })
    })
  })

  describe('as a standard user', () => {
    before(() => {
      body = {
        usernames: [
          faker.internet.email().toLowerCase(),
          faker.internet.email().toLowerCase(),
        ],
        enabled: true,
        isExternal: false,
        roles: ['ROLE_USER'],
      }
      cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
    })
    it('allows me to bulk add users', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'POST',
        body: body,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('doesnt let me add the same users twices', () => {
      cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'POST',
        body: body,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
