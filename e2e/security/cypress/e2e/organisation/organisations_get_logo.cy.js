/*
Purpose: Tests that org logo only accessible from that org for OAs.

Test flow: Create two orgs then attempt to access a logo from both orgs.


Date created: 07/12/2021
*/
import HttpStatus from 'http-status-codes'
import { setupOrganisationWithMatter } from '../../../../helpers/labels/setup-organisation-with-matter'

describe('organisations_get_logo.cy', () => {
  let organisation1, orgAdminUser1, orgMC1, fixture1
  let organisation2, orgAdminUser2, orgMC2, fixture2
  let URL

  before(() => {
    setupOrganisationWithMatter(true, [{ name: 'task 1' }]).then(result => {
      organisation1 = result.organisationLabels
      orgAdminUser1 = result.orgAdminUser
      orgMC1 = result.orgMC
      fixture1 = result.fixture
      URL = `organisations/${organisation1.body.id}/logo`
    })
    setupOrganisationWithMatter(true, [{ name: 'task 2' }]).then(result => {
      organisation2 = result.organisationLabels
      orgAdminUser2 = result.orgAdminUser
      orgMC2 = result.orgMC
      fixture2 = result.fixture
    })
  })

  describe('When another organisation user attempts to restore the archived post to a new location', () => {
    before(() => {
      cy.login(orgAdminUser1.username)
    })

    it('should return BAD_REQUEST status with no logo set test', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'GET',
      }).then(response => {
        expect(response.body).to.eq('No Logo Set')
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })

  describe('When another organisation user attempts to restore the archived post to the previous location', () => {
    before(() => {
      cy.login(orgAdminUser2.username)
    })

    it('should return FORBIDDEN status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})
