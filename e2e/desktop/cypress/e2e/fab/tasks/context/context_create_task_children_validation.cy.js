import { getProjectWithParentTaskWith8Subtasks } from '../../../../../../helpers/data/task_operations_test_project_data'
import destinationHelper from '../../../../../../helpers/destinationdialog/destination-dialog-helper'
import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import snackbarHelper from '../../../../../../helpers/snackbar/snackbar-helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

describe('context_create_task_children_validation.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then((createdUser) => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'testmattertaskcreate',
          teamMembers: [user],
          matterAdmins: [user],
          projects: getProjectWithParentTaskWith8Subtasks(),
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when creating a Task in context', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('task1')
      destinationHelper.openTaskCreateFlowFromFab()
    })

    snackbarHelper.checkShownAndHasExpectedText(
      'Tasks cannot have more than 8 subtasks.'
    )
  })
})
