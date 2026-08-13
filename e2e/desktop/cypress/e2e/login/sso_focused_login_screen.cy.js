//enable
//disable
import { createUser } from '../../../../helpers/users/user_api_helper'

//when enabled
//shows sso by default
//cna access unsername login
//can access sso from username
//can username login
describe('sso_focused_login_screen', () => {
  let user
  before(() => {
    user = createUser('', true, true)
  })
  describe('when the sso option is disabled', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: 'http://localhost:8080/api/admin/instance/settings',
        method: 'PATCH',
        body: {
          emphasiseSsoLogin: false,
          microsoftSsoEnabled: true,
          oktaSsoEnabled: true,
          googleSsoEnabled: true,
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
        cy.clearUserSession()
        cy.wait(2000)
        cy.visit('/#/login')
        cy.wait(2000)
      })
    })
    it('should show the default login screen', () => {
      cy.get('[data-test="username-input"]', { timeout: 10000 }).should('exist')
      cy.get('[data-test="password-input"]').should('exist')
    })
    it('should not show the sso switch option', () => {
      cy.get('[data-test=back-to-sso-link]').should('not.exist')
    })
  })
  describe('when the sso option is enabled', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: 'http://localhost:8080/api/admin/instance/settings',
        method: 'PATCH',
        body: {
          emphasiseSsoLogin: true,
          microsoftSsoEnabled: true,
          oktaSsoEnabled: true,
          googleSsoEnabled: true,
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
        cy.clearUserSession()
        cy.wait(2000)
        cy.visit('/#/login')
        cy.wait(2000)
      })
    })
    it('should not show the default login screen', () => {
      cy.get('[data-test="username-input"]', { timeout: 10000 }).should(
        'not.exist'
      )
      cy.get('[data-test="password-input"]').should('not.exist')
    })
    it('should  show the sso switch option', () => {
      cy.get('[data-test=use-password-to-sign-in]').should('exist')
    })
    describe('when clicking the sswitch', () => {
      before(() => {
        cy.get('[data-test=use-password-to-sign-in]').click()
      })
      it('should show the default login screen', () => {
        cy.get('[data-test="username-input"]', { timeout: 10000 }).should(
          'exist'
        )
        cy.get('[data-test="password-input"]').should('exist')
      })
      it('should show the sso switch option', () => {
        cy.get('[data-test=back-to-sso-link]').should('exist')
      })
    })
  })
})
