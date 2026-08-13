import HttpStatus from 'http-status-codes'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('user_change_password_part_2', () => {
  let changeThisUsersPassword
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

  let RESET_PASSWORD_LINK

  before(() => {
    createUser().then(createdUser => {
      changeThisUsersPassword = createdUser
      RESET_PASSWORD_LINK = `${Cypress.env('serverBaseUrl')}/settings/users/${
        changeThisUsersPassword.id
      }/password`
    })
  })

  describe('when resetting a users password', () => {
    describe('when Sysadmin resets the user password', () => {
      let resetPasswordCode
      before(() => {
        cy.login('sysadmin@juralio.com', 'Password1Password1$')
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: RESET_PASSWORD_LINK,
          method: 'GET',
        }).then(response => {
          resetPasswordCode = response.body.password
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    it('should return OK status if trying to reset', () => {
      cy.apiSpecRequest({
        url: RESET_PASSWORD_LINK,
        method: 'GET',
      }).then(response => {
        resetPasswordCode = response.body.password
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })

    describe('when the user tries to authenticate with their new password', () => {
      it('should return UNAUTHORIZED with expired', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/login`,
          method: 'POST',
          body: {
            username: changeThisUsersPassword.username,
            password: resetPasswordCode,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
          expect(response.body.reason).to.eq('EXPIRED')
        })
      })
    })
  })
})
