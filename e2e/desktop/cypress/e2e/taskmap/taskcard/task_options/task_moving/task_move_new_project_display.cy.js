import { getTaskDestinationProjects } from '../../../../../../../helpers/data/task_operations_test_project_data'
import {
    generateFixture,
    getWrapper
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { openTaskMoveToNewProject } from '../../../../../../../helpers/tasks/task_operations_helpers'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../../page/taskdetail/taskdetail_page'

describe('task_move_new_project_display.cy', () => {
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
          projects: [
            getTaskDestinationProjects()[0],
            {
              name: 'Project',
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When the Move dialog is opened', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Giraffe')
      openTaskMoveToNewProject()
    })

    it('has a destination subtask field', () => {
      moveDialog.get
        .destinationProjectTextField()
        .should('have.attr', 'placeholder', 'Enter name of workstream')
    })

    describe('When there is no Project Selection', () => {
      before(() => {
        moveDialog.get.dialogTitle().click()
      })

      it('should have a disabled move button', () => {
        moveDialog.get.moveButton().should('be.disabled')
      })

      describe('when a different (e.g. Level A) destination option is selected', () => {
        before(() => {
          moveDialog.get.destinationSelectionDropdown().eq(1).click()
          moveDialog.get.destinationOption.levelA().click()
        })

        it('should clear the validation message', () => {
          moveDialog.get.validationMessage().should('not.exist')
        })
      })
    })
  })
})
