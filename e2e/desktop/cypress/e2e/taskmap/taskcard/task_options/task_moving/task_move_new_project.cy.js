import {
  getProjectAtoCLevelData,
  getTaskDestinationProjects,
} from '../../../../../../../helpers/data/task_operations_test_project_data'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../../helpers/matterprojects/visit_helpers'
import { checkTaskMapLevelAndDepthCounts } from '../../../../../../../helpers/taskmap/task-map-helper'
import { openTaskMoveToNewProject } from '../../../../../../../helpers/tasks/task_operations_helpers'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../../page/taskdetail/taskdetail_page'

const visitHelpers = new VisitHelpers()
describe('task_move_new_project.cy', () => {
  let user, appPage, fixture
  let { moveDialog } = taskDetailPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskMoveNewProjectDestinationMoveTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            getTaskDestinationProjects()[0],
            getProjectAtoCLevelData()[0],
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When tasks are moved between projects as level a', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Giraffe')
      openTaskMoveToNewProject()
      cy.wait(2000)

      cy.get('[data-test=destination-selection-dropdown]').eq(1).click()
      cy.get('[data-test=destination-level-a]').click()

      cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/move').as(
        'taskMove'
      )
      moveDialog.get.moveButton().click()
      cy.wait('@taskMove')
    })

    checkPostMoveState()
  })

  describe('When tasks are moved between projects as a subtask', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Panda')
      openTaskMoveToNewProject()
      cy.wait(2000)

      cy.get('[data-test=destination-selection-dropdown]').eq(1).click()
      cy.get('[data-test=destination-subtask-of]').click()

      cy.get('[data-test=task-select-base]').click()

      cy.wait(3000)

      cy.get('[data-test=search-result-list-item]').eq(0).click()

      cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/move').as(
        'taskMove'
      )
      moveDialog.get.moveButton().click()
      cy.wait('@taskMove')
    })

    describe('The Destination Project is as expected', () => {
      before(() => {
        cy.login(user.username)
        visitHelpers.visitTaskMap(
          fixture.matter.id,
          fixture.projects[1].id,
          false
        )
        // appPage.visitTaskMap(1)
      })

      checkTaskMapLevelAndDepthCounts([
        {
          depth: 1,
          expectedCount: 3,
          expectedText: ['task1', 'task2', 'Giraffe'],
        },
        {
          depth: 2,
          expectedCount: 7,
          expectedText: [
            'subtask2',
            'subtask3',
            'subtask4',
            'subtask5',
            'subtask6',
            'subtask7',
            'Swallow',
          ],
        },
        { depth: 3, expectedCount: 2, expectedText: ['Panda', 'Spider'] },
        {
          depth: 4,
          expectedCount: 3,
          expectedText: ['Swan', 'Crow', 'Beetle'],
        },
        { depth: 5, expectedCount: 1, expectedText: ['Ant'] },
        { depth: 6, expectedCount: 1, expectedText: ['Amoeba'] },
      ])
    })

    describe('The Source Project is as expected', () => {
      before(() => {
        cy.login(user.username)
        // appPage.visitTaskMap(0)
        visitHelpers.visitTaskMap(
          fixture.matter.id,
          fixture.projects[0].id,
          false
        )
      })

      checkTaskMapLevelAndDepthCounts([
        {
          depth: 1,
          expectedCount: 2,
          expectedText: ['Dog', 'Bear'],
        },
      ])
    })
  })

  function checkPostMoveState() {
    describe('The Destination Project is as expected', () => {
      before(() => {
        cy.login(user.username)
        // appPage.visitTaskMap(1)
        visitHelpers.visitTaskMap(
          fixture.matter.id,
          fixture.projects[1].id,
          false
        )
      })

      checkTaskMapLevelAndDepthCounts([
        { depth: 1, expectedCount: 3, expectedText: ['task1', 'task2'] },
        {
          depth: 2,
          expectedCount: 7,
          expectedText: [
            'subtask2',
            'subtask3',
            'subtask4',
            'subtask5',
            'subtask6',
            'subtask7',
            'Swallow',
          ],
        },
        { depth: 3, expectedCount: 1, expectedText: ['Spider'] },
        { depth: 4, expectedCount: 1, expectedText: ['Beetle'] },
        { depth: 5, expectedCount: 1, expectedText: ['Ant'] },
        { depth: 6, expectedCount: 1, expectedText: ['Amoeba'] },
      ])
    })

    describe('The Source Project is as expected', () => {
      before(() => {
        cy.login(user.username)
        // appPage.visitTaskMap(0)
        visitHelpers.visitTaskMap(
          fixture.matter.id,
          fixture.projects[0].id,
          false
        )
      })

      checkTaskMapLevelAndDepthCounts([
        {
          depth: 1,
          expectedCount: 3,
          expectedText: ['Panda', 'Dog', 'Bear'],
        },
        { depth: 2, expectedCount: 2, expectedText: ['Swan', 'Crow'] },
      ])
    })
  }
})
