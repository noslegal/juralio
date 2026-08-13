//new user
///password reset

import { createUser } from '../../../../../helpers/users/user_api_helper'

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

describe('magic_link.cy', () => {
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
  describe('when using the magic link after a password reset', () => {
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
  describe('when using the magic link to log in for the first time', () => {
    before(() => {
      magic_link = encode(newUser.username, newUser.temporaryPassword.password)
      cy.clearUserSession()
      cy.visit(`/#/login?magic_link=${magic_link}`)
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
})
