import { loginViaUI } from '../../../../helpers/login/mfa_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('login_success.cy', () => {
  describe('when submitting valid log in credentials', () => {
    before(() => {
      createUser().then(user => {
        loginViaUI(user.username, Cypress.env('defaultPassword'))
      })
    })

    it('the user should be re-directed to the home page', () => {
      cy.url().should('contain', '/#/home')
    })
  })
})
