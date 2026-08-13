import HttpStatus from 'http-status-codes'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('create_matter.cy', () => {
  let user

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
    })
  })

  describe('when trying to create a new matter', () => {
    describe('as a MATTER CREATOR', () => {
      beforeEach(() => {
        cy.login('matter.creator@juralio.com', 'Password2Password2$')
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matters`,
          method: 'POST',
          body: {
            clientName: 'new client',
            name: 'new matter',
            userDefinedReferenceNumber: '1984',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when trying to create a new matter', () => {
      describe('when not a MATTER CREATOR ', () => {
        before(() => {
          cy.login(user.username)
        })

        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matters`,
            method: 'POST',
            body: {
              clientName: 'new client',
              name: 'new matter',
            },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })
})
