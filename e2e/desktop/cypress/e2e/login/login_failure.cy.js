import { loginViaUI } from '../../../../helpers/login/mfa_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('login_failure.cy', () => {
  describe('when submitting invalid log in credentials', () => {
    before(() => {
      createUser().then(user => {
        loginViaUI(user.username, 'testPassword')
      })
    })

    it('the user should remain on the login page', () => {
      cy.url().should('contain', '/#/login')
    })

    it('the message should read "Incorrect username / password"', () => {
      cy.get(
        '[data-test="validation-box"] [data-test="validation-message"]'
      ).contains('Incorrect username / password')
    })
  })
})
