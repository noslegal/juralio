import { createUser } from '../../../../helpers/users/user_api_helper'

describe('desktop_navigation.cy', () => {
  let user

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
    })
  })

  describe('when a user navigates to "/home"', () => {
    before(() => {
      cy.login(user.username)

      cy.visit('/#/home')
    })

    describe('when the navigation is visible', () => {
      it('icon is visible', () => {
        cy.get('[data-test=home-navigation]').should('be.visible')
      })

      it('user avatar is visible', () => {
        cy.get('[data-test=user-avatar]').should('be.visible')
      })

      it('icon is visible', () => {
        cy.get('[data-test=user-header-navigation-button]').click()
        cy.get('[data-test=user-header-logout-menu-button]').should(
          'be.visible'
        )
        cy.get('[data-test=user-header-help-menu-button]').should('be.visible')
      })

      it('should show the users details', () => {
        cy.get('[data-test=user-header-user-info-section]').should(
          'contain.text',
          user.firstname
        )
        cy.get('[data-test=user-header-user-info-section]').should(
          'contain.text',
          user.lastname
        )
      })
    })
  })
})
