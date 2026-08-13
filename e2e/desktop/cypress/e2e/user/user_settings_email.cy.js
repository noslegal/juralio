import faker from 'faker'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('user_settings_email.cy', () => {
  let standardUser, secondUser

  before(() => {
    createUser().then(user => (standardUser = user))
    createUser().then(user => (secondUser = user))
  })
  describe('when changing the user email with an existing one and saving', () => {
    before(() => {
      cy.login(standardUser)
      visitHelpers.visitPersonalSettings()
      cy.get('[data-test=email-field]')
        .find('input')
        .type(`{selectAll}{backspace}${secondUser.username}`)
      cy.get('[data-test=save-button]').click()
    })
    it('should show a password confirmation dialog', () => {
      cy.get('[data-test=confirm-password-field]').should('be.visible')
    })

    describe('when typing in the incorrect password', () => {
      before(() => {
        cy.get('[data-test=confirm-password-field]').type('incorrectPass')
      })
      it('should show an incorrect password message', () => {
        cy.get('[data-test=action-dialog-button]').click()
        cy.get('[data-test=snackbar-message]', { timeout: 10000 })
          .should('be.visible')
          .should('contain', 'Incorrect password, please try again.')
      })
    })

    describe('when submitting an empty password', () => {
      before(() => {
        cy.get('[data-test=save-button]').click()
      })
      it('should show an incorrect password message', () => {
        cy.get('[data-test=action-dialog-button]').click()
        cy.get('[data-test=snackbar-message]', { timeout: 10000 })
          .should('be.visible')
          .should('contain', 'Incorrect password, please try again.')
      })
    })

    describe('when submitting the correct password', () => {
      before(() => {
        cy.get('[data-test=save-button]').click()
        cy.get('[data-test=confirm-password-field]').type(
          Cypress.env('defaultPassword')
        )
      })
      it('should show an email already in use message', () => {
        cy.get('[data-test=action-dialog-button]').click()
        cy.get('[data-test=snackbar-message]', { timeout: 10000 })
          .should('be.visible')
          .should('contain', 'A user with this email address already exists.')
      })
    })

    describe('when using a new email and submitting the correct password', () => {
      before(() => {
        cy.get('[data-test=email-field]')
          .find('input')
          .type(`{selectAll}{backspace}${faker.internet.email().toLowerCase()}`)
        cy.get('[data-test=save-button]').click()
        cy.get('[data-test=confirm-password-field]').type(
          Cypress.env('defaultPassword')
        )
        cy.get('[data-test=action-dialog-button]').click()
      })
      it('should show a success message', () => {
        cy.get('[data-test=snackbar-message]', { timeout: 10000 })
          .should('be.visible')
          .should('contain', 'Account details updated successfully!')
      })
    })
  })
})
