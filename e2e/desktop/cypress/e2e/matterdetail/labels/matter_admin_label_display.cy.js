import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import { updateFTUE } from '../../../../../helpers/users/user_api_helper'
import labelsPage from '../../../../../page/organisation/organisation_labels_page'

const checkForListHeadings = () => {
  it('should display the two label list title', () => {
    labelsPage.get
      .labelListTitle()
      .eq(0)
      .should('contain.text', 'Standard Juralio labels')
    labelsPage.get
      .labelListTitle()
      .eq(1)
      .should('contain.text', 'Matter Labels')
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

describe('matter_admin_label_display.cy', () => {
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
    })

    it('should display labels section', () => {
      labelsPage.get.labelsPanelItem().should('have.length', '1')
    })

    describe('when the label section is clicked', () => {
      before(() => {
        cy.wait(2000)
        labelsPage.get.labelsPanelItem().click()
        cy.wait(2000)
      })

      it('should display the panel header', () => {
        labelsPage.get.labelsPanelTitle().should('have.length', '1')
        labelsPage.get
          .labelsPanelCaption()
          .should(
            'contain.text',
            'Choose which labels are available in this matter.'
          )
      })

      it('should display the two label category tabs', () => {
        labelsPage.get.riskTab().should('be.visible')
        labelsPage.get.workflowTab().should('be.visible')
      })

      describe('when viewing the Risks tab', () => {
        checkForListHeadings()

        checkForAddButton('Add Risk Label')

        checkForZeroState('You have no bespoke risk labels in this matter.')

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

        checkForZeroState('You have no bespoke workflow labels in this matter.')

        it('should display the 4 standard workflow', () => {
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
