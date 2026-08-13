import {
  addLabelToTask,
  addRiskToTask,
} from '../../../../../helpers/labels/add-label-to-task'
import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import { updateFTUE } from '../../../../../helpers/users/user_api_helper'
import labelsPage from '../../../../../page/organisation/organisation_labels_page'

describe('matter_admin_label_counts.cy', () => {
  let organisation, orgAdminUser, orgMC
  let fixture, appPage

  before(() => {
    setupOrganisationWithMatter(true, [
      { name: 'task 1', tasks: [{ name: 'task 3' }] },
      { name: 'task 2' },
    ]).then((result, _) => {
      organisation = result.organisationLabels
      orgAdminUser = result.orgAdminUser
      updateFTUE(orgAdminUser, { hasSeenMatterAdmin: true })
      orgMC = result.orgMC
      fixture = result.fixture
      appPage = result.appPage
    })
  })

  describe('when a user (both a matter editor & matter admin) visits a task and adds labels', () => {
    before(() => {
      cy.login(orgAdminUser)
      appPage.visitTaskByName('task 1')

      addLabelToTask('Blocked')

      addRiskToTask('Clarity', 'amber')
      addRiskToTask('Cost', 'green')
      addRiskToTask('Quality')
    })

    it('should display labels section', () => {
      cy.get('[data-test=label-chip-text]').should('have.length', '4')
    })

    describe('when visiting another task and adding labels', () => {
      before(() => {
        cy.login(orgAdminUser)
        appPage.visitTaskByName('task 3')

        addLabelToTask('Blocked')

        addRiskToTask('Clarity', 'amber')
      })

      it('should display labels section', () => {
        cy.get('[data-test=label-chip-text]').should('have.length', '2')
      })

      describe('when a matter admin views the matter admin area', () => {
        before(() => {
          cy.login(orgAdminUser)
          appPage.visitMatter()
          labelsPage.get.labelsPanelItem().click()
        })

        it('should have 3 usage count links with the correct text', () => {
          labelsPage.get.labelsUsageCountLink().should('have.length', '3')
          labelsPage.get
            .labelsUsageCountLink()
            .eq(0)
            .should('have.text', 'Used in 1 task')
          labelsPage.get
            .labelsUsageCountLink()
            .eq(1)
            .should('have.text', 'Used in 2 tasks')
          labelsPage.get
            .labelsUsageCountLink()
            .eq(2)
            .should('have.text', 'Used in 1 task')
        })
      })
      describe('when clicking on a usage count link', () => {
        before(() => {
          labelsPage.get.labelsUsageCountLink().eq(0).click()
        })

        it('should display the label usage dialog', () => {
          cy.get('[data-test=juralio-dialog]').should('be.visible')
          cy.get('[data-test=juralio-dialog]').contains('Label Usage: Cost')
          labelsPage.get
            .labelsUsageCountDialogText()
            .should('have.text', 'Used in 1 task')
          cy.get('[data-test=task-name]')
            .should('be.visible')
            .should('have.length', 1)
            .should('have.text', 'task 1')
        })
        describe('when clicking on the Close button', () => {
          before(() => {
            cy.get('[data-test=action-dialog-button]').click()
          })

          it('should close the label usage dialog', () => {
            cy.get('[data-test=juralio-dialog]').should('not.exist')
          })
        })
      })
      describe('when clicking on the workflow tab', () => {
        before(() => {
          labelsPage.get.workflowTab().click()
        })

        it('should have 1 usage count link with the correct text', () => {
          labelsPage.get
            .labelsUsageCountLink()
            .should('have.length', '1')
            .should('have.text', 'Used in 2 tasks')
        })
      })
    })
  })
})
