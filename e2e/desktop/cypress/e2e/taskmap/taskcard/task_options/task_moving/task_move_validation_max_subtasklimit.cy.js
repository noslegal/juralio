import { getMoveProjectWithParentTaskWith8Subtasks } from '../../../../../../../helpers/data/task_operations_test_project_data'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { openTaskMoveToNewParentTask } from '../../../../../../../helpers/tasks/task_operations_helpers'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../../page/taskdetail/taskdetail_page'

describe('task_move_validation_max_subtasklimit.cy', () => {
  let user, appPage, fixture
  let { moveDialog } = taskDetailPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskMoveNewProjectDestinationTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [getMoveProjectWithParentTaskWith8Subtasks()[0]],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When the Move dialog is opened and a task with maximum subtasks selected', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('a task to move')
      openTaskMoveToNewParentTask()
      moveDialog.get.destinationTextField().type('task1')
      cy.get('[data-test=task-item-name-0]').click()
    })

    it('should display the validation message', () => {
      moveDialog.get.validationMessage().should('be.visible')
    })

    it('should disable the move button', () => {
      moveDialog.get.moveButton().should('have.attr', 'disabled')
    })

    describe('When a task with less than maximum subtasks selcted', () => {
      before(() => {
        moveDialog.get.destinationTextField().clear().type('subtask1')
        cy.get('[data-test=task-item-name-0]')
        cy.get('[data-test=task-item-name-0]').click()
      })

      it('should enable the move button', () => {
        moveDialog.get.moveButton().should('not.have.attr', 'disabled')
      })
    })
  })
  describe('When in task move error state', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('a task to move')
      openTaskMoveToNewParentTask()
      moveDialog.get.destinationTextField().type('task1')
      cy.get('[data-test=task-item-name-0]')
      cy.get('[data-test=task-item-name-0]').click()
    })

    it('should clear the validation message', () => {
      moveDialog.get.validationMessage().should('be.visible')
    })

    it('should disable the move button', () => {
      moveDialog.get.moveButton().should('have.attr', 'disabled')
    })
  })
})
