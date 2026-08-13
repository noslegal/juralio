import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import {
  addLabel,
  checkAddButtonDisabled,
  checkAddButtonEnabled,
  checkAllTogglesAndDeleteButtonsEnabled,
  checkAllTogglesDisabled,
  clickAddLabelBtn,
  testAddNewCustomLabel,
} from '../../../../../helpers/labels/test-custom-label-helper'
import { updateFTUE } from '../../../../../helpers/users/user_api_helper'
import labelsPage from '../../../../../page/organisation/organisation_labels_page'

describe('matter_admin_label_count_limit.cy', () => {
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

      labelsPage.get.labelsPanelItem().click()
    })

    for (let i = 1; i < 11; i++) {
      // eslint-disable-next-line no-loop-func
      describe('when creating label ' + i, () => {
        before(() => {
          clickAddLabelBtn('risk')
        })

        testAddNewCustomLabel('risk', 'Label' + i, i, i !== 10, false)
      })
    }

    describe('When limit is reached', () => {
      checkAddButtonDisabled()

      checkAllTogglesAndDeleteButtonsEnabled()

      describe('When visiting the risks tab', () => {
        before(() => {
          labelsPage.get.riskTab().click()
        })
        checkAddButtonDisabled()

        checkAllTogglesAndDeleteButtonsEnabled()

        describe('When a label is disabled', () => {
          before(() => {
            labelsPage.get.labelToggles().eq(2).click()
          })

          checkAddButtonEnabled()

          describe('When a label is re-enabled', () => {
            before(() => {
              labelsPage.get.labelToggles().eq(2).click()
            })

            checkAddButtonDisabled()

            describe('When a label is re-enabled', () => {
              before(() => {
                labelsPage.get.labelToggles().eq(0).click()
                labelsPage.get.labelToggles().eq(1).click()
                labelsPage.get.labelToggles().eq(2).click()
                labelsPage.get.labelToggles().eq(3).click()
                labelsPage.get.labelToggles().eq(4).click()
                labelsPage.get.labelToggles().eq(5).click()
              })

              checkAddButtonEnabled()

              describe('when creating labels', () => {
                before(() => {
                  for (let i = 0; i < 6; i++) {
                    addLabel('workflow', `ALabel ${i}`)
                    cy.wait(1000)
                  }

                  labelsPage.get.riskTab().click()
                  cy.wait(5000)
                })

                checkAddButtonDisabled()

                checkAllTogglesDisabled()
              })
            })
          })
        })
      })
    })
  })
})
