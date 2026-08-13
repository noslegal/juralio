import labelsPage from '../../page/organisation/organisation_labels_page'
import snackbarHelper from '../snackbar/snackbar-helper'

export const addLabel = (type, label) => {
  clickAddLabelBtn(type)
  labelsPage.get.labelTextField().type(label)
  labelsPage.get.saveLabelButton().click()
}

export const checkAllTogglesEnabled = () => {
  it('The toggles should be enabled', () => {
    labelsPage.get.labelToggles().find('input').should('be.enabled')
  })
}

export const checkAllTogglesDisabled = () => {
  it('The toggles should be disabled', () => {
    labelsPage.get.labelToggles().find('input').should('not.be.enabled')
  })
}

export const checkAllTogglesAndDeleteButtonsEnabled = () => {
  it('The toggles should be enabled', () => {
    labelsPage.get.labelToggles().find('input').should('be.enabled')
  })

  it('The delete buttons should be enabled', () => {
    labelsPage.get.deleteLabelButton().should('be.enabled')
  })
}

export const checkAddButtonDisabled = () => {
  it('should disable the add label button', () => {
    labelsPage.get
      .addLabelButton()
      .should('be.visible')
      .should('not.be.enabled')
  })
}

export const checkAddButtonEnabled = () => {
  it('should enable the add label button', () => {
    labelsPage.get.addLabelButton().should('be.visible').should('be.enabled')
  })
}

export const clickAddLabelBtn = (labelType) => {
  if (labelType === 'risk') {
    labelsPage.get.riskTab().click()
  } else if (labelType === 'userDefined') {
    labelsPage.get.userDefinedTab().click()
  } else {
    labelsPage.get.workflowTab().click()
  }
  labelsPage.get.addLabelButton().should('be.enabled')
  labelsPage.get.addLabelButton().click()
}

export const clickDeleteLabelBtn = (labelType) => {
  if (labelType === 'risk') {
    labelsPage.get.riskTab().click()
  } else {
    labelsPage.get.workflowTab().click()
  }
  labelsPage.get.deleteLabelButton().click()
}

export const deleteLabel = (labelType, org = true) => {
  clickDeleteLabelBtn(labelType)
  if (org) {
    cy.backendRoute('PATCH', '/organisation/labels/**').as('updateLabel')
    cy.get('[data-test=action-dialog-button]').click()
    cy.wait('@updateLabel')
  } else {
    cy.backendRoute('PATCH', '/matter/**/labels/**').as('updateLabel')
    cy.get('[data-test=action-dialog-button]').click()
    cy.wait('@updateLabel')
  }
}

// eslint-disable-next-line import/prefer-default-export
export const testAddNewCustomLabel = (
  labelType,
  name = 'Label Name',
  expectedLength = 1,
  expectAddEnabled = true,
  checkCancel = true,
  checkSnackbarMsg = undefined
) => {
  it('should display the label text field and the Add and Save buttons should be disabled', () => {
    labelsPage.get.labelTextField().should('be.visible')
    labelsPage.get.addLabelButton().should('be.disabled')
    labelsPage.get.saveLabelButton().should('be.disabled')
  })

  describe('when the user changes the default label name', () => {
    before(() => {
      labelsPage.get.labelTextField().type(name)
    })

    it('should enable the Save button', () => {
      labelsPage.get.saveLabelButton().should('be.enabled')
    })
  })

  describe('when the user clicks the Save button', () => {
    before(() => {
      labelsPage.get.saveLabelButton().click()
    })

    it('should create a new label', () => {
      if (labelType === 'risk') {
        labelsPage.get
          .listRisksBespoke()
          .should('have.length', expectedLength)
          .should('be.visible')
          .eq(0)
          .should('have.text', name)
      } else if (labelType === 'userDefined') {
        labelsPage.get
          .listUserDefined()
          .should('have.length', expectedLength)
          .should('be.visible')
          .eq(0)
          .should('contain.text', name)
      } else {
        labelsPage.get
          .listWorkflowBespoke()
          .should('have.length', expectedLength)
          .should('be.visible')
          .eq(0)
          .should('have.text', name)
      }
    })

    it('should have the Add Risk Label and Delete buttons enabled', () => {
      if (expectAddEnabled) {
        labelsPage.get.addLabelButton().should('be.enabled')
      } else {
        labelsPage.get.addLabelButton().should('not.be.enabled')
      }
      labelsPage.get.deleteLabelButton().eq(0).should('be.enabled')
    })

    if (checkSnackbarMsg) {
      snackbarHelper.checkShownAndHasExpectedText(checkSnackbarMsg)
    }
  })

  if (checkCancel) {
    describe('when the user clicks the Cancel button', () => {
      before(() => {
        clickAddLabelBtn(labelType)
        labelsPage.get.cancelLabelButton().click()
      })

      it('should remove the label edit text field and enable the Add Risk button again', () => {
        labelsPage.get.labelTextField().should('not.exist')
        labelsPage.get.addLabelButton().should('be.enabled')
      })
    })
  }
}

