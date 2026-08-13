import HttpStatus from 'http-status-codes'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('delete_organisation_users.cy', () => {
  let orgAdmin1, orgAdmin2, userToRemove, regularUser
  let organisation1, organisation2
  let usersUrl = `${Cypress.env('serverBaseUrl')}/users/`

  before(() => {
    createUser(undefined, undefined, false).then(createdUser => {
      userToRemove = createdUser

      createUser(undefined, undefined, false).then(createdUser => {
        regularUser = createdUser

        createOrganisation('ONE_ORG', false).then(organisation => {
          organisation1 = organisation

          createOrganisation('TWO_ORG', false).then(organisation => {
            organisation2 = organisation

            createUser('Mr Apple-', undefined, false, {
              roles: ['ROLE_ORG_ADMIN'],
            }).then(createdUser => {
              orgAdmin1 = createdUser

              createUser('Mr Android-', undefined, false, {
                roles: ['ROLE_ORG_ADMIN'],
              }).then(createdUser => {
                orgAdmin2 = createdUser

                sysadminAddUserToOrganisation(organisation1.body, orgAdmin1)
                sysadminAddUserToOrganisation(organisation1.body, userToRemove)
                sysadminAddUserToOrganisation(organisation1.body, regularUser)
                sysadminAddUserToOrganisation(organisation2.body, orgAdmin2)
              })
            })
          })
        })
      })
    })
  })

  describe('when logged in as a regular team member', () => {
    before(() => {
      cy.login(regularUser)
    })
    it('should NOT allow us to DELETE the user', () => {
      cy.apiSpecRequest({
        url: `${usersUrl}${userToRemove.id}`,
        method: 'DELETE',
        body: {},
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('when logged in as an org admin from a different org', () => {
    before(() => {
      cy.login(orgAdmin2)
    })
    it('should NOT allow us to DELETE the user', () => {
      cy.apiSpecRequest({
        url: `${usersUrl}${userToRemove.id}`,
        method: 'DELETE',
        body: {},
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })

  describe('when logged in as an org admin from the same org', () => {
    beforeEach(() => {
      cy.login(orgAdmin1)
    })
    it('should allow us to DELETE the never logged in user', () => {
      cy.apiSpecRequest({
        url: `${usersUrl}${userToRemove.id}`,
        method: 'DELETE',
        body: {},
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should NOT allow us to DELETE the previously logged in user', () => {
      cy.apiSpecRequest({
        url: `${usersUrl}${regularUser.id}`,
        method: 'DELETE',
        body: {},
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})
