import HttpStatus from 'http-status-codes'
import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import { sysadminAddUserToOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('create_labels.cy', () => {
  let organisation, orgadmin
  before(() => {
    setupOrganisationWithMatter().then(result => {
      organisation = result.organisationLabels.body
      orgAdminUser = result.orgAdminUser
      orgMC = result.orgMC
      fixture = result.fixture
      appPage = result.appPage
      createUser('', true, false, { roles: ['ROLE_ORG_ADMIN'] }).then(user => {
        orgadmin = user
        cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() => {
          sysadminAddUserToOrganisation(organisation, orgadmin)
        })
      })
    })
  })

  describe('as an orgadmin', () => {
    it('should not allow me to delete the system level labels', () => {
      cy.login(orgadmin)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/labels/system/1`,
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should  allow me to create org level labels', () => {
      cy.login(orgadmin)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisation/labels`,
        method: 'POST',
        body: {
          name: 'organisationLabel',
          type: 'workflow',
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should not allow me to create another org level labels', () => {
      cy.login(orgadmin)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisation/11/labels/`,
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not let me create a user_defined label', () => {
      cy.login(orgadmin).then(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/organisation/11/labels/`,
          method: 'POST',
          body: {
            name: 'created',
            type: 'user_defined',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
    it('should not allow me to create matter level labels', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/labels/${fixture.matter.id}`,
        method: 'POST',
        body: {
          name: 'system label',
          type: 'workflow',
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
      })
    })
  })
})
