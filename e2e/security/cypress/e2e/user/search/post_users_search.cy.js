import HttpStatus from 'http-status-codes'
import {
    createOrganisation,
    sysadminAddUserToOrganisation
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('post_users_search.cy', () => {
  let userAOrg1, userBOrg1
  let userAOrg2, userBOrg2
  let organisation1, organisation2

  before(() => {
    createOrganisation('test1', false).then(organisation => {
      organisation2 = organisation
      createOrganisation('test2', false).then(organisation => {
        organisation1 = organisation

        createUser('Mr Ape-', undefined, false, {
          roles: ['ROLE_ORG_ADMIN'],
        }).then(createdUser => {
          userAOrg1 = createdUser
          createUser('Mr Yeti-', undefined, false, {
            roles: ['ROLE_ORG_ADMIN'],
          }).then(createdUser => {
            userBOrg1 = createdUser
            createUser('Mr Android-', undefined, false, {
              roles: ['ROLE_ORG_ADMIN'],
            }).then(createdUser => {
              userAOrg2 = createdUser
              createUser('Mr Robot-', undefined, false, {
                roles: ['ROLE_ORG_ADMIN'],
              }).then(createdUser => {
                userBOrg2 = createdUser

                sysadminAddUserToOrganisation(organisation1.body, userAOrg1)
                sysadminAddUserToOrganisation(organisation1.body, userBOrg1)
                sysadminAddUserToOrganisation(organisation2.body, userAOrg2)
                sysadminAddUserToOrganisation(organisation2.body, userBOrg2)
              })
            })
          })
        })
      })
    })
  })

  describe('as an Organisation 1 user', () => {
    it('should return OK status and the correct data', () => {
      cy.login(userAOrg1.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/users/search`,
        method: 'POST',
        body: { name: 'Mr' },
      }).then(response => {
        expect(response.body[0].firstname).contains('Mr Ape')
        expect(response.body[1].firstname).contains('Mr Yeti')
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should return OK status and no data when user is not found', () => {
      cy.login(userAOrg1.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/users/search`,
        method: 'POST',
        body: { name: 'userThatDoesntExist' },
      }).then(response => {
        expect(response.body.length).to.equal(0)
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should return OK status and no data when user is empty', () => {
      cy.login(userAOrg1.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/users/search`,
        method: 'POST',
        body: { name: null },
      }).then(response => {
        expect(response.body.length).to.equal(0)
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })

    describe('as an Organisation 1 user with non implemented verbs', () => {
      it('should return METHOD_NOT_ALLOWED status', () => {
        cy.login(userAOrg1.username)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/search`,
          method: 'GET',
          body: { name: 'e' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })
      it('should return METHOD_NOT_ALLOWED status', () => {
        cy.login(userAOrg1.username)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/search`,
          method: 'PATCH',
          body: { name: 'e' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })
      it('should return METHOD_NOT_ALLOWED status', () => {
        cy.login(userAOrg1.username)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/search`,
          method: 'DELETE',
          body: { name: 'e' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })
    })
  })

  describe('as an Organisation 2 user', () => {
    it('should return OK status and the correct data', () => {
      cy.login(userAOrg2.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/users/search`,
        method: 'POST',
        body: { name: 'Mr' },
      }).then(response => {
        expect(response.body[0].firstname).contains('Mr Android')
        expect(response.body[1].firstname).contains('Mr Robot')
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })
})
