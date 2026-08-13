import { createAdvisorMatter } from '../../../../helpers/matterprojects/matter_api_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import matterPage from '../../../../page/matterprojects/matter_page'
import { updateFTUE } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

const getStatusChip = () =>
  cy.get('[data-test=status-select-selection-dropdown]').eq(0)

describe('matter_details_update.cy', () => {
  let matter

  beforeEach(() => {
    cy.login('matter.creator@juralio.com')
  })
  before(() => {
    updateFTUE(
      { username: 'matter.creator@juralio.com' },
      { hasSeenMatterAdmin: true }
    )
    createAdvisorMatter().then(newMatter => {
      matter = newMatter
      visitHelpers.visitMatter(matter.id)
    })
    cy.get('[data-test=overview]').click()
  })

  describe('When the edit matter details button is clicked', () => {
    before(() => {
      matterPage.get.matterDetailsButton().click()
    })
    it('should show the dialog', () => {
      cy.get('[data-test=dialog-header-title-text]').should(
        'contain.text',
        'Edit matter details'
      )
    })

    describe('When the cancel button is clicked', () => {
      before(() => {
        cy.get('[data-test=cancel-dialog-button]').click()
      })
      it('should no longer show the dialog', () => {
        cy.get('[data-test=dialog-header-title-text]').should('not.exist')
      })
    })
  })

  describe('When the edit matter details button is clicked', () => {
    before(() => {
      matterPage.get.matterDetailsButton().click()
    })
    it('should show the dialog', () => {
      cy.get('[data-test=dialog-header-title-text]').should(
        'contain.text',
        'Edit matter details'
      )
    })

    it('should show the matter details in the dialog', () => {
      checkMatterDetailsDialog(matter)
    })

    describe('When the  details are changed and the dialog is cancelled', () => {
      before(() => {
        matterPage.get.clientNameInput().type('I HAVE BEEN CHANGED')
        matterPage.get.nameInput().type('I HAVE BEEN CHANGED ALSO')
        matterPage.get.referenceNumberInput().type('I HAVE BEEN CHANGED TOO')
        cy.get('[data-test=cancel-dialog-button]').click()
      })

      it('should show the same matter details', () => {
        checkMatterDetails(matter)
      })

      describe('When the  details are changed and the dialog is actioned', () => {
        before(() => {
          matterPage.get.matterDetailsButton().click()
          matterPage.get.clientNameInput().clear().type('A client')
          matterPage.get.nameInput().clear().type('A matter')
          matterPage.get
            .referenceNumberInput()
            .clear()
            .type('A reference number')
          cy.get('[data-test=action-dialog-button]').click()
        })

        it('should show the same matter details', () => {
          checkMatterDetails({
            clientName: 'A client',
            name: 'A matter',
            userDefinedReferenceNumber: 'A reference number',
          })
        })
        describe('When the  matter reference number is blank and the dialog is actioned', () => {
          before(() => {
            matterPage.get.matterDetailsButton().click()
            matterPage.get.clientNameInput().clear().type('A client')
            matterPage.get.nameInput().clear().type('A matter')
            matterPage.get.referenceNumberInput().clear()
            cy.get('[data-test=action-dialog-button]').click()
          })

          it('should show the same matter details', () => {
            checkMatterDetails({
              clientName: 'A client',
              name: 'A matter',
              userDefinedReferenceNumber: '',
            })
          })
        })
      })
    })
  })

  describe('When updating the status toggle', () => {
    it('should display the status - active', () => {
      getStatusChip().should('contain', 'Active')
    })

    describe('on toggling status', () => {
      before(() => {
        cy.get('[data-test=status-select-selection-dropdown]').eq(0).click()
        cy.get('[data-test=status-select-off-option]').click()
      })

      it('should display the status - closed', () => {
        getStatusChip().should('contain', 'Closed')
      })

      it('on reload should persist and should display the status - closed', () => {
        cy.reload()
        cy.get('[data-test=overview]').click()
        getStatusChip().should('contain', 'Closed')
      })

      describe('on untoggling status', () => {
        before(() => {
          cy.get('[data-test=status-select-selection-dropdown]').eq(0).click()
          cy.get('[data-test=status-select-on-option]').click()
        })

        it('should display the status - active', () => {
          getStatusChip().should('contain', 'Active')
        })

        it('on reload should persist and should display the status - active', () => {
          cy.reload()
          cy.get('[data-test=overview]').click()
          getStatusChip().should('contain', 'Active')
        })
      })
    })
  })
})

const checkMatterDetails = matter => {
  matterPage.get.clientName().should('contain.text', matter.clientName)
  matterPage.get.matterName().should('contain.text', matter.name)
  matterPage.get
    .userDefinedReferenceNumber()
    .should('contain.text', matter.userDefinedReferenceNumber)
}

const checkMatterDetailsDialog = matter => {
  matterPage.get.clientNameInput().should('have.value', matter.clientName)
  matterPage.get.nameInput().should('have.value', matter.name)
  matterPage.get
    .referenceNumberInput()
    .should('have.value', matter.userDefinedReferenceNumber)
}
