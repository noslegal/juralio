import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import labelsPage from '../../../../../page/organisation/organisation_labels_page'

const visitHelpers = new VisitHelpers()

const checkForListHeadings = () => {
  it('should display the two label list title', () => {
    labelsPage.get
      .labelListTitle()
      .eq(0)
      .should('contain.text', 'Standard Juralio Labels')
    labelsPage.get
      .labelListTitle()
      .eq(1)
      .should('contain.text', 'Labels in this organisation')
  })
}

const checkForZeroState = text => {
  it('should display zero state for Org risk labels', () => {
    labelsPage.get
      .labelListZeroState()
      .should('be.visible')
      .should('contain.text', text)
  })
}

const checkForAddButton = text => {
  it('should display the add label button', () => {
    labelsPage.get
      .addLabelButton()
      .should('be.visible')
      .should('contain.text', text)
      .should('be.enabled')
  })
}

describe('oa_organisation_label_display.cy', () => {
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
    })

    it('should display labels section', () => {
      labelsPage.get.labelsPanelItem().should('have.length', '1')
    })

    describe('when the label section is clicked', () => {
      before(() => {
        labelsPage.get.labelsPanelItem().click()
      })

      it('should display the panel header', () => {
        labelsPage.get.labelsPanelTitle().should('have.length', '1')
        labelsPage.get
          .labelsPanelCaption()
          .should(
            'contain.text',
            'Choose which labels are available in this organisation.'
          )
      })

      it('should display the two label category tabs', () => {
        labelsPage.get.riskTab().should('be.visible')
        labelsPage.get.workflowTab().should('be.visible')
      })

      describe('when viewing the Risks tab', () => {
        checkForListHeadings()

        checkForAddButton('Add Risk Label')

        checkForZeroState(
          'You have no bespoke risk labels in this organisation.'
        )

        it('should display the 6 standard risks', () => {
          labelsPage.get.labelChipText().should('have.length', 6)
          labelsPage.get.labelToggles().should('have.length', 6)
          labelsPage.get
            .labelToggleText()
            .should('have.text', 'EnabledEnabledEnabledEnabledEnabledEnabled')
        })
      })

      describe('when viewing the Workflow tab', () => {
        before(() => {
          labelsPage.get.workflowTab().click()
        })

        checkForListHeadings()

        checkForAddButton('Add Workflow Label')

        checkForZeroState(
          'You have no bespoke workflow labels in this organisation.'
        )

        it('should display the 4 standard workflow labels', () => {
          labelsPage.get.labelChipText().should('have.length', 4)
          labelsPage.get.labelToggles().should('have.length', 4)
          labelsPage.get
            .labelToggleText()
            .should('have.text', 'EnabledEnabledEnabledEnabled')
        })
      })
    })
  })
})
