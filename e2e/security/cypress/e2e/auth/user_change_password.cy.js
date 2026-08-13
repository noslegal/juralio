import HttpStatus from 'http-status-codes'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('user_change_password.cy', () => {
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
  const LOCKED_AFTER_ATTEMPTS = 5
  const TEMP_PASSWORD = 'tempPassword1Password1$'
  const NEW_PASSWORD = 'NEWPassword1Password1$'
  let RESET_PASSWORD_LINK
  const INVALID_USER_ID = -666
  const INVALID_SYSADMIN_URL = `${Cypress.env(
    'serverBaseUrl'
  )}/settings/users/${INVALID_USER_ID}/password`

  before(() => {
    createUser().then(createdUser => {
      changeThisUsersPassword = createdUser
      RESET_PASSWORD_LINK = `${Cypress.env('serverBaseUrl')}/settings/users/${
        changeThisUsersPassword.id
      }/password`
    })
  })

  describe('when logged in as a standard user', () => {
    beforeEach(() => {
      cy.login(USERS.STANDARD_USER.username, USERS.STANDARD_USER.password)
    })

    describe('when trying to change the password', () => {
      describe('of a non user', () => {
        it('should return FORBIDDEN', () => {
          cy.apiSpecRequest({
            url: INVALID_SYSADMIN_URL,
            method: 'PATCH',
            body: { id: INVALID_USER_ID, password: TEMP_PASSWORD },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
      describe('of an existing user', () => {
        it('should return FORBIDDEN', () => {
          cy.apiSpecRequest({
            url: RESET_PASSWORD_LINK,
            method: 'PATCH',
            body: {
              password: TEMP_PASSWORD,
            },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })

  describe('when a full user change flow is performed', () => {
    let temporaryPassword

    describe('When the user tries to login with new temporary password', () => {
      before(() => {
        cy.login(USERS.ADMIN_USER.username, USERS.ADMIN_USER.password)
        cy.request({
          url: RESET_PASSWORD_LINK,
          method: 'GET',
        }).then(response => (temporaryPassword = response.body.password))
        cy.clearUserSession()
      })

      it('should return UNAUTHORIZED', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/login`,
          method: 'POST',
          body: {
            username: changeThisUsersPassword.username,
            password: temporaryPassword,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })

      describe('when the user changes their own password via the password reset endpoint', () => {
        describe('with an incorrect oldPassword', () => {
          it('should return UNAUTHORIZED', () => {
            cy.apiSpecRequest({
              url: `${Cypress.env('serverBaseUrl')}/settings/user/password`,
              method: 'POST',
              body: {
                username: changeThisUsersPassword.username,
                oldPassword: 'WRONG_Password1Password1$',
                newPassword: 'NEWPassword1Password1$',
                newPasswordRepeat: 'NEWPassword1Password1$',
              },
            }).then(response => {
              expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
            })
          })
        })

        describe('with the correct oldPassword', () => {
          it('should return OK', () => {
            cy.apiSpecRequest({
              url: `${Cypress.env('serverBaseUrl')}/settings/user/password`,
              method: 'POST',
              body: {
                username: changeThisUsersPassword.username,
                oldPassword: temporaryPassword,
                newPassword: NEW_PASSWORD,
                newPasswordRepeat: NEW_PASSWORD,
              },
            }).then(response => {
              expect(response.status).to.eq(HttpStatus.OK)
            })
          })
        })
      })

      describe('when the user tries to authenticate with their new password', () => {
        it('should return OK', () => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/login`,
            method: 'POST',
            body: {
              username: changeThisUsersPassword.username,
              password: NEW_PASSWORD,
            },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
      })
    })
  })

  describe('when a user in password expired state', () => {
    before(() => {
      cy.login(USERS.ADMIN_USER.username, USERS.ADMIN_USER.password)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${RESET_PASSWORD_LINK}`,
        method: 'PATCH',
        body: { id: changeThisUsersPassword.id, password: TEMP_PASSWORD },
      })
    })

    describe('logs in 5 times incorrectly', () => {
      before(() => {
        cy.clearUserSession()

        for (let i = 0; i < LOCKED_AFTER_ATTEMPTS; i++) {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/login`,
            method: 'POST',
            body: {
              username: changeThisUsersPassword.username,
              password: 'WRONG_PASSWORD!@£!@£',
            },
          })
        }
      })

      it('should return UNAUTHORIZED and LOCKED on 6th attempt', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/login`,
          method: 'POST',
          body: {
            username: changeThisUsersPassword.username,
            password: 'WRONG_PASSWORD!@£!@£',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
          expect(response.body.reason).to.eq('LOCKED')
        })
      })

      describe('when Sysadmin resets the user password', () => {
        let resetPasswordCode

        before(() => {
          cy.login('sysadmin@juralio.com', 'Password1Password1$')
          cy.wait(60000)
        })

        it('should return OK status', () => {
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
  })
})
