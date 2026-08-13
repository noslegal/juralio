import { loginViaUI } from '../../../../helpers/login/mfa_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('login_no_organisation.cy', () => {
  let userWithoutAnOrg

  before(() => {
    createUser(undefined, true, false).then(u => {
      userWithoutAnOrg = u
    })
  })

  describe('when submitting an invalid password', () => {
    before(() => {
      loginViaUI(userWithoutAnOrg.username, 'badPassword')
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

  describe('when submitting a valid password', () => {
    before(() => {
      loginViaUI(userWithoutAnOrg.username)
    })

    it('the user should remain on the login page', () => {
      cy.url().should('contain', '/#/login')
    })

    it('the message should read "This account is not associated with an organisation. Please contact your organisation administrator."', () => {
      cy.get(
        '[data-test="validation-box"] [data-test="validation-message"]'
      ).contains(
        'This account is not associated with an organisation. Please contact your organisation administrator.'
      )
    })
  })
})
