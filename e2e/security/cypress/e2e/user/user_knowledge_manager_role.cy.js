import HttpStatus from 'http-status-codes'
import { getUniqueEmailAddress } from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('user_knowledge_manager_role.cy', () => {
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

  before(() => {
    createUser(undefined, true, true, { roles: ['ROLE_ORG_ADMIN'] }).then(
      orgAdmin => {
        USER['ORG_ADMIN_USER'] = {
          username: orgAdmin.username,
          password: 'Password2Password2$',
        }
      }
    )
  })

  describe('when trying to create a user', () => {
    describe('when signed in as a standard user', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return CREATED status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users`,
          method: 'POST',
          body: {
            username: getUniqueEmailAddress(),
            firstname: 'john',
            lastname: 'smith',
            roles: ['ROLE_USER', 'ROLE_KNOWLEDGE_MANAGER'],
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.CREATED)
        })
      })
    })
  })
})
