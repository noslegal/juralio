import HttpStatus from 'http-status-codes'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('get_organisation_users.cy', () => {
  let standardUserOrg1
  let adminOrg1, adminOrg2, adminOrg12
  let organisation1, organisation2
  let org1UsersUrl, org2UsersUrl, nonExistentOrgUrl

  before(() => {
    const createOrganisationOne = () =>
      createOrganisation('ONE_ORG', false).then(
        organisation => (organisation1 = organisation)
      )

    const createOrganisationTwo = () =>
      createOrganisation('TWO_ORG', false).then(
        organisation => (organisation2 = organisation)
      )

    const createOrganisationOneStandardUser = () =>
      createUser(undefined, undefined, false).then(
        createdUser => (standardUserOrg1 = createdUser)
      )

    const createOrganisationOneAdmin = () =>
      createUser('Mr Apple-', undefined, false, {
        roles: ['ROLE_ORG_ADMIN'],
      }).then(createdUser => {
        adminOrg1 = createdUser
      })
    const createOrganisationOneAdmin2 = () =>
      createUser('Mr Apple-', undefined, false, {
        roles: ['ROLE_ORG_ADMIN'],
      }).then(createdUser => {
        adminOrg12 = createdUser
      })

    const createOrganisationTwoAdmin = () =>
      createUser('Mr Android-', undefined, false, {
        roles: ['ROLE_ORG_ADMIN'],
      }).then(createdUser => {
        adminOrg2 = createdUser
      })

    const assignOrgAdminToOrgOneTwo = () =>
      sysadminAddUserToOrganisation(organisation1.body, adminOrg12)

    const assignOrgAdminToOrgOne = () =>
      sysadminAddUserToOrganisation(organisation1.body, adminOrg1)
    const assignOrgAdminToOrgTwo = () =>
      sysadminAddUserToOrganisation(organisation2.body, adminOrg2)
    const assignStandardUserToOrgOne = () =>
      sysadminAddUserToOrganisation(organisation1.body, standardUserOrg1)

    createOrganisationOne()
      .then(createOrganisationTwo)
      .then(createOrganisationOneAdmin)
      .then(createOrganisationOneAdmin2)
      .then(createOrganisationOneStandardUser)
      .then(createOrganisationTwoAdmin)
      .then(assignOrgAdminToOrgOne)
      .then(assignOrgAdminToOrgOneTwo)
      .then(assignStandardUserToOrgOne)
      .then(assignOrgAdminToOrgTwo)
      .then(() => {
        org1UsersUrl = `${Cypress.env('serverBaseUrl')}/organisations/${
          organisation1.body.id
        }/users`
        org2UsersUrl = `${Cypress.env('serverBaseUrl')}/organisations/${
          organisation2.body.id
        }/users`
        nonExistentOrgUrl = `${Cypress.env(
          'serverBaseUrl'
        )}/organisations/99999/users`
      })
  })

  describe('when trying to get the organisation users', () => {
    describe('as SysAdmin user', () => {
      const USER = {
        SYSADMIN_USER: {
          username: 'sysadmin@juralio.com',
          password: 'Password1Password1$',
        },
      }
      beforeEach(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return OK status when getting org 1 users', () => {
        cy.apiSpecRequest({
          url: org1UsersUrl,
          method: 'GET',
        }).then(response => {
          expect(
            response.body.find(u => u.id === adminOrg1.id).firstname
          ).contains('Mr Apple')
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })

      it('should return OK status when getting org 2 users', () => {
        cy.apiSpecRequest({
          url: org2UsersUrl,
          method: 'GET',
        }).then(response => {
          expect(
            response.body.find(u => u.id === adminOrg2.id).firstname
          ).contains('Mr Android')
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as an ORG ADMIN user who is associated with Organisation 1', () => {
      beforeEach(() => {
        cy.login(adminOrg1.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: org1UsersUrl,
          method: 'GET',
        }).then(response => {
          expect(
            response.body.find(u => u.id === adminOrg1.id).firstname
          ).contains('Mr Apple')
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })

      it('should return METHOD_NOT_ALLOWED for PATCH', () => {
        cy.apiSpecRequest({
          url: org1UsersUrl,
          method: 'PATCH',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })

      it('should return OK for DELETE', () => {
        cy.apiSpecRequest({
          url: org1UsersUrl,
          method: 'DELETE',
          body: { username: adminOrg12.username },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as an ORG ADMIN user associated with Organisation 2', () => {
      beforeEach(() => {
        cy.login(adminOrg2.username)
      })

      it('should return OK status when getting org 2 users', () => {
        cy.apiSpecRequest({
          url: org2UsersUrl,
          method: 'GET',
        }).then(response => {
          expect(
            response.body.find(u => u.id === adminOrg2.id).firstname
          ).contains('Mr Android')
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })

      it('should return FORBIDDEN status when getting org 1 users', () => {
        cy.apiSpecRequest({
          url: org1UsersUrl,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })

      describe('for an Organisation that does not exist', () => {
        it('should return FORBIDDEN status', () => {
          cy.login(adminOrg2.username)
          cy.apiSpecRequest({
            url: nonExistentOrgUrl,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })

    describe('as a Standard user who IS associated with Organisation 1', () => {
      before(() => {
        cy.login(standardUserOrg1.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: org1UsersUrl,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as an unauthenticated user', () => {
      it('should return UNAUTHORIZED status', () => {
        cy.apiSpecRequest({
          url: org1UsersUrl,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
    })
  })
})
