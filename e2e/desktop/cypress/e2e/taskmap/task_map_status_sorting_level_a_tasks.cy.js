import { get3LevelATasksWithSubsData } from '../../../../helpers/data/task_operations_test_project_data'
import {
    generateFixture,
    getWrapper
} from '../../../../helpers/matterprojects/fixture_helper'
import {
    checkTaskMapLevelAndDepthCounts,
    showDoneTasks
} from '../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('task_map_status_sorting_level_a_tasks.cy', () => {
  let user, appPage, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskLevelAStatusSortingTest',
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

    describe('When a Level A task status is changed to IN PROGRESS', () => {
      before(() => {
        cy.login(user.username)
        appPage.changeTaskStatus('task2', 1)
      })

      describe('When the task map is redrawn', () => {
        before(() => {
          cy.login(user.username)
          appPage.visitTaskMap()
          // showDoneTasks()
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
              'subtask5',
              'subtask6',
              'subtask7',
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

    describe('When a Level A task status is changed to DONE', () => {
      before(() => {
        cy.login(user.username)
        appPage.changeTaskStatus('task3', 2, true)
      })

      describe('When the task map is redrawn', () => {
        before(() => {
          cy.login(user.username)
          appPage.visitTaskMap()
          showDoneTasks()
          // cy.get('body').click()
        })
        // It is ordered before IN PROGRESS and NOT STARTED  siblings.
        checkTaskMapLevelAndDepthCounts([
          {
            depth: 1,
            expectedCount: 3,
            expectedText: ['task3', 'task2', 'task1'],
          },
          {
            depth: 2,
            expectedCount: 9,
            expectedText: [
              'subtask8',
              'subtask9',
              'subtask10',
              'subtask5',
              'subtask6',
              'subtask7',
              'subtask2',
              'subtask3',
              'subtask4',
            ],
          },
        ])
      })
    })
  })
})
