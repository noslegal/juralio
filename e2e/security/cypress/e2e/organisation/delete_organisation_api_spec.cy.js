import HttpStatus from 'http-status-codes'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('delete_organisation_api_spec', () => {
  let userOrg1, userOrg2, userToAddAndRemove
  let organisation1, organisation2
  let organisation1Url, organisation2Url

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

              organisation1Url = `${Cypress.env(
                'serverBaseUrl'
              )}/organisations/${organisation1.body.id}`
              organisation2Url = `${Cypress.env(
                'serverBaseUrl'
              )}/organisations/${organisation2.body.id}`
            })
          })
        })
      })
    })
  })
  describe('as a sys admin', () => {
    it('should allow me to mark an organisation for deletion', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        url: organisation1Url,
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })

    it('should allow me to unmark an organisation for deletion', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        url: organisation1Url + '/restore',
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should not allow me to restore a non-deleted org', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        url: organisation2Url + '/restore',
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
  describe('as a regular user', () => {
    it('should allow me to mark an organisation for deletion', () => {
      cy.login(userOrg1)
      cy.apiSpecRequest({
        url: organisation1Url,
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    it('should not allow me to unmark an organisation for deletion', () => {
      cy.login(userOrg1)
      cy.apiSpecRequest({
        url: organisation1Url + '/restore',
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not allow me to restore a non-deleted org', () => {
      cy.login(userOrg1)
      cy.apiSpecRequest({
        url: organisation2Url + '/restore',
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
