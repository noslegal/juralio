import { createUser } from '../../../../helpers/users/user_api_helper'

describe('navigation_via_logo.cy', () => {
  let user
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
    })
  })
  describe('navigate to home', () => {
    before(() => {
      cy.login(user.username)
      cy.visit('/#/templates/')
    })

    describe('When the juralio icon is clicked', () => {
      before(() => {
        cy.get('[data-test=home]').click()
      })

      it('should navigate to the home page', () => {
        cy.url().should('contains', '/home')
      })
    })
  })
})
