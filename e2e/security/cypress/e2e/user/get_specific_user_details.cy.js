import HttpStatus from 'http-status-codes'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('get_specific_user_details.cy', () => {
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

  let user

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
    })
  })

  describe('when trying to list a users details', () => {
    describe('when signed in as a standard user', () => {
      before(() => {
        cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/${user.id}`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })

  describe('when trying to list a users details', () => {
    describe('when signed in as a sysadmin', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/${user.id}`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })
})
