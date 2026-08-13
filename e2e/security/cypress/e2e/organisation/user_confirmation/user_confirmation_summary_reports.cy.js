import HttpStatus from 'http-status-codes'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('user_confirmation_summary_reports.cy', () => {
  let userOrg1, userOrg2, userToAddAndRemove, user2Org1
  let organisation1, organisation2
  let org1UsersUrl, org2UsersUrl

  before(() => {
    createUser(undefined, undefined, false).then(createdUser => {
      userToAddAndRemove = createdUser
      createOrganisation('ONE_ORG', false).then(organisation => {
        organisation1 = organisation

        createOrganisation('TWO_ORG', false).then(organisation => {
          organisation2 = organisation

          createUser('Mr Apple-', undefined, false, {
            roles: ['ROLE_ORG_ADMIN'],
          }).then(createdUser => {
            userOrg1 = createdUser

            createUser('Mr Android-', undefined, false, {
              roles: ['ROLE_ORG_ADMIN'],
            }).then(createdUser => {
              userOrg2 = createdUser

              sysadminAddUserToOrganisation(organisation1.body, userOrg1)
              sysadminAddUserToOrganisation(organisation2.body, userOrg2)
              createUser(undefined, undefined, false).then(u => {
                user2Org1 = u
                sysadminAddUserToOrganisation(organisation1.body, user2Org1)
              })

              org1UsersUrl = `${Cypress.env('serverBaseUrl')}/organisations/${
                organisation1.body.id
              }/users`
              org2UsersUrl = `${Cypress.env('serverBaseUrl')}/organisations/${
                organisation2.body.id
              }/users`
            })
          })
        })
      })
    })
  })
  describe('when user confirmation is disalbed', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        url: `${Cypress.env('serverRootBaseUrl')}/api/admin/instance/settings`,
        method: 'PATCH',
        body: {
          enableUserConfirmation: false,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should not let a sys admin access', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        url: `${Cypress.env('serverRootBaseUrl')}/api/organisations/${
          organisation1.body.id
        }/reports`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not let an org owner access', () => {
      cy.login(userOrg1.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverRootBaseUrl')}/api/organisations/${
          organisation1.body.id
        }/reports`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
  describe('when user confirmation is disalbed', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        url: `${Cypress.env('serverRootBaseUrl')}/api/admin/instance/settings`,
        method: 'PATCH',
        body: {
          enableUserConfirmation: true,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should let a sys admin access', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        url: `${Cypress.env('serverRootBaseUrl')}/api/organisations/${
          organisation1.body.id
        }/reports`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should let an org owner access', () => {
      cy.login(userOrg1.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverRootBaseUrl')}/api/organisations/${
          organisation1.body.id
        }/reports`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should not let an org owner access another org', () => {
      cy.login(userOrg1.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverRootBaseUrl')}/api/organisations/${
          organisation2.body.id
        }/reports`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not let an non  org owner access org', () => {
      cy.login(user2Org1.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverRootBaseUrl')}/api/organisations/${
          organisation2.body.id
        }/reports`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
