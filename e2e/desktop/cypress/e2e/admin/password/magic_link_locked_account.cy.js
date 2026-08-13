import { createUser } from '../../../../../helpers/users/user_api_helper'

const login = (username, password) =>
  cy.request({
    url: `${Cypress.env('serverBaseUrl')}/login`,
    method: 'POST',
    body: {
      username: username,
      password: password,
    },
    failOnStatusCode: false,
  })

const encode = (username, password) => {
  let date = new Date()
  date.setDate(date.getDate() + 1)
  const jsonObj = JSON.stringify({
    username: username,
    password: password,
    context: 'passwordReset',
    expiry: date.getTime(),
  })
  const base64Obj = btoa(jsonObj)
  return base64Obj
}
let newUser, magic_link, exisitng_user, temporaryPassword

describe('magic_link_locked_account.cy', () => {
  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    const url = `${Cypress.env(
      'serverRootBaseUrl'
    )}/api/admin/instance/settings`

    cy.apiSpecRequest({
      url,
      method: 'PATCH',
      body: {
        enablePaymentPlatformIntegration: false,
      },
    })
    createUser('', false).then(u => {
      newUser = u
      createUser().then(u2 => {
        exisitng_user = u2
      })
    })
  })
  describe('when using the magic link after a password reset when the account is locked', () => {
    before(() => {
      let RESET_PASSWORD_LINK = `${Cypress.env(
        'serverBaseUrl'
      )}/settings/users/${exisitng_user.id}/password`
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: RESET_PASSWORD_LINK,
        method: 'GET',
      }).then(response => {
        temporaryPassword = response.body.password
        cy.clearUserSession()
        magic_link = encode(exisitng_user.username, temporaryPassword)
        cy.clearUserSession()
        for (let i = 0; i < 10; i++) {
          login(exisitng_user.username, 'wrong!')
        }
        cy.visit(`/#/login?magic_link=${magic_link}`)
      })
    })
    it('should ask for a new password not the old password', () => {
      cy.get('input').should('have.length', 2)
    })
    describe('when entering a new password', () => {
      before(() => {
        cy.get('input').eq(0).type('Password2Password2$')
        cy.get('input').eq(1).type('Password2Password2$')
        cy.get('[data-test=password-submit-button]').click()
        cy.wait(5000)
      })
      it('should log the user in', () => {
        cy.get('[data-test=home-navigation]').should('be.visible')
      })
    })
  })
  describe('when using an old magic link while locked', () => {
    before(() => {
      cy.clearUserSession()
      for (let i = 0; i < 10; i++) {
        login(exisitng_user.username, 'wrong!')
      }
      cy.visit(`/#/login?magic_link=${magic_link}`)
    })
    it('should not allow the user to set a new password', () => {
      cy.get('[data-test=validation-message]').should('exist')
      cy.get('[data-test=validation-message]').should(
        'contain.text',
        'Link has already been used'
      )
    })
    describe('the account should  still be locked', () => {
      before(() => {
        cy.get('[data-test=username-input]').type(exisitng_user.username)
        cy.get('[data-test=password-input]').type(
          Cypress.env('defaultPassword')
        )
        cy.get('[data-test=password-submit-button]').click()
      })
      it('should still have a locked account', () => {
        cy.get('[data-test=validation-message]').should('exist')
        cy.get('[data-test=validation-message]').should(
          'contain.text',
          'Too many failed login attempts'
        )
        cy.get('[data-test=validation-message]').should(
          'contain.text',
          'Please try again after 10 minutes'
        )
      })
    })
  })
})
