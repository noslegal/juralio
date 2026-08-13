import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import { testEditLabel } from '../../../../../helpers/labels/test-custom-label-helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import labelsPage from '../../../../../page/organisation/organisation_labels_page'

const visitHelpers = new VisitHelpers()

describe('oa_organisation_label_edit.cy', () => {
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

  describe('when an ORG ADMIN clicks on the EDIT button for a RISK label', () => {
    before(() => {
      cy.login(orgAdminUser)
      visitHelpers.visitOrganisation()
      cy.wait(3000)
      labelsPage.get.labelsPanelItem().click()
    })

    testEditLabel('risk')

    describe('when an ORG ADMIN clicks on the EDIT button for a WORKFLOW label', () => {
      testEditLabel('workflow')
    })
  })
})
