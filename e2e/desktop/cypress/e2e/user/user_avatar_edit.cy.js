import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

let user
let visitHelpers = new VisitHelpers()
describe('user_avatar_edit.cy', () => {
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
    })
  })
  describe('when visiting the avatar edit page', () => {
    before(() => {
      cy.login(user)
      visitHelpers.visitPersonalSettings()
    })
    describe('when setting the avatar to initials', () => {
      before(() => {
        cy.get('[data-test=user-avatar]').eq(1).click()
        cy.get('[data-test=avatar-colour]').eq(0).click()
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(500)
      })

      describe('when changing the avatar colour', () => {
        before(() => {
          cy.get('[data-test=user-avatar]').eq(1).click()
          cy.get('[data-test=avatar-colour]').eq(1).click()
          cy.get('[data-test=action-dialog-button]').click()
        })
        it('should update the user avatar', () => {
          cy.get('[data-test=user-avatar]')
            .eq(1)
            .should('have.css', 'background-color')
            .and('eq', 'rgb(169, 191, 222)')
        })
        describe('when changing the avatar image', () => {
          before(() => {
            cy.get('[data-test=user-avatar]').eq(1).click()
            cy.get('[data-test=avatar-illustration]').eq(3).click()
            cy.get('[data-test=action-dialog-button]').click()
          })
          it('should update the user avatar', () => {
            cy.get(`[data-test=${user.firstname}-${user.lastname}]`)
              .eq(1)
              .should('have.css', 'background-image')
              .and('not.eq', 'url(undefined)')
          })
        })
      })
    })
  })
})
