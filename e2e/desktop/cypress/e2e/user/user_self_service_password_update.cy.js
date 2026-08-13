import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

let user
let visitHelpers = new VisitHelpers()
describe('user_self_service_password_update.cy', () => {
  before(() => {
    createUser('', true).then(createdUser => {
      user = createdUser
    })
  })
  describe('when visiting the password update page', () => {
    before(() => {
      cy.login(user)
      visitHelpers.visitPersonalSettings()
    })

    describe('when visiting for the first time', () => {
      before(() => {
        cy.get('[data-test=password]').click()
      })
      it('should have the submit disabled', () => {
        cy.get('[data-test=password-submit-button]').should('be.disabled')
      })
    })
    describe('when entering a bad current password', () => {
      before(() => {
        cy.get('[data-test=old-password-input]')
          .find('input')
          .clear()
          .type('bad current password')
        cy.get('[data-test=new-password-input]')
          .find('input')
          .clear()
          .type('invalid')
        cy.get('[data-test=verify-new-password-input]')
          .find('input')
          .clear()
          .type('invalid')
        cy.get('[data-test=password-submit-button]').click()
      })
      it('should tell your existing password is incorrect', () => {
        cy.get('[data-test=validation-message]').should(
          'have.text',
          'Current password incorrect'
        )
      })
      describe('when submitting an invalid new password', () => {
        before(() => {
          cy.get('[data-test=old-password-input]')
            .find('input')
            .clear()
            .type(Cypress.env('defaultPassword'))
          cy.get('[data-test=password-submit-button]').click()
        })
        it('should tell the user the new password is invalid', () => {
          cy.get('[data-test=validation-message]').should(
            'have.text',
            'Passwords must have at least 15 characters and contain at least one of each of the following: upper case letters, lower case letters, numbers and symbols.'
          )
        })
      })

      describe('when changing', () => {
        before(() => {
          cy.get('[data-test=userSettings]').click()
          cy.get('[data-test=password]').click()
        })
        it('should clear the validation', () => {
          cy.get('[data-test=validation-message]').should('not.exist')
        })
        describe('when the new passwords dont match', () => {
          before(() => {
            cy.get('[data-test=old-password-input]')
              .find('input')
              .clear()
              .type(Cypress.env('defaultPassword'))
            cy.get('[data-test=new-password-input]')
              .find('input')
              .clear()
              .type('ValidNewPassword1!')
            cy.get('[data-test=verify-new-password-input]')
              .find('input')
              .clear()
              .type('does not match')
            cy.get('[data-test=password-submit-button]').click()
          })
          it('should tell the user the new passwords dont match', () => {
            cy.get('[data-test=validation-message]').should(
              'have.text',
              'Passwords do not match'
            )
          })
          describe('whe nthe update is valid', () => {
            before(() => {
              cy.get('[data-test=verify-new-password-input]')
                .find('input')
                .clear()
                .type('ValidNewPassword1!')
              cy.get('[data-test=password-submit-button]').click()
            })
            it('should log the user out', () => {
              cy.wait(5000)
              cy.url().should('eq', 'http://localhost:8080/#/login')
            })
          })
        })
      })
    })
  })
})
