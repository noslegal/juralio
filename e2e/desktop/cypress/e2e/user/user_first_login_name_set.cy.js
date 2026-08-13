import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

let user
let userDataTest
const visitHelpers = new VisitHelpers()

describe('user_first_login_name_set.cy', () => {
  before(() => {
    createUser('', true, true, {}, false, false, true, true).then(
      createdUser => {
        user = createdUser
        userDataTest = `${user.firstName}-${user.lastName}`
      }
    )
  })
  describe('when visiting the user settings', () => {
    before(() => {
      cy.login(user)
      visitHelpers.visitHome()
    })
    it('should show the name ftue', () => {
      cy.get('[data-test=home-ftue]').should('exist')
    })
    describe('when entering a first name', () => {
      before(() => {
        cy.get('[data-test=first-name-field]')
          .find('input')
          .type('mockfirstname')
      })
      it('should still disable the save button', () => {
        cy.get('[data-test=next-ftue-card]').should('not.exist')
      })
      describe('when entering a last name', () => {
        before(() => {
          cy.get('[data-test=last-name-field]')
            .find('input')
            .type('mocklastname')
          cy.get('[data-test=submit-names]').click()
        })
        it('should enable the save button', () => {
          cy.get('[data-test=next-ftue-card]').should('be.visible')
        })
        describe('when setting a name', () => {
          before(() => {
            cy.get('[data-test=next-ftue-card]').click()
            cy.get('body').type('{esc}')

            cy.backendRoute('PATCH', '/settings/user/updateftue').as('ftueupdate')
            cy.get('[data-test=ftueSkipButton]').click()
            cy.wait('@ftueupdate')
          })
          it('should update the avatar', () => {
            cy.get('[data-test=dialog-header-title-text]').should('not.exist')
            cy.get('[data-test=user-avatar]')
              .get('[data-test=mockfirstname-mocklastname]')
              .should('exist')
          })
          describe('when logging in for a second time', () => {
            before(() => {
              cy.logoutServerSide()
              cy.wait(3000)
              cy.login(user)
              visitHelpers.visitHome()
            })
            it('should not show the dialog', () => {
              cy.get('[data-test=home-ftue]').should('not.exist')
              cy.get('[data-test=user-avatar]')
                .get('[data-test=mockfirstname-mocklastname]')
                .should('exist')
            })
          })
        })
      })
    })
  })
})
