import { get3LevelATasksWithSubsData } from '../../../../../helpers/data/task_operations_test_project_data'
import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('task_update_flow.cy', () => {
  let user, appPage, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'task_update_',
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
      appPage.visitTaskByName('subtask5')
    })

    it('should have 1 level tree info', () => {
      cy.get('[data-test=task-level-letter]').should('have.length', 1)
    })

    describe('When a Level B task status is changed to IN PROGRESS', () => {
      before(() => {
        cy.login(user.username)
        appPage.changeTaskStatus('subtask5', 1, true)
      })

      it('The taskcard status should change to "In Progress"', () => {
        cy.get('[data-test=task-header-status-text]').should(
          'have.text',
          'In progress'
        )
      })

      it('should still have 1 level tree info', () => {
        cy.get('[data-test=task-level-letter]').should('have.length', 1)
      })

      describe('and its parent', () => {
        before(() => {
          cy.login(user.username)
          appPage.visitTaskByName('task2')
        })

        it('The taskcard status should change to "In Progress"', () => {
          cy.get('[data-test=task-header-status-text]').should(
            'have.text',
            'In progress'
          )
        })

        it('should have 0 level tree info', () => {
          cy.get('[data-test=task-level-letter]').should('have.length', 0)
        })
      })
    })
  })
})
