import { getProjectWith16LevelATasks } from '../../../../../../../helpers/data/task_operations_test_project_data'
import {
    generateFixture,
    getWrapper
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import {
    openTaskMoveToLevelA,
    openTaskMoveToNewProject
} from '../../../../../../../helpers/tasks/task_operations_helpers'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../../page/taskdetail/taskdetail_page'

describe('task_move_level_a_max_tasks.cy', () => {
  let user, appPage, fixture
  let { moveDialog } = taskDetailPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskMoveLevelAMaxTasks',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            getProjectWith16LevelATasks('Finch')[0],
            getProjectWith16LevelATasks('Magpie')[0],
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When the Move dialog is opened on a task in a project with 16 level A tasks', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Finch')
      openTaskMoveToLevelA()
    })

    checkValidationMessageShownAndMoveButtonDisabled(
      'A workstream cannot have more than 16 level A tasks.'
    )

    describe('When the destination type is changed', () => {
      before(() => {
        moveDialog.get.destinationSelectionDropdown().eq(0).click()
        moveDialog.get.destinationOption.newProject().click()
        cy.wait(2000)
        cy.get('[data-test=destination-selection-dropdown]').eq(1).click()
        cy.get('[data-test=destination-level-a]').click()
      })

      it('should no longer display the validation message', () => {
        moveDialog.get.validationMessage().should('not.exist')
      })

      it('should enable the move button', () => {
        moveDialog.get.moveButton().should('not.have.attr', 'disabled')
      })

      describe('When the destination project that has 16 level A tasks is selected', () => {
        before(() => {
          cy.login(user.username)
          appPage.visitTaskByName('Magpie')
          openTaskMoveToNewProject()
          cy.wait(2000)
          cy.get('[data-test=destination-selection-dropdown]').eq(1).click()
          cy.get('[data-test=destination-level-a]').click()
          moveDialog.get.moveButton().click()
        })

        it('A project cannot have more than 16 level A tasks.', () => {
          cy.get('[data-test=task-move-error]').contains(
            'There are already 16 level A tasks'
          )
        })

        describe('When the destination type is changed', () => {
          before(() => {
            moveDialog.get.destinationSelectionDropdown().eq(0).click()
            moveDialog.get.destinationOption.newTask().click()
          })

          it('should no longer display the validation message', () => {
            moveDialog.get.validationMessage().should('not.exist')
          })
        })
      })
    })
  })

  function checkValidationMessageShownAndMoveButtonDisabled(validationText) {
    it('should display the validation message', () => {
      moveDialog.get.validationMessage().should('be.visible')
    })

    it('should display the validation text "' + validationText + '"', () => {
      moveDialog.get.validationMessage().contains(validationText)
    })

    it('should enable the move button', () => {
      moveDialog.get.moveButton().should('have.attr', 'disabled')
    })
  }
})
