import {
  addLabelToTask,
  createMatterLabel,
} from '../../../../../helpers/labels/labels_api_helper'
import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { updateFTUE } from '../../../../../helpers/users/user_api_helper'
import labelsPage from '../../../../../page/organisation/organisation_labels_page'

describe('matter_admin_deleted_task_label.cy', () => {
  let organisation, orgAdminUser, appPage, fixture
  const visitHelpers = new VisitHelpers()

  before(() => {
    setupOrganisationWithMatter(true, [{ name: 'Task 1' }]).then(result => {
      organisation = result.organisationLabels
      orgAdminUser = result.orgAdminUser
      updateFTUE(orgAdminUser, { hasSeenMatterAdmin: true })
      appPage = result.appPage
      fixture = result.fixture

      createMatterLabel(
        orgAdminUser,
        fixture.matter.id,
        'deleted',
        'risk'
      ).then(res =>
        addLabelToTask(
          orgAdminUser,
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id,
          res.body.id
        )
      )

      createMatterLabel(orgAdminUser, fixture.matter.id, 'not deleted', 'risk')

      createMatterLabel(
        orgAdminUser,
        fixture.matter.id,
        'not deleted 2',
        'risk'
      ).then(res =>
        addLabelToTask(
          orgAdminUser,
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id,
          res.body.id
        )
      )

      createMatterLabel(
        orgAdminUser,
        fixture.matter.id,
        'del Workflow',
        'workflow'
      ).then(res =>
        addLabelToTask(
          orgAdminUser,
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id,
          res.body.id,
          null
        )
      )

      createMatterLabel(
        orgAdminUser,
        fixture.matter.id,
        'not del Workflow',
        'workflow'
      )

      createMatterLabel(
        orgAdminUser,
        fixture.matter.id,
        'not del 2 Workflow',
        'workflow'
      ).then(res =>
        addLabelToTask(
          orgAdminUser,
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id,
          res.body.id,
          null
        )
      )
    })
  })

  describe('when a matter label is assigned to a task and then deleted', () => {
    before(() => {
      cy.login(orgAdminUser)
      visitHelpers.visitMatterLabels(fixture.matter.id, true)

      labelsPage.get.deleteLabelButton().eq(0).click()
      cy.get('[data-test=action-dialog-button]').click()

      labelsPage.get.workflowTab().click()
      labelsPage.get.deleteLabelButton().eq(0).click()
      cy.get('[data-test=action-dialog-button]').click()

      cy.reload()
      labelsPage.get.labelsPanelItem().click()
    })

    it('should display the matter labels in the sorted order', () => {
      // first by active/inactive, then usage, and then alphabetically
      labelsPage.get
        .listRisksBespoke()
        .eq(0)
        .should('have.text', 'not deleted 2')
      labelsPage.get.listRisksBespoke().eq(1).should('have.text', 'not deleted')
      labelsPage.get.listRisksBespoke().eq(2).should('have.text', 'deleted')
    })

    it('should display the deleted label with strikethrough text and no delete button', () => {
      labelsPage.get.deletedLabelListItem().should('have.length', 1)
      labelsPage.get
        .listRisksBespoke()
        .eq(2)
        .should(
          'have.css',
          'text-decoration',
          'line-through solid rgb(51, 50, 50)'
        )
      labelsPage.get
        .deletedLabelListItemText()
        .eq(0)
        .should('have.text', 'Deleted')
    })

    describe('when adding a label with the same name as a deleted one that is in use', () => {
      before(() => {
        labelsPage.get.addLabelButton().click()
        labelsPage.get.labelTextField().type('deleted')
        labelsPage.get.saveLabelButton().click()
      })

      it('reload the label list and the deleted label should display as an active one', () => {
        cy.login(orgAdminUser)
        visitHelpers.visitMatterLabels(fixture.matter.id, true)
        labelsPage.get.listRisksBespoke().eq(0).should('have.text', 'deleted')
        labelsPage.get
          .labelsUsageCountLink()
          .eq(0)
          .should('have.text', 'Used in 1 task')
        labelsPage.get.deleteLabelButton().eq(0).should('be.visible')
      })
    })

    describe('when visiting the workflow tab', () => {
      before(() => {
        labelsPage.get.workflowTab().click()
      })

      it('should display the matter labels in the sorted order', () => {
        // first by active/inactive, then usage, and then alphabetically
        labelsPage.get
          .listWorkflowBespoke()
          .eq(0)
          .should('have.text', 'not del 2 Workflow')
        labelsPage.get
          .listWorkflowBespoke()
          .eq(1)
          .should('have.text', 'not del Workflow')
        labelsPage.get
          .listWorkflowBespoke()
          .eq(2)
          .should('have.text', 'del Workflow')
      })

      it('should display the deleted label with strikethrough text and no delete button', () => {
        labelsPage.get.deletedLabelListItem().should('have.length', 1)
        labelsPage.get
          .listWorkflowBespoke()
          .eq(2)
          .should(
            'have.css',
            'text-decoration',
            'line-through solid rgb(255, 255, 255)'
          )
        labelsPage.get
          .deletedLabelListItemText()
          .eq(0)
          .should('have.text', 'Deleted')
      })
    })
  })
})
