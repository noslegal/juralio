import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('user_forgot_password_reset.cy', () => {
  const visitHelpers = new VisitHelpers()
  let user
  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    createUser().then(u => {
      user = u
    })
  })
  describe('when forgot password ins enabled', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      visitHelpers.visitHome(false)
      cy.get('[data-test=instance-management]').click()
      cy.get('[data-test=forgot-password-switch]').click()
      cy.wait(5000)
      cy.logoutServerSide()
      cy.get('[data-test=accounts]').click()
    })
    it('should show the forgot password button', () => {
      cy.get('[data-test=forgot-your-password-link]').should('be.visible')
    })
    describe('when using the original password after resetting', () => {
      before(() => {
        cy.get('[data-test=forgot-your-password-link]').click()
        cy.get('[data-test=forgot-password-email-field]')
          .find('input')
          .type(user.username)
        cy.get('[data-test=submit-forgot-password]').click()
        cy.get('[data-test=back]', { timeout: 30000 }).click()
        cy.get('[data-test=username-input]').find('input').type(user.username)
        cy.get('[data-test=password-input]')
          .find('input')
          .type('Password2Password2$')
        cy.get('[data-test=password-submit-button]').click()
      })
      it('should allow the user to log in', () => {
        cy.url().should('contain', '/#/home')
      })
      describe('when trying to use the reset password after loggin in ', () => {
        before(() => {
          cy.logoutServerSide()
          visitHelpers.visitPersonalSettings()
        })
      })
    })
  })
})
