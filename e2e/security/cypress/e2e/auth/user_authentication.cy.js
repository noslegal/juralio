import HttpStatus from 'http-status-codes'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('user_authentication.cy', () => {
  const USERS = {
    VALID_USER: {
      username: '',
      password: 'Password2Password2$',
    },
    INVALID_USER: {
      username: 'ermaguuuhd@faker.com',
      password: 'not_a_v4l1d_pass',
    },
  }

  before(() => {
    createUser('', true).then(createdUser => {
      USERS.VALID_USER.username = createdUser.username
    })
  })

  const URL = 'login'
  const LOCKED_AFTER_ATTEMPTS = 5

  describe('when trying to authenticate', () => {
    describe('as a non valid user', () => {
      it('should return UNAUTHORIZED', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'POST',
          body: { ...USERS.INVALID_USER },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
    })

    describe('as a valid user', () => {
      it('should return UNAUTHORIZED', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'POST',
          body: { ...USERS.VALID_USER },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a valid user with no password', () => {
      it('should return 400 Bad Request', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'POST',
          body: { username: USERS.VALID_USER.username, password: '' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })

    describe('as no username, with password', () => {
      it('should return 400 Bad Request', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'POST',
          body: { username: '', password: USERS.VALID_USER.password },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })

    describe('as no credentials', () => {
      it('should return 400 Bad Request', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'POST',
          body: { username: '', password: '' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })
  })

  describe('when trying to authenticate', () => {
    describe('after 5 failed attempts', () => {
      before(() => {
        cy.clearUserSession()

        for (let i = 0; i < LOCKED_AFTER_ATTEMPTS; i++) {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/login`,
            method: 'POST',
            body: {
              username: USERS.VALID_USER.username,
              password: 'WRONG_PASSWORD!@£!@£',
            },
          })
        }
      })
      it('on the 6th attempt, return UNAUTHORIZED and LOCKED', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'POST',
          body: {
            username: USERS.VALID_USER.username,
            password: 'WRONG_PASSWORD!@£!@£',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
          expect(response.body.reason).to.eq('LOCKED')
        })
      })
    })
  })
})
