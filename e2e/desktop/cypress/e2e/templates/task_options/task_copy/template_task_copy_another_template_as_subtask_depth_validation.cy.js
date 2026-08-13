import {
  getProjectAtoCLevelData,
  getProjectForValidation,
} from '../../../../../../helpers/data/task_operations_test_project_data'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { openTemplateTaskCopy } from '../../../../../../helpers/tasks/task_operations_helpers'
import { createTemplate } from '../../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../page/taskdetail/taskdetail_page'

describe('template_task_copy_another_template_as_subtask_depth_validation.cy', () => {
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
          projects: [
            getProjectForValidation()[0],
            getProjectAtoCLevelData()[0],
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })
  describe('When the template task details are loaded', () => {
    let templateId, templateId2

    before(() => {
      cy.login(user.username)

      createTemplate('New Template', fixture.projects[0].id).then(template => {
        templateId = template.id
      })
      createTemplate('New Template2', fixture.projects[1].id).then(template => {
        templateId2 = template.id
      })
    })

    it('the level A subtask limit validation message should be shown.', () => {
      appPage.visitTemplateTaskMap(templateId2)
      cy.wait(5000)
      cy.get('[data-test=task-cell-test]')
        .eq(2)
        .scrollIntoView()
        .click({ force: true })

      openTemplateTaskCopy()
      cy.get('[data-test=new-task-name-text-field]')
        .find('input')
        .type('Target Copy Task')
      cy.get('[data-test=new-task-destination-type]').click()
      cy.get('[data-test=another-template]').click()
      cy.get('[data-test=dialog-content] [data-test=auto-complete-search-term]')
        .find('input')
        .type('New Template')
      cy.get('[data-test=search-result-list-item]').first().click()
      cy.wait(2000)
      moveDialog.get.destinationSelectionDropdown().click()
      moveDialog.get.destinationOption.newTask().click()
      moveDialog.get.destinationTextField().clear().type('subtask F')
      cy.get('[data-test=task-item-name-0]')
      cy.get('[data-test=task-item-name-0]').click()
      cy.get('[data-test="template-selection-validation-message"]').contains(
        'Tasks cannot have more than 5 levels of subtasks.'
      )
      moveDialog.get.moveButton().should('have.attr', 'disabled')
    })
  })
})
