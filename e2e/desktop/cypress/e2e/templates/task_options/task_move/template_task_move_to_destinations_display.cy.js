import { getProjectAToFLevelData } from '../../../../../../helpers/data/task_operations_test_project_data'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import { openTemplateTaskMove } from '../../../../../../helpers/tasks/task_operations_helpers'
import {
  createTemplate,
  createTemplateTask,
} from '../../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../page/taskdetail/taskdetail_page'

describe('template_task_move_to_destinations_display.cy', () => {
  let user, appPage, fixture, visitHelpers
  const { moveDialog } = taskDetailPage

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TemplateTaskMoveNewParentTaskTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: getProjectAToFLevelData(),
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
      visitHelpers = new VisitHelpers()
    })
  })
  describe('When the template task details are loaded', () => {
    let templateId, templateTaskId
    const templateTaskName = 'Test Template Task'

    before(() => {
      cy.login(user.username)
      createTemplate('New Template', fixture.projects[0].id)
        .then(template => {
          templateId = template.id
          return createTemplateTask(templateId, null, templateTaskName)
        })
        .then(templateTask => {
          templateTaskId = templateTask.id
          return visitHelpers.visitTemplateTaskDetails(
            templateId,
            templateTaskId
          )
        })
    })
    describe('When the Move dialog is opened', () => {
      before(() => {
        openTemplateTaskMove()
        moveDialog.get.destinationSelectionDropdown().click()
      })

      it('has a dropdown select menu - with subtask and level a options', () => {
        moveDialog.get.destinationOption
          .newTask()
          .should('have.text', 'As a subtask')
      })

      describe('When the "Under an existing task" item is clicked', () => {
        before(() => {
          moveDialog.get.destinationOption.newTask().click()
        })

        it('has a destination subtask field', () => {
          moveDialog.get
            .destinationTextField()
            .should('have.attr', 'placeholder', 'Choose a template task')
        })

        describe('when the Move button is clicked with no Task destination selection', () => {
          before(() => {
            moveDialog.get.moveButton().click()
          })

          it('should display the validation message', () => {
            moveDialog.get.validationMessage().should('be.visible')
          })
        })

        describe('when the Cancel button is clicked', () => {
          before(() => {
            moveDialog.get.cancelButton().click()
          })

          it('should no longer display the Move task dialog', () => {
            moveDialog.get.dialogTitle().should('not.exist')
          })
        })
      })
    })
  })
})
