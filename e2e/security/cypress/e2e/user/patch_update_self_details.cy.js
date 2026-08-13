import HttpStatus from 'http-status-codes'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('patch_update_self_details.cy', () => {
  const USER = {
    SYSADMIN_USER: {
      username: 'sysadmin@juralio.com',
      password: 'Password1Password1$',
      id: 12,
    },
    STANDARD_USER: {
      username: 'matter.creator@juralio.com',
      password: 'Password2Password2$',
      id: 14,
    },
  }

  let user

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      createUser(undefined, true, true, { roles: ['ROLE_ORG_ADMIN'] }).then(
        orgAdmin => {
          USER.ORG_ADMIN_USER = orgAdmin
        }
      )
    })
  })

  describe('when trying to update a your details', () => {
    describe('when signed in as a user', () => {
      before(() => {
        cy.login(user)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/user`,
          method: 'PATCH',
          body: {
            firstname: 'sick',
            lastname: 'cactus',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })

  describe('when trying to update your details', () => {
    describe('when signed in as a sysadmin', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/user`,
          method: 'PATCH',
          body: {
            firstname: 'sick',
            lastname: 'cactus',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })

  describe('when attempting other verbs on the endpoint NOT logged in', () => {
    const verbs = ['POST', 'PUT', 'GET', 'DELETE']
    verbs.forEach(verb => {
      it(`should return UNAUTHORIZED status for ${verb}`, () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/user`,
          method: verb,
          body: {
            firstname: 'sick',
            lastname: 'cactus',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
    })
  })
})
