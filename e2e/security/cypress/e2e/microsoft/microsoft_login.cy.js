import HttpStatus from 'http-status-codes'
import { createUser } from '../../../../helpers/users/user_api_helper'

const url = `${Cypress.env('serverRootBaseUrl')}/mslogin`

describe('microsoft_login.cy', () => {
  describe('when logged in as a regular user', () => {
    let user
    before(() => {
      createUser().then(createdUser => {
        user = createdUser
      })
    })

    describe('when attempting other verbs on the endpoint', () => {
      const verbs = ['GET']
      verbs.forEach(verb =>
        it(`should return error status for ${verb}`, () => {
          cy.login(user)
          cy.apiSpecRequest({
            url,
            method: verb,
          }).then(response => {
            expect(response.status).to.be.within(400, 499)
          })
        })
      )
    })

    describe('when attempting other verbs on the endpoint', () => {
      const verbs = ['POST', 'PUT', 'PATCH', 'DELETE']
      verbs.forEach(verb =>
        it(`should return METHOD_NOT_ALLOWED status for ${verb}`, () => {
          cy.apiSpecRequest({
            url,
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
        })
      )
    })
  })

  describe('when not logged in', () => {
    describe('when attempting other verbs on the endpoint', () => {
      const verbs = ['GET']
      verbs.forEach(verb =>
        it(`should return error status for ${verb}`, () => {
          cy.apiSpecRequest({
            url,
            method: verb,
          }).then(response => {
            expect(response.status).to.be.within(400, 499)
          })
        })
      )
    })
    describe('when attempting other verbs on the endpoint', () => {
      const verbs = ['POST', 'PUT', 'PATCH', 'DELETE']
      verbs.forEach(verb =>
        it(`should return METHOD_NOT_ALLOWED status for ${verb}`, () => {
          cy.apiSpecRequest({
            url,
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
        })
      )
    })
  })
})
