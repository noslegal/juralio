import HttpStatus from 'http-status-codes'
import {
  createUser,
  DEFAULT_ORGANISATION_ID,
} from '../../../../../helpers/users/user_api_helper'

describe('sa_get_view_organisation.cy', () => {
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

  let standardUser

  before(() => {
    createUser('Dummy user1', undefined, true, {
      roles: ['ROLE_USER'],
    })
    createUser('Dummy user', undefined, true, {
      roles: ['ROLE_USER'],
    }).then(user => {
      standardUser = user
    })
  })

  const URL = `organisations/${DEFAULT_ORGANISATION_ID}/users`

  describe('when trying to list a certain organisation', () => {
    describe('when signed in as a standard user', () => {
      before(() => {
        cy.login(standardUser.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })

  describe('when trying to list a certain organisation', () => {
    describe('when signed in as a sysadmin', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })
})
