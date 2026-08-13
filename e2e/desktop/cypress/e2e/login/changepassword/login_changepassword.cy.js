import { loginViaUI } from '../../../../../helpers/login/mfa_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('login_changepassword.cy', () => {
  const Credentials = {
    NEW_PASSWORD: 'Password2Password2$Password2Password2$$',
  }
  let testUser

  describe('when login as a user who has just been created', () => {
    before(() => {
      createUser(undefined, false).then(user => {
        testUser = user
        loginViaUI(testUser.username, testUser.temporaryPassword.password)
      })
    })

    describe('he should go through the change password form which includes', () => {
      it('an information message texted as "Your password has expired and must be changed"', () => {
        cy.get('[data-test="password-change-info-message"]').contains(
          'Your password has expired and must be changed'
        )
      })

      it('an old password input component which has placeholder as "Old Password"', () => {
        cy.get('[data-test="old-password-input"]')
          .should('be.visible')
          .find('input')
          .should('have.attr', 'placeholder', 'Old password')
      })

      it('a new passowrd input component which has placeholder as "New Password"', () => {
        cy.get('[data-test="new-password-input"]')
          .should('be.visible')
          .find('input')
          .should('have.attr', 'placeholder', 'New password')
      })

      it('a new verify password input component which has placeholder as "Verify New Password"', () => {
        cy.get('[data-test="verify-new-password-input"]')
          .should('be.visible')
          .find('input')
          .should('have.attr', 'placeholder', 'Verify new password')
      })
    })

    describe('fill-in the old and new passwords then sign-in', () => {
      before(() => {
        cy.get('[data-test="old-password-input"]')
          .find('input')
          .type(testUser.temporaryPassword.password)
        cy.get('[data-test="new-password-input"]')
          .find('input')
          .type(Credentials.NEW_PASSWORD)
        cy.backendRoute('/user').as('getUser')
        cy.get('[data-test="verify-new-password-input"]')
          .find('input')
          .type(Credentials.NEW_PASSWORD)
          .type('{enter}')
        cy.wait('@getUser')
      })

      it('the user should be re-directed to the home page', () => {
        cy.url().should('contain', '/#/home')
      })
    })
  })
})
