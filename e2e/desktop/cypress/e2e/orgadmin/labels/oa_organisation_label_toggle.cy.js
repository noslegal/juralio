import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import labelsPage from '../../../../../page/organisation/organisation_labels_page'

const visitHelpers = new VisitHelpers()

describe('oa_organisation_label_toggle.cy', () => {
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

  describe('when an ORG ADMIN views ', () => {
    before(() => {
      cy.login(orgAdminUser)
      visitHelpers.visitOrganisation()
      cy.wait(3000)
      labelsPage.get.labelsPanelItem().click()
    })

    describe('when disabling a risk label', () => {
      before(() => {
        labelsPage.get.labelToggles().eq(0).click()
        cy.get('[data-test=action-dialog-button]').click()
      })
      it('should display the 1 disabled and 5 enabled risks', () => {
        labelsPage.get
          .labelToggleText()
          .should('have.text', 'DisabledEnabledEnabledEnabledEnabledEnabled')
      })

      describe('when disabling a workflow label', () => {
        before(() => {
          labelsPage.get.workflowTab().click()
          labelsPage.get.labelToggles().eq(2).click()
          cy.get('[data-test=action-dialog-button]').click()
        })
        it('should display the 1 disabled and 3 enabled risks', () => {
          labelsPage.get
            .labelToggleText()
            .should('have.text', 'EnabledEnabledDisabledEnabled')
        })
      })
    })
  })
})
