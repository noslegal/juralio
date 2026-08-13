import * as R from 'ramda'
import { loginViaUI } from '../../../../helpers/login/mfa_helpers'
import { createUser, getUsers } from '../../../../helpers/users/user_api_helper'

const MAX_LOGIN_ATTEMPTS = 5

const login = (password = Cypress.env('defaultPassword')) =>
  cy.request({
    url: `${Cypress.env('serverBaseUrl')}/login`,
    method: 'POST',
    body: {
      username: getUsers(0).username,
      password,
    },
    failOnStatusCode: false,
  })

describe('login_locked.cy', () => {
  before(() => {
    createUser()
  })

  describe('on locking user', () => {
    before(() => {
      R.times(() => {
        login('wrong')
      }, MAX_LOGIN_ATTEMPTS)
    })

    it('should return locked with correct password', () => {
      login('Password2Password2$')
        .its('body')
        .then(body => {
          expect(body.reason).to.equal('LOCKED')
        })
    })

    it('should return locked with the wrong password', () => {
      login('wrong')
        .its('body')
        .then(body => {
          expect(body.reason).to.equal('LOCKED')
        })
    })

    describe('on logging in a locked user via the UI', () => {
      before(() => {
        loginViaUI(getUsers(0).username, 'wrong')
      })
      it('should display correct message', () => {
        cy.get(
          '[data-test="validation-box"] [data-test="validation-message"]'
        ).contains(
          /Too many failed login attempts.\s*Please try again after 10 minutes/
        )
      })
    })
  })
})
