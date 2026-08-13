/*
Purpose: Tests that MA is protected across org/matter access.

Test flow:  Create two orgs with MAs and then attempt to demote one MA from the other.


Date created: 07/12/2021
*/
import HttpStatus from 'http-status-codes'
import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'

describe('remove_matter_admin_denied.cy', () => {
  let organisation1, orgAdminUser1, orgMC1, fixture1, matterAdminId
  let organisation2, orgAdminUser2, orgMC2, fixture2

  before(() => {
    setupOrganisationWithMatter(true, [{ name: 'task 1' }]).then(result => {
      organisation1 = result.organisationLabels
      orgAdminUser1 = result.orgAdminUser
      orgMC1 = result.orgMC
      fixture1 = result.fixture
      matterAdminId = result.fixture.matter.matterAdmins[0].id
    })
    setupOrganisationWithMatter(true, [{ name: 'task 2' }]).then(result => {
      organisation2 = result.organisationLabels
      orgAdminUser2 = result.orgAdminUser
      orgMC2 = result.orgMC
      fixture2 = result.fixture
    })
  })

  describe('When another organisation user attempts to remove the matter admin member', () => {
    before(() => {
      cy.login(orgAdminUser1.username)
    })
    it('should return BAD_REQUEST status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture2.matter.id
        }/matters/${matterAdminId}`,
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
