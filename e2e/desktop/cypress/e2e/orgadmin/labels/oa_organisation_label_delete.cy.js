import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import { testDeleteCustomLabel } from '../../../../../helpers/labels/test-custom-label-helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'

const visitHelpers = new VisitHelpers()

describe('oa_organisation_label_delete.cy', () => {
  let organisation, orgAdminUser

  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    const url = `${Cypress.env(
      'serverRootBaseUrl'
    )}/api/admin/instance/settings`

    cy.apiSpecRequest({
      url,
      method: 'PATCH',
      body: {
        enablePaymentPlatformIntegration: false,
      },
    })
    setupOrganisationWithMatter(false).then(result => {
      organisation = result.organisationLabels
      orgAdminUser = result.orgAdminUser
    })
  })

  describe('when an ORG ADMIN clicks on the DELETE button for a RISK label', () => {
    before(() => {
      cy.login(orgAdminUser)
      visitHelpers.visitOrganisation()
      cy.wait(5000)
    })

    testDeleteCustomLabel('risk', false)

    describe('when an ORG ADMIN clicks on the DELETE button for a WORKFLOW label', () => {
      testDeleteCustomLabel('workflow', false)
    })
  })
})
