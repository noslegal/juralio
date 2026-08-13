import { getProjectAtoCLevelData } from '../../../../../../../helpers/data/task_operations_test_project_data'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { checkTaskMapLevelAndDepthCounts } from '../../../../../../../helpers/taskmap/task-map-helper'
import { openTaskMoveTask } from '../../../../../../../helpers/tasks/task_operations_helpers'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../../page/taskdetail/taskdetail_page'

describe('task_move_level_a.cy', () => {
  let user, appPage, fixture
  let { moveDialog } = taskDetailPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskMoveTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: getProjectAtoCLevelData(),
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When the taskmap is initially rendered', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()
    })

    checkTaskMapLevelAndDepthCounts([
      { depth: 1, expectedCount: 2 },
      { depth: 2, expectedCount: 6 },
    ])

    describe('when the move menu item is clicked', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('subtask2')
        openTaskMoveTask()
      })

      it('should display the move task dialog', () => {
        moveDialog.get.dialogTitle().should('be.visible')
      })

      it('has a drop down select', () => {
        moveDialog.get.destinationSelectionDropdown().should('be.visible')
      })

      describe('When the destination drop down is clicked', () => {
        before(() => {
          moveDialog.get.destinationSelectionDropdown().click()
        })

        it('has a drop down select menu - first item is "Select destination"', () => {
          moveDialog.get
            .destinationPrompt()
            .should('have.text', 'Select destination')
        })

        it('has a dropdown select menu - second item is "level A"', () => {
          moveDialog.get.destinationOption
            .levelA()
            .should('contain.text', 'As a new phase')
        })
      })

      describe('when the Cancel button is clicked', () => {
        before(() => {
          moveDialog.get.cancelButton().click({ force: true })
        })

        it('should NOT display the Move task dialog', () => {
          moveDialog.get.dialogTitle().should('not.exist')
        })
      })

      describe('when the Move button is clicked with nothing selected', () => {
        before(() => {
          openTaskMoveTask()
        })

        it('should have a disabled button', () => {
          moveDialog.get.moveButton().should('be.disabled')
        })

        describe('When a valid selection is made in the dropdown', () => {
          before(() => {
            moveDialog.get.destinationSelectionDropdown().click()
            moveDialog.get.destinationOption.levelA().click()
          })

          it('should not render the validation message', () => {
            moveDialog.get.validationMessage().should('not.exist')
          })
        })
      })

      describe('when the Move button is clicked with a valid selection', () => {
        before(() => {
          moveDialog.get.destinationSelectionDropdown().click()
          moveDialog.get.destinationOption.levelA().click()
          cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/move').as(
            'taskMove'
          )
          moveDialog.get.moveButton().click()
          cy.wait('@taskMove')
        })

        it('should close the Move dialog', () => {
          moveDialog.get.dialogTitle().should('not.exist')
        })
      })
    })
  })
  describe('the task should have moved', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()
    })

    checkTaskMapLevelAndDepthCounts([
      { depth: 1, expectedCount: 3 },
      { depth: 2, expectedCount: 5 },
    ])

    describe('the moved task on level A', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('subtask2')
      })

      it('should display a task name of -"Subtask1"', () => {
        taskDetailPage.get.taskDetailName().should('have.text', 'subtask2')
      })

      it('should display a task level of - "A"', () => {
        taskDetailPage.get.jurNumber().should('contain', 'A')
      })
    })
  })
})
