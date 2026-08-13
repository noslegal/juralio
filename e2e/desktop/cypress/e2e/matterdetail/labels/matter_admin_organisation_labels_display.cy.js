import { createOrganisationLabel } from '../../../../../helpers/labels/labels_api_helper'
import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import { updateFTUE } from '../../../../../helpers/users/user_api_helper'
import labelsPage from '../../../../../page/organisation/organisation_labels_page'

/*
Purpose: Tests the label sections display correctly in the matter admin settings.

Test flow: When there aren't any organisation labels, check there isn't an org labels section.

           Then create an org label and check the org labels section does exist.


Date created: 11/01/22
*/

describe('matter_admin_organisation_labels_display.cy', () => {
  let organisation, orgAdminUser, orgMC
  let fixture, appPage

  before(() => {
    setupOrganisationWithMatter().then(result => {
      organisation = result.organisationLabels
      orgAdminUser = result.orgAdminUser
      updateFTUE(orgAdminUser, { hasSeenMatterAdmin: true })
      orgMC = result.orgMC
      fixture = result.fixture
      appPage = result.appPage
    })
  })

  describe('when a matter admin views the matter admin area', () => {
    before(() => {
      cy.login(orgAdminUser)
      appPage.visitMatter()
      cy.wait(2000)
      labelsPage.get.labelsPanelItem().click()
    })

    it('should show a risks tab', () => {
      labelsPage.get.riskTab().should('be.visible')
    })

    describe('when viewing risk labels', () => {
      it('should display 2 sections - standard and matter level labels', () => {
        labelsPage.get.listRiskSystem().should('be.visible')
        labelsPage.get.listRiskOrganisation().should('not.exist')
        labelsPage.get.listRiskMatter().should('be.visible')
      })

      it('should show an add button next to the matter labels section', () => {
        labelsPage.get
          .listRiskMatter()
          .find('[data-test=add-label-button]')
          .should('be.visible')
      })
    })

    describe('when viewing workflow labels', () => {
      before(() => {
        labelsPage.get.workflowTab().click()
      })

      it('should display 2 sections - standard and matter level labels', () => {
        labelsPage.get.listWorkflowSystem().should('be.visible')
        labelsPage.get.listWorkflowOrganisation().should('not.exist')
        labelsPage.get.listWorkflowMatter().should('be.visible')
      })

      it('should show an add button next to the matter labels section', () => {
        labelsPage.get
          .listWorkflowMatter()
          .find('[data-test=add-label-button]')
          .should('be.visible')
      })
    })
  })
  describe('when an organisation risk and workflow label is added and then the matter admin views the matter admin area', () => {
    before(() => {
      createOrganisationLabel(orgAdminUser, 'org risk label', 'risk')
        .then(() =>
          createOrganisationLabel(
            orgAdminUser,
            'org workflow label',
            'workflow'
          )
        )
        .then(() => {
          cy.reload()
          cy.login(orgAdminUser)
          appPage.visitMatter()
          labelsPage.get.labelsPanelItem().click()
        })
    })

    describe('when viewing risk labels', () => {
      it('should display 3 sections - standard, organisation and matter level labels', () => {
        labelsPage.get.listRiskSystem().should('be.visible')
        labelsPage.get.listRiskOrganisation().should('be.visible')
        labelsPage.get.listRiskMatter().should('be.visible')
      })

      it('should display the label under the organisation heading', () => {
        labelsPage.get
          .listRiskOrganisation()
          .find('[data-test=label-chip-text]')
          .should('have.text', 'org risk label')
      })
    })

    describe('when viewing workflow labels', () => {
      before(() => {
        labelsPage.get.workflowTab().click()
      })

      it('should display 3 sections - standard, organisation and matter level labels', () => {
        labelsPage.get.listWorkflowSystem().should('be.visible')
        labelsPage.get.listWorkflowOrganisation().should('be.visible')
        labelsPage.get.listWorkflowMatter().should('be.visible')
      })

      it('should display the label under the organisation heading', () => {
        labelsPage.get
          .listWorkflowOrganisation()
          .find('[data-test=label-chip-text]')
          .should('have.text', 'org workflow label')
      })
    })
  })
})
