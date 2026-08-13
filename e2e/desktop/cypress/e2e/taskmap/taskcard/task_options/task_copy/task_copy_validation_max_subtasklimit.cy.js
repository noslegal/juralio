import { getCopyProjectWithParentTaskWith8Subtasks } from '../../../../../../../helpers/data/task_operations_test_project_data'
import {
    generateFixture,
    getWrapper
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import snackbarHelper from '../../../../../../../helpers/snackbar/snackbar-helper'
import { openTaskCopy } from '../../../../../../../helpers/tasks/task_operations_helpers'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'

describe('task_copy_validation_max_subtasklimit.cy', () => {
  let user, appPage, fixture

  before(() => {
    createUser().then((createdUser) => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskCopyInvalidDestinationTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [getCopyProjectWithParentTaskWith8Subtasks()[0]],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When the Copy dialog is opened and a task with maximum subtasks selected', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('subtask1')
      openTaskCopy()
    })

    snackbarHelper.checkShownAndHasExpectedText(
      'This task cannot be copied because its parent already has 8 subtasks'
    )
  })
})
