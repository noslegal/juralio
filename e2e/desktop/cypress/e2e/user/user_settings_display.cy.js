import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

let user
const visitHelpers = new VisitHelpers()

describe('user_settings_display.cy', () => {
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
    })
  })
  describe('when visiting the user settings', () => {
    before(() => {
      cy.login(user)
      visitHelpers.visitHome()
      visitHelpers.visitPersonalSettings()
    })
    it('should show the users current details', () => {
      cy.get('[data-test=first-name-field]')
        .find('input')
        .should('have.value', user.firstname)
      cy.get('[data-test=last-name-field]')
        .find('input')
        .should('have.value', user.lastname)
      cy.get('[data-test=email-field]')
        .find('input')
        .should('have.value', user.username)
      cy.get('[data-test=org-field]')
        .find('input')
        .should('have.value', 'Juralio')
    })
    describe('when clearing the firstname', () => {
      before(() => {
        cy.get('[data-test=first-name-field]').find('input').clear()
      })
      it('should disable the save button and show an error', () => {
        cy.get('[data-test=first-name-field]')
          .find('input')
          .should('have.value', '')
        cy.get('[data-test=save-button]').should('have.attr', 'disabled')
      })
    })
    describe('when clearing the lastname', () => {
      before(() => {
        cy.get('[data-test=last-name-field]').find('input').clear()
      })
      it('should disable the save button and show an error', () => {
        cy.get('[data-test=last-name-field]')
          .find('input')
          .should('have.value', '')
        cy.get('[data-test=save-button]').should('have.attr', 'disabled')
      })
    })
    describe('when clearing the email', () => {
      before(() => {
        cy.get('[data-test=email-field]').find('input').clear()
      })
      it('should disable the save button and show an error', () => {
        cy.get('[data-test=email-field]').find('input').should('have.value', '')
        cy.get('[data-test=save-button]').should('have.attr', 'disabled')
      })
    })
    describe('when restoring the firstname, lastname and email', () => {
      before(() => {
        cy.get('[data-test=first-name-field]')
          .find('input')
          .type(user.firstname)
        cy.get('[data-test=last-name-field]').find('input').type(user.lastname)
        cy.get('[data-test=email-field]').find('input').type(user.username)
      })
      it('should disable the save button', () => {
        cy.get('[data-test=save-button]').should('have.attr', 'disabled')
      })
    })
    describe('when updating the email with an invalid value', () => {
      before(() => {
        cy.get('[data-test=email-field]').find('input').type('1')
      })
      it('should disable the save button', () => {
        cy.get('[data-test=save-button]').should('have.attr', 'disabled')
      })
    })
    describe('when updating the email with a valid value', () => {
      before(() => {
        cy.get('[data-test=email-field]')
          .find('input')
          .type('{selectAll}{backspace}testemail@juralio.com')
      })
      it('should enable the save name', () => {
        cy.get('[data-test=save-button]').should('not.have.attr', 'disabled')
        cy.get('[data-test=email-field]')
          .find('input')
          .type(`{selectAll}{backspace}${user.username}`)
      })
    })
    describe('when updating the firstname', () => {
      before(() => {
        cy.get('[data-test=first-name-field]').find('input').type('1')
      })
      it('should enable the save name', () => {
        cy.get('[data-test=save-button]').should('not.have.attr', 'disabled')
      })
    })
    describe('when saving  the new firstname', () => {
      before(() => {
        cy.get('[data-test=save-button]').click()
      })
      it('should disalbe the save name and keep the updated value', () => {
        cy.get('[data-test=save-button]').should('have.attr', 'disabled')
        cy.get('[data-test=first-name-field]')
          .find('input')
          .should('have.value', user.firstname + '1')
        cy.get('[data-test=last-name-field]')
          .find('input')
          .should('have.value', user.lastname)
      })
    })
    describe('when updating the lastname', () => {
      before(() => {
        cy.get('[data-test=last-name-field]').find('input').type('1')
      })
      it('should enable the save name', () => {
        cy.get('[data-test=save-button]').should('not.have.attr', 'disabled')
      })
    })
    describe('when saving  the new lastname', () => {
      before(() => {
        cy.get('[data-test=save-button]').click()
      })
      it('should disalbe the save name and keep the updated value', () => {
        cy.get('[data-test=save-button]').should('have.attr', 'disabled')
        cy.get('[data-test=first-name-field]')
          .find('input')
          .should('have.value', user.firstname + '1')
        cy.get('[data-test=last-name-field]')
          .find('input')
          .should('have.value', user.lastname + '1')
      })
    })
  })
})
