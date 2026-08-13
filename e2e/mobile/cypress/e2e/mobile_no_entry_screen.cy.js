import { createUser } from '../../../helpers/users/user_api_helper'

describe('mobile_home.cy', () => {
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

    it('should show them the no mobile spash screen', () => {
      cy.url().should('contains', '/home')
      cy.get('[data-test=mobile-visit-screen]').should('be.visible')
    })
  })
})
