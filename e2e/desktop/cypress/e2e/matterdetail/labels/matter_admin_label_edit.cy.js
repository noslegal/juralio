import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import { testEditLabel } from '../../../../../helpers/labels/test-custom-label-helper'
import { updateFTUE } from '../../../../../helpers/users/user_api_helper'
import labelsPage from '../../../../../page/organisation/organisation_labels_page'

describe(
  'matter_admin_label_edit.cy',
  { retries: { runMode: 3, openMode: 1 } },
  () => {
    let organisation, orgAdminUser, appPage

    before(() => {
      setupOrganisationWithMatter().then(result => {
        organisation = result.organisationLabels
        orgAdminUser = result.orgAdminUser
        updateFTUE(orgAdminUser, { hasSeenMatterAdmin: true })
        appPage = result.appPage
      })
    })

    describe('when an MATTER ADMIN clicks on the EDIT button for a RISK label', () => {
      before(() => {
        cy.login(orgAdminUser)
        appPage.visitMatter()

        labelsPage.get.labelsPanelItem().click()
      })

      testEditLabel('risk', true)

      describe('when an MATTER ADMIN clicks on the EDIT button for a WORKFLOW label', () => {
        testEditLabel('workflow', true)
      })
    })
  }
)
