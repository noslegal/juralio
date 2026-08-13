import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import {
  checkAddButtonDisabled,
  checkAddButtonEnabled,
  checkAllTogglesEnabled,
  clickAddLabelBtn,
  testAddNewCustomLabel,
} from '../../../../../helpers/labels/test-custom-label-helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import labelsPage from '../../../../../page/organisation/organisation_labels_page'

const visitHelpers = new VisitHelpers()

describe('oa_organisation_label_count_limit.cy', () => {
  let orgAdminUser

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
      orgAdminUser = result.orgAdminUser
    })
  })

  describe('when an ORG ADMIN views ', () => {
    before(() => {
      cy.login(orgAdminUser)
      visitHelpers.visitOrganisation()
    })

    it('should display labels section', () => {
      labelsPage.get.labelsPanelItem().should('have.length', 1)
    })

    describe('when the label section filled to maximum', () => {
      before(() => {
        labelsPage.get.labelsPanelItem().click()
      })

      for (let i = 1; i < 11; i++) {
        // eslint-disable-next-line no-loop-func
        describe('when creating label ' + i, () => {
          before(() => {
            cy.wait(2000)
            clickAddLabelBtn('workflow')
          })

          testAddNewCustomLabel('workflow', 'Label' + i, i, i !== 10, false)
        })
      }

      describe('When limit is reached', () => {
        checkAddButtonDisabled()

        it('The toggles should be disabled', () => {
          labelsPage.get.labelToggles().should('not.be.enabled')
        })

        describe('When visiting the risks tab', () => {
          before(() => {
            labelsPage.get.riskTab().click()
          })

          checkAddButtonDisabled()

          it('The toggles should be disabled', () => {
            labelsPage.get.labelToggles().should('not.be.enabled')
          })

          describe('When a label is deleted', () => {
            before(() => {
              labelsPage.get.workflowTab().click()
              labelsPage.get.deleteLabelButton().eq(0).click({ force: true })
              cy.get('[data-test=action-dialog-button]').click({ force: true })
            })

            checkAddButtonEnabled()

            describe('when another label is added', () => {
              before(() => {
                clickAddLabelBtn('workflow')
              })

              testAddNewCustomLabel('workflow', 'New Label', 10, false, false)

              describe('When a label is disabled', () => {
                before(() => {
                  labelsPage.get.labelToggles().eq(2).click()
                  cy.get('[data-test=action-dialog-button]').click()
                })

                describe('When visiting the risks tab', () => {
                  before(() => {
                    labelsPage.get.riskTab().click()
                  })
                  checkAddButtonEnabled()

                  checkAllTogglesEnabled()
                })
              })
            })
          })
        })
      })
    })
  })
})
