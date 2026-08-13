import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import { testDeleteCustomLabel } from '../../../../../helpers/labels/test-custom-label-helper'
import { updateFTUE } from '../../../../../helpers/users/user_api_helper'
import labelsPage from '../../../../../page/organisation/organisation_labels_page'

describe('matter_admin_label_delete.cy', () => {
  let organisation, orgAdminUser, appPage

  before(() => {
    setupOrganisationWithMatter().then(result => {
      organisation = result.organisationLabels
      orgAdminUser = result.orgAdminUser
      updateFTUE(orgAdminUser, { hasSeenMatterAdmin: true })
      appPage = result.appPage
    })
  })

  describe('when an MATTER ADMIN clicks on the DELETE button for a RISK label', () => {
    before(() => {
      cy.login(orgAdminUser)
      appPage.visitMatter()
      cy.wait(2000)
      labelsPage.get.labelsPanelItem().click()
    })

    testDeleteCustomLabel('risk', true)

    describe('when an MATTER ADMIN clicks on the DELETE button for a WORKFLOW label', () => {
      testDeleteCustomLabel('workflow', true)
    })
  })
})
