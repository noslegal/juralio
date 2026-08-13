import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import {
  clickAddLabelBtn,
  testAddNewCustomLabel,
} from '../../../../../helpers/labels/test-custom-label-helper'
import { updateFTUE } from '../../../../../helpers/users/user_api_helper'
import labelsPage from '../../../../../page/organisation/organisation_labels_page'

describe('matter_admin_label_add.cy', () => {
  let organisation, orgAdminUser, appPage

  before(() => {
    setupOrganisationWithMatter().then(result => {
      organisation = result.organisationLabels
      orgAdminUser = result.orgAdminUser
      updateFTUE(orgAdminUser, { hasSeenMatterAdmin: true })
      appPage = result.appPage
    })
  })

  describe('when an MATTER ADMIN clicks on the Add Risk Label button', () => {
    before(() => {
      cy.login(orgAdminUser)
      appPage.visitMatter()
      cy.wait(2000)
      labelsPage.get.labelsPanelItem().click()
      clickAddLabelBtn('risk')
    })

    testAddNewCustomLabel('risk')

    describe('when a MATTER ADMIN tries to create a label with the same name', () => {
      before(() => {
        clickAddLabelBtn('risk')
      })

      testAddNewCustomLabel(
        'risk',
        'Label Name',
        1,
        true,
        true,
        'Label name is already in use'
      )
    })

    describe('when an MATTER ADMIN clicks on the Add Label button', () => {
      before(() => {
        clickAddLabelBtn('workflow')
      })

      testAddNewCustomLabel('workflow')
    })
  })
})
