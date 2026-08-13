import { get3LevelATasksWithSubsData } from '../../../../../../helpers/data/task_operations_test_project_data'
import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createTaskFromFabInContext } from '../../../../../../helpers/tasks/task_create_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

describe('context_consistency_create_task_done_parent.cy', () => {
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

  describe('When the tasks parent is done', () => {
    before(() => {
      cy.login(user.username)
      appPage.changeTaskStatus('task2', 2, true)
    })

    it('should have an initial status of "Done"', () => {
      cy.get('[data-test=task-header-status-text]').should('have.text', 'Done')
    })

    describe('and a new child task is created', () => {
      before(() => {
        cy.login(user.username)
        createTaskFromFabInContext('child of done')
      })

      describe('the created task should persist its parents status', () => {
        before(() => {
          cy.get('[data-test=task-cell-test]')
            .last()
            .click()
        })
        it('should have a status of "Done"', () => {
          cy.get('[data-test=task-header-status-text]').should(
            'have.text',
            'Done'
          )
        })
      })
    })
  })
})
