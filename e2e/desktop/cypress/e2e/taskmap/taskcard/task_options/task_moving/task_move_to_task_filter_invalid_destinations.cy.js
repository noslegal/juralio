import { getTaskDestinationProjects } from '../../../../../../../helpers/data/task_operations_test_project_data'
import {
    generateFixture,
    getWrapper
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { checkTaskMapLevelAndDepthCounts } from '../../../../../../../helpers/taskmap/task-map-helper'
import {
    checkListOfTasks,
    openTaskMoveToNewParentTask
} from '../../../../../../../helpers/tasks/task_operations_helpers'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'


describe('task_move_to_task_filter_invalid_destinations.cy', () => {
  let user, appPage, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskMoveNewParentDestinationTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: getTaskDestinationProjects(),
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
      { depth: 1, expectedCount: 4 },
      { depth: 2, expectedCount: 3 },
      { depth: 3, expectedCount: 1 },
      { depth: 4, expectedCount: 1 },
      { depth: 5, expectedCount: 1 },
      { depth: 6, expectedCount: 1 },
    ])
  })

  describe('When the Move dialog is opened - Level F task', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Amoeba')
      openTaskMoveToNewParentTask()
    })

    it('should display a list of valid destination tasks', () => {
      checkListOfTasks([
        ['Panda'],
        ['Swan'],
        ['Crow'],
        ['Dog'],
        ['Bear'],
        ['Giraffe'],
        ['Swallow'],
        ['Spider'],
        ['Beetle'],
      ])
    })
  })

  describe('When the Move dialog is opened - Level B task and 4 levels of children', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Swallow')
      openTaskMoveToNewParentTask()
    })

    it('should display a list of valid destination tasks', () => {
      checkListOfTasks([['Panda'], ['Swan'], ['Crow'], ['Dog'], ['Bear']])
    })
  })

  describe('When the Move dialog is opened - Level A task and 6 levels of children', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Giraffe')
      openTaskMoveToNewParentTask()
    })

    it('there are no valid targets', () => {
      cy.get('[data-test=task-item-name-0]').should('not.exist')
    })
  })

  describe('When the Move dialog is opened - Level A task and 1 level of children', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Panda')
      openTaskMoveToNewParentTask()
    })

    it('should display a list of tasks', () => {
      checkListOfTasks([
        ['Dog'],
        ['Bear'],
        ['Giraffe'],
        ['Swallow'],
        ['Spider'],
        ['Beetle'],
        ['Ant'],
        ['Amoeba'],
      ])
    })
  })

  describe('When the Move dialog is opened - Level A task and 0 children move to Level 5 parent', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Dog')
      openTaskMoveToNewParentTask()
    })

    it('should display a list of tasks', () => {
      checkListOfTasks([
        ['Panda'],
        ['Swan'],
        ['Crow'],
        ['Bear'],
        ['Giraffe'],
        ['Swallow'],
        ['Spider'],
        ['Beetle'],
        ['Ant'],
        ['Amoeba'],
      ])
    })
  })
})
