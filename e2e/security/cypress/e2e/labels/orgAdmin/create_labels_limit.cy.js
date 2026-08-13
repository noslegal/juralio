import HttpStatus from 'http-status-codes'
import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import { sysadminAddUserToOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('create_labels_limit.cy', () => {
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
    it('should allow me to create org level labels', () => {
      cy.login(orgadmin)
      for (let i = 0; i < 10; i++) {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/organisation/labels`,
          method: 'POST',
          body: {
            name: `organisationLabel${i}`,
            type: 'workflow',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/organisation/labels`,
          method: 'POST',
          body: {
            name: `organisationLabel${i}`,
            type: 'risk',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      }
    })
    it('should not allow me to create an org level label when over the limit', () => {
      cy.login(orgadmin)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisation/labels`,
        method: 'POST',
        body: {
          name: 'organisationLabel',
          type: 'workflow',
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})
