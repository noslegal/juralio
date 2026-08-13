import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('sysadmin_table_display_spec', () => {
  let user1, user2
  const visitHelpers = new VisitHelpers()
  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    createUser('', true, false, { roles: ['ROLE_SYSADMIN'] }).then(u => {
      user1 = u
    })
    createUser('', true, false, { roles: ['ROLE_SYSADMIN'] }).then(u => {
      user2 = u
    })
  })
  describe('when viewing the sysadmin table', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      visitHelpers.visitHome(false)
      cy.get('[data-test=sysadmin-management]', { timeout: 30000 }).click()
    })
    it('should show all sysadmins', () => {
      cy.get('[data-test=user-list-item]').should('have.length', 3)
    })
    describe('when viewing myself', () => {
      before(() => {
        cy.get('[data-test=search-button]').click()
        cy.get('[data-test=Search]')
          .clear()
          .type('sysadmin@juralio.com', { delay: 5 })
        cy.wait(5000)
      })
      it('should not let me disable myself', () => {
        cy.get('[data-test=ArrowDropDownIcon]').should('not.exist')
      })
      describe('when viewing myself', () => {
        before(() => {
          cy.get('[data-test=search-button]').click()
          cy.get('[data-test=Search]')
            .clear()
            .type(user1.username, { delay: 5 })
          cy.wait(5000)
        })
        it('should not let me disable myself', () => {
          cy.get('[data-test=ArrowDropDownIcon]').should('not.exist')
        })
        describe('when editing another sysadmin', () => {
          before(() => {
            cy.get('[data-test=user-list-item]').eq(0).click(0, 0)
            cy.get('[data-test=first-name-field]')
              .find('input')
              .type('{selectAll}{backspace}first')
            cy.get('[data-test=last-name-field]')
              .find('input')
              .type('{selectAll}{backspace}last')
            cy.get('[data-test=action-dialog-button]').click()
            cy.wait(5000)
            cy.get('[data-test=user-list-item]').eq(0).click(0, 0)
          })
          it('should allow for all updates', () => {
            cy.get('[data-test=convert-to-juralio]')
              .find('input')
              .should('not.be.disabled')
            cy.get('[data-test=first-name-field]')
              .find('input')
              .should('have.value', 'first')
            cy.get('[data-test=last-name-field]')
              .find('input')
              .should('have.value', 'last')
          })
        })
      })
    })
  })
})
