import { get3LevelATasksWithSubsData } from '../../../../helpers/data/task_operations_test_project_data'
import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import {
  checkTaskMapLevelAndDepthCounts,
  showDoneTasks,
} from '../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('task_map_status_sorting_subtasks.cy', () => {
  let user, appPage, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskStatusSortingTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: get3LevelATasksWithSubsData(),
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When the tasks status change', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()
      // showDoneTasks()
    })

    checkTaskMapLevelAndDepthCounts([
      {
        depth: 1,
        expectedCount: 3,
        expectedText: ['task1', 'task2', 'task3'],
      },
      {
        depth: 2,
        expectedCount: 9,
        expectedText: [
          'subtask2',
          'subtask3',
          'subtask4',
          'subtask5',
          'subtask6',
          'subtask7',
          'subtask8',
          'subtask9',
          'subtask10',
        ],
      },
      { depth: 3, expectedCount: 0 },
      { depth: 4, expectedCount: 0 },
      { depth: 5, expectedCount: 0 },
      { depth: 6, expectedCount: 0 },
    ])

    describe('When a Level B task status is changed to IN PROGRESS', () => {
      before(() => {
        cy.login(user.username)
        appPage.changeTaskStatus('subtask7', 1)
        cy.get('[data-test=action-dialog-button]').click()
      })

      describe('When the task map is redrawn', () => {
        before(() => {
          cy.login(user.username)
          appPage.visitTaskMap()
        })
        // It is ordered before NOT STARTED siblings.
        checkTaskMapLevelAndDepthCounts([
          {
            depth: 1,
            expectedCount: 3,
            expectedText: ['task2', 'task1', 'task3'],
          },
          {
            depth: 2,
            expectedCount: 9,
            expectedText: [
              'subtask7',
              'subtask5',
              'subtask6',
              'subtask2',
              'subtask3',
              'subtask4',
              'subtask8',
              'subtask9',
              'subtask10',
            ],
          },
        ])
      })
    })

    describe('When a Level B task status is changed to DONE', () => {
      before(() => {
        cy.login(user.username)
        appPage.changeTaskStatus('subtask6', 2)
      })

      describe('When the task map is redrawn', () => {
        before(() => {
          cy.login(user.username)
          appPage.visitTaskMap()
          showDoneTasks()
          // cy.get('body').click()
        })
        // It is ordered before IN PROGRESS and NOT STARTED siblings.
        checkTaskMapLevelAndDepthCounts([
          {
            depth: 1,
            expectedCount: 3,
            expectedText: ['task2', 'task1', 'task3'],
          },
          {
            depth: 2,
            expectedCount: 9,
            expectedText: [
              'subtask6',
              'subtask7',
              'subtask5',
              'subtask2',
              'subtask3',
              'subtask4',
              'subtask8',
              'subtask9',
              'subtask10',
            ],
          },
        ])
      })
    })
  })
})
