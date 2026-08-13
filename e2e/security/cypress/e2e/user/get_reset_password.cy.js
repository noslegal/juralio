import HttpStatus from 'http-status-codes'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('get_reset_password.cy', () => {
  let org1, org1Admin, standardUser1, standardUser2
  let org2, org2Admin

  const setupOrg1Data = () => {
    const createOrg1 = () =>
      createOrganisation('test', false).then(response => (org1 = response.body))
    const createOrgAdmin1 = () =>
      createUser(undefined, true, false, { roles: ['ROLE_ORG_ADMIN'] }).then(
        response => (org1Admin = response)
      )
    const assignOrgAdminToOrg1 = () =>
      sysadminAddUserToOrganisation(org1, org1Admin)
    const createStandardUser1 = () =>
      createUser(undefined, true, false).then(
        response => (standardUser1 = response)
      )
    const createStandardUser2 = () =>
      createUser(undefined, true, false).then(
        response => (standardUser2 = response)
      )
    const assignStandardUser1ToOrg1 = () =>
      sysadminAddUserToOrganisation(org1, standardUser1)
    const assignStandardUser2ToOrg1 = () =>
      sysadminAddUserToOrganisation(org1, standardUser2)

    createOrg1()
      .then(createOrgAdmin1)
      .then(assignOrgAdminToOrg1)
      .then(createStandardUser1)
      .then(assignStandardUser1ToOrg1)
      .then(createStandardUser2)
      .then(assignStandardUser2ToOrg1)
  }

  const setupOrg2Data = () => {
    const createOrg2 = () =>
      createOrganisation('test2', false).then(
        response => (org2 = response.body)
      )
    const createOrgAdmin2 = () =>
      createUser(undefined, true, false, { roles: ['ROLE_ORG_ADMIN'] }).then(
        response => (org2Admin = response)
      )
    const assignOrgAdminToOrg2 = () =>
      sysadminAddUserToOrganisation(org2, org2Admin)

    createOrg2().then(createOrgAdmin2).then(assignOrgAdminToOrg2)
  }

  const getUrl = user =>
    `${Cypress.env('serverBaseUrl')}/settings/users/${user.id}/password`

  before(() => {
    setupOrg1Data()
    setupOrg2Data()
  })

  describe('when trying to reset the password of a user', () => {
    describe('when signed in as a standard user', () => {
      before(() => {
        cy.login(standardUser1.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: getUrl(standardUser2),
          method: 'GET',
        }).then(response => expect(response.status).to.eq(HttpStatus.FORBIDDEN))
      })
    })

    describe('when signed in as an Org Admin from a DIFFERENT Org than the target user', () => {
      before(() => {
        cy.login(org2Admin)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: getUrl(standardUser2),
          method: 'GET',
        }).then(response => expect(response.status).to.eq(HttpStatus.FORBIDDEN))
      })
    })

    describe('When signed in as an Org Admin from the SAME Org than the target user', () => {
      before(() => {
        cy.login(org1Admin)
        cy.wait(60000)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: getUrl(standardUser2),
          method: 'GET',
        }).then(response => expect(response.status).to.eq(HttpStatus.OK))
      })
    })

    describe('When signed in as a Sysadmin', () => {
      before(() => {
        cy.login('sysadmin@juralio.com', 'Password1Password1$')
        cy.wait(60000)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: getUrl(standardUser2),
          method: 'GET',
        }).then(response => expect(response.status).to.eq(HttpStatus.OK))
      })
    })

    describe('when attempting other Verbs on template tasks endpoint', () => {
      ;['POST', 'DELETE', 'PATCH', 'HEAD', 'PUT', 'OPTIONS'].forEach(method => {
        it(`should return METHOD_NOT_ALLOWED status for ${method}`, () => {
          cy.login('sysadmin@juralio.com', 'Password1Password1$')
          cy.apiSpecRequest({
            url: getUrl(standardUser1),
            method: method,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
        })
      })
    })
  })
})
