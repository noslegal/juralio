import HttpStatus from 'http-status-codes'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('get_todo.cy', () => {
  let testUser, secondUser
  let USER, URL, URL_SECOND_USER

  before(() => {
    createUser().then(createdUser => {
      secondUser = createdUser
    })
    createUser().then(createdUser => {
      testUser = createdUser
      USER = {
        STANDARD_USER: {
          username: testUser.username,
          password: 'Password2Password2$',
          id: testUser.id,
        },
      }
      URL = `user/${USER.STANDARD_USER.id}/todo`
      URL_SECOND_USER = `user/${secondUser.id}/todo`
    })
    cy.logoutServerSide()
  })

  describe('when trying to perform a todo search NOT signed in as an authenticated user', () => {
    it('should return UNAUTHORIZED status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
      })
    })
  })

  describe('when trying to perform a todo as an authenticated user accessing another users todos', () => {
    beforeEach(() => {
      cy.login(USER.STANDARD_USER.username)
    })
    it('should return FORBIDDEN status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL_SECOND_USER}`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('when trying to perform a todo as an authenticated user', () => {
    beforeEach(() => {
      cy.login(USER.STANDARD_USER.username)
    })

    it('should return OK status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should return METHOD_NOT_ALLOWED status for POST', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
    it('should return METHOD_NOT_ALLOWED status for PATCH', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'PATCH',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
    it('should return METHOD_NOT_ALLOWED status for DELETE', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
  })
})
