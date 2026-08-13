import { getTaskDestinationProjects } from '../../../../../../../helpers/data/task_operations_test_project_data'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { checkTaskMapLevelAndDepthCounts } from '../../../../../../../helpers/taskmap/task-map-helper'
import { openTaskMoveToNewParentTask } from '../../../../../../../helpers/tasks/task_operations_helpers'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../../page/taskdetail/taskdetail_page'

describe('task_move_to_task_destinations.cy', () => {
  let user, appPage, fixture
  let { moveDialog } = taskDetailPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskMoveToTaskDestination',
          teamMembers: [user],
          matterAdmins: [user],
          projects: getTaskDestinationProjects(),
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When the Level D task is moved to Level B', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Beetle')
      openTaskMoveToNewParentTask()

      moveDialog.get.destinationTextField().type('Dog')

      cy.get('[data-test=task-item-name-0]').click()

      cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/move').as(
        'taskMove'
      )
      moveDialog.get.moveButton().click()
      cy.wait('@taskMove')

      cy.wait(2500) // Task cell was not sized so unclickable. Wait until D3 sizes it.
    })

    checkTaskMapLevelAndDepthCounts([
      { depth: 1, expectedCount: 4 },
      { depth: 2, expectedCount: 4 },
      { depth: 3, expectedCount: 2 },
      { depth: 4, expectedCount: 1 },
    ])
  })
})
