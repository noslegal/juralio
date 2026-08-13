import HttpStatus from 'http-status-codes'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('user_password_change_self_service.cy', () => {
  let thirdUser
  const USERS = {
    ADMIN_USER: {
      username: 'sysadmin@juralio.com',
      password: 'Password1Password1$',
    },
    STANDARD_USER: {
      username: 'matter.creator@juralio.com',
      password: 'Password2Password2$',
    },
  }
  const passwordResetUrl = `${Cypress.env('serverBaseUrl')}/user/password`

  before(() => {
    createUser('', true)
    createUser('', true).then(createdUser => {
      thirdUser = createdUser
    })
  })
  describe('when trying to udate another users password', () => {
    before(() => {
      cy.login(USERS.STANDARD_USER.username)
    })
    it('should respond with UNAUTHORIZED', () => {
      cy.apiSpecRequest({
        url: passwordResetUrl,
        method: 'POST',
        body: {
          username: thirdUser.username,
          oldPassword: 'unknown',
          newPassword: 'unknown',
          newPasswordRepeat: 'unknown',
          context: 'selfService',
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
      })
    })
    describe('when changing your own password', () => {
      before(() => {
        cy.login(thirdUser.username)
      })
      it('should respond with OK', () => {
        cy.login(thirdUser)
        cy.apiSpecRequest({
          url: passwordResetUrl,
          method: 'POST',
          body: {
            username: thirdUser.username,
            oldPassword: Cypress.env('defaultPassword'),
            newPassword: 'newPassword1Password1$',
            newPasswordRepeat: 'newPassword1Password1$',
            context: 'selfService',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })
  describe('when attempting verbs on the endpoint', () => {
    const verbs = ['GET', 'PUT', 'PATCH', 'DELETE']
    verbs.forEach(verb =>
      it(`should return UNAUTHORIZED status for ${verb}`, () => {
        cy.apiSpecRequest({
          url: passwordResetUrl,
          method: verb,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
    )
  })
})
