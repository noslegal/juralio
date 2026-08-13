import { getCopyProjectWithParentTaskWith8Subtasks } from '../../../../../../helpers/data/task_operations_test_project_data'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { openTemplateTaskMove } from '../../../../../../helpers/tasks/task_operations_helpers'
import { createTemplate } from '../../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../page/taskdetail/taskdetail_page'

describe('template_task_move_max_subtasks_validation.cy', () => {
  let user, appPage, fixture
  const { moveDialog } = taskDetailPage

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TemplateTaskMoveSubtasksValidation',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [getCopyProjectWithParentTaskWith8Subtasks()[0]],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })
  describe('When the template task details are loaded', () => {
    let templateId

    before(() => {
      cy.login(user.username)
      createTemplate('New Template', fixture.projects[0].id).then(template => {
        templateId = template.id
        appPage.visitTemplateTaskMap(templateId)
        cy.wait(5000)
        cy.get('[data-test=task-cell-test]')
          .eq(9)
          .scrollIntoView()
          .click({ force: true })

        openTemplateTaskMove()
        moveDialog.get.destinationSelectionDropdown().click()
        moveDialog.get.destinationOption.newTask().click()
        moveDialog.get.destinationTextField().clear().type('task1')
        cy.get('[data-test=task-item-name-0]')
        cy.get('[data-test=task-item-name-0]').click()
      })
    })

    it('the level A subtask limit validation message should be shown.', () => {
      moveDialog.get.validationMessage().should('be.visible')
      moveDialog.get
        .validationMessage()
        .contains('Tasks cannot have more than 8 subtasks.')
      moveDialog.get.moveButton().should('have.attr', 'disabled')
    })
  })
})
