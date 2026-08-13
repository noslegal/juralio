import { getProjectAToFLevelData } from '../../../../../../../helpers/data/task_operations_test_project_data'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { openTaskMoveTask } from '../../../../../../../helpers/tasks/task_operations_helpers'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../../page/taskdetail/taskdetail_page'

describe('task_move_to_level_a_display.cy', () => {
  let user, appPage, fixture
  const { moveDialog } = taskDetailPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskMoveNewParentTaskTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: getProjectAToFLevelData(),
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When the Move dialog is opened', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('subtask2 B')
      openTaskMoveTask()
      moveDialog.get.destinationSelectionDropdown().click()
    })

    it('has a dropdown select menu - third item item is "Under an existing task"', () => {
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
          .should('have.attr', 'placeholder', 'Enter name of task')
      })

      describe('when the Move button is clicked with no Task destination selection', () => {
        before(() => {
          moveDialog.get.moveButton().click()
        })

        it('should display the validation message', () => {
          moveDialog.get.validationMessage().should('be.visible')
        })

        describe('when a different (Level A) option is selected', () => {
          before(() => {
            moveDialog.get.destinationSelectionDropdown().click()
            moveDialog.get.destinationOption.levelA().click()
          })

          it('should clear the validation message', () => {
            moveDialog.get.validationMessage().should('not.exist')
          })
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
