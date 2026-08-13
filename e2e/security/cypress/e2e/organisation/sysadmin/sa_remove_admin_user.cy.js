import HttpStatus from 'http-status-codes'
import {
  createUser,
  DEFAULT_ORGANISATION_ID,
} from '../../../../../helpers/users/user_api_helper'

describe('sa_remove_admin_user.cy', () => {
  const USER = {
    SYSADMIN_USER: {
      username: 'sysadmin@juralio.com',
      password: 'Password1Password1$',
    },
    STANDARD_USER: {
      username: 'matter.creator@juralio.com',
      password: 'Password2Password2$',
    },
  }

  let orgAdminUser, orgAdmin2

  before(() => {
    createUser(undefined, true, true, { roles: ['ROLE_ORG_ADMIN'] }).then(
      createdUser => {
        orgAdminUser = createdUser
        createUser(undefined, true, true, { roles: ['ROLE_ORG_ADMIN'] }).then(
          u2 => {
            orgAdmin2 = u2
          }
        )
      }
    )
  })

  const URL = `organisations/${DEFAULT_ORGANISATION_ID}/users`

  describe('when trying to remove an admin user from an organisation', () => {
    describe('when signed in as a standard user', () => {
      before(() => {
        cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'DELETE',
          body: {
            username: orgAdminUser.username,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })

  describe('when trying to remove an admin user from an organisation', () => {
    describe('when signed in as a sysadmin', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'DELETE',
          body: {
            username: orgAdmin2.username,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })
})
