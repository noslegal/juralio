import HttpStatus from 'http-status-codes'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('patch_update_inactive_user_account.cy', () => {
  const USER = {
    SYSADMIN_USER: {
      username: 'sysadmin@juralio.com',
      password: 'Password1Password1$',
    },
  }

  let disabledUser

  before(() => {
    cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
  })

  describe('when trying to update a users details', () => {
    before(() => {
      cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      createUser(undefined, false, false, { enabled: false }).then(
        createdUser => {
          disabledUser = createdUser
        }
      )
    })

    describe('when signed in as a SysAdmin user', () => {
      beforeEach(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return OK status for ROLE_ORG_ADMIN change', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/${disabledUser.id}`,
          method: 'PATCH',
          body: {
            roles: ['ROLE_ORG_ADMIN'],
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })

      it('should return OK status for ROLE_MATTER_CREATOR change', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/${disabledUser.id}`,
          method: 'PATCH',
          body: {
            roles: ['ROLE_MATTER_CREATOR'],
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })

      it('should return BAD_REQUEST status for ROLE_MATTER_ADMIN change', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/${disabledUser.id}`,
          method: 'PATCH',
          body: {
            roles: ['ROLE_MATTER_ADMIN'],
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })
  })
})