const matterText =  'Are you sure you want to permanently delete this label from this matter? It will continue to be used in tasks it is assigned to, but will not be available to add to new tasks.'
const orgText =  'Are you sure you want to permanently delete this label? It will continue to be used in tasks it is assigned to, but will not be available to add to new tasks.'

export const testDeleteCustomLabel = (labelType, isMatter) => {
  before(() => {
    labelsPage.get.labelsPanelItem().click()

    clickAddLabelBtn(labelType)
    labelsPage.get.labelTextField().type('Label 1')
    labelsPage.get.saveLabelButton().click()

    clickAddLabelBtn(labelType)
    labelsPage.get.labelTextField().type('Label 2')
    labelsPage.get.saveLabelButton().click()

    labelsPage.get.deleteLabelButton().eq(0).click()
  })

  it('should display a confirmation dialog', () => {
    cy.get('[data-test=dialog-prompt-text]').should(
      'have.text',
      isMatter ? matterText : orgText
    )

    cy.get('[data-test=action-dialog-button]').should('be.visible')
    cy.get('[data-test=cancel-dialog-button]').should('be.visible')
  })

  describe('When clicking the confirmation dialog\'s NO button', () => {
    before(() => {
      cy.get('[data-test=cancel-dialog-button]').click()
    })

    it('should close the dialog', () => {
      cy.get('[data-test=dialog-prompt-text]').should('not.exist')
    })
  })

  describe('When when clicking the confirmation dialog\'s YES button', () => {
    before(() => {
      labelsPage.get.deleteLabelButton().eq(0).click()
      cy.get('[data-test=action-dialog-button]').click()
    })

    it('should close the dialog and delete Label 2', () => {
      cy.get('[data-test=dialog-prompt-text]').should('not.exist')

      if (labelType === 'risk') {
        labelsPage.get
          .listRisksBespoke()
          .should('have.length', 1)
          .should('be.visible')
          .should('have.text', 'Label 1')
      } else {
        labelsPage.get
          .listWorkflowBespoke()
          .should('have.length', 1)
          .should('be.visible')
          .should('have.text', 'Label 1')
      }
    })
  })
}

const clickSaveButtonForNewLabel = (isMatterLevel) => {
  cy.backendRoute(
    'POST',
    isMatterLevel ? '/matter/*/labels' : 'organisation/labels'
  ).as('postLabel')
  labelsPage.get.saveLabelButton().click()
  cy.wait('@postLabel')
  cy.wait(2000) // Makes list order predictable
}

const clickSaveButtonForEditLabel = (isMatterLevel) => {
  cy.backendRoute(
    'PATCH',
    isMatterLevel ? '/matter/*/labels/*' : 'organisation/labels/*'
  ).as('patchLabel')
  labelsPage.get.saveLabelButton().click()
  cy.wait('@patchLabel')
  cy.wait(2000) // Makes list order predictable
}

export const testEditLabel = (label_type, isMatterLevel = false) => {
  before(() => {
    clickAddLabelBtn(label_type)
    labelsPage.get.labelTextField().type('Label 1')
    clickSaveButtonForNewLabel(isMatterLevel)

    clickAddLabelBtn(label_type)
    labelsPage.get.labelTextField().type('Label 2')
    clickSaveButtonForNewLabel(isMatterLevel)

    labelsPage.get.editLabelButton().should('have.length.at.least', 2)
    labelsPage.get.editLabelButton().eq(0).should('be.visible').click()
  })

  it('should display the label edit field and the Add and Save buttons should be disabled', () => {
    labelsPage.get.labelTextField().should('be.visible')
    labelsPage.get.addLabelButton().should('be.disabled')
    labelsPage.get.saveLabelButton().should('be.disabled')
  })

  describe('when the user changes the label name', () => {
    before(() => {
      labelsPage.get.labelTextField().clear().type('Label Edit')
    })

    it('should enable the Save button', () => {
      labelsPage.get.saveLabelButton().should('be.enabled')
    })
  })

  describe('when the user clicks the Save button', () => {
    before(() => {
      clickSaveButtonForEditLabel(isMatterLevel)
    })

    it('should save the new label name and the other label should stay the same', () => {
      if (label_type === 'risk') {
        labelsPage.get
          .listRisksBespoke()
          .eq(1)
          .should('be.visible')
          .should('have.text', 'Label 1')

        labelsPage.get
          .listRisksBespoke()
          .eq(0)
          .should('be.visible')
          .should('have.text', 'Label Edit')
      } else {
        labelsPage.get
          .listWorkflowBespoke()
          .eq(1)
          .should('be.visible')
          .should('have.text', 'Label 1')

        labelsPage.get
          .listWorkflowBespoke()
          .eq(0)
          .should('be.visible')
          .should('have.text', 'Label Edit')
      }
    })

    it('should have the Add Risk Label and Delete buttons enabled', () => {
      labelsPage.get.addLabelButton().should('be.enabled')
      labelsPage.get.deleteLabelButton().eq(1).should('be.enabled')
    })
  })
}
