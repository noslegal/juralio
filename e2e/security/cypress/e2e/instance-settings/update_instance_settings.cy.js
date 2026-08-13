import HttpStatus from 'http-status-codes'
import { createUser } from '../../../../helpers/users/user_api_helper'

const url = `${Cypress.env('serverRootBaseUrl')}/api/admin/instance/settings`

describe('update_instance_settings.cy', () => {
  describe('when logged in as a regular user', () => {
    let user
    before(() => {
      createUser().then(createdUser => {
        user = createdUser
      })
    })

    describe('when attempting GET on the endpoint', () => {
      const verbs = ['GET']
      verbs.forEach(verb =>
        it(`should return FORBIDDEN status for ${verb}`, () => {
          cy.apiSpecRequest({
            url,
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      )
    })
    describe('when attempting other verbs on the endpoint', () => {
      const verbs = ['POST', 'PUT', 'PATCH', 'DELETE']
      verbs.forEach(verb =>
        it(`should return UNAUTHORIZED status for ${verb}`, () => {
          cy.apiSpecRequest({
            url,
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
          })
        })
      )
    })
  })

  describe('when not logged in', () => {
    describe('when attempting verbs on the endpoint', () => {
      const verbs = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
      verbs.forEach(verb =>
        it(`should return UNAUTHORIZED status for ${verb}`, () => {
          cy.apiSpecRequest({
            url,
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
          })
        })
      )
    })
  })

  describe('when logged in as sys admin', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
    })
    describe('when attempting PATCH on the endpoint', () => {
      const verbs = ['PATCH']
      verbs.forEach(verb =>
        it(`should return OK status for ${verb}`, () => {
          cy.apiSpecRequest({
            url,
            method: verb,
            body: {
              microsoftSsoEnabled: true,
            },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
      )
    })
    describe('when attempting verbs on the endpoint', () => {
      const verbs = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
      verbs.forEach(verb =>
        it(`should return UNAUTHORIZED status for ${verb}`, () => {
          cy.apiSpecRequest({
            url,
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
          })
        })
      )
    })
  })
})
