import HttpStatus from 'http-status-codes'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('sa_whitelist_changes_spec', () => {
  let u1, whitelist

  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    cy.apiSpecRequest({
      url: `${Cypress.env('serverRootBaseUrl')}/api/admin/instance/settings`,
      method: 'PATCH',
      body: {
        enableUserConfirmation: true,
      },
    }).then(response => {
      expect(response.status).to.eq(HttpStatus.OK)
      createUser().then(u => {
        u1 = u
      })
    })
  })
  describe('when whitelisting a trialing user', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/instance/whitelist`,
        method: 'POST',
        body: { emails: [u1.username] },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        whitelist = response.body
      })
    })
    it('should whitelist the user', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        url: `${Cypress.env('serverRootBaseUrl')}/api/users/${u1.id}`,
        method: 'GET',
        body: {
          enableUserConfirmation: true,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body.confirmationStatus).to.eq('whitelisted')
      })
    })
  })
  describe('when a whilelist user is removed', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/instance/whitelist/${
          whitelist[0].id
        }`,
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.NO_CONTENT)
      })
    })
    it('should set the user to trialing', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        url: `${Cypress.env('serverRootBaseUrl')}/api/users/${u1.id}`,
        method: 'GET',
        body: {
          enableUserConfirmation: true,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body.confirmationStatus).to.eq('trialing')
      })
    })
  })
  describe('when a confirmed user is whitelisted', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')

      cy.apiSpecRequest({
        url: `${Cypress.env('serverRootBaseUrl')}/api/users/${u1.id}`,
        method: 'PATCH',
        body: {
          confirmationStatus: 'confirmed',
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        cy.login('sysadmin@juralio.com', 'Password1Password1$')
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/admin/instance/whitelist`,
          method: 'POST',
          body: { emails: [u1.username] },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
          whitelist = response.body
        })
      })
    })
    it('should whitelist the user', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        url: `${Cypress.env('serverRootBaseUrl')}/api/users/${u1.id}`,
        method: 'GET',
        body: {
          enableUserConfirmation: true,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body.confirmationStatus).to.eq('whitelisted')
      })
    })
  })
})
