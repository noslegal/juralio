import { get3LevelATasksWithSubsData } from '../../../../../../../helpers/data/task_operations_test_project_data'
import {
    generateFixture,
    getWrapper
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'

describe('task_status_parents_not_started_dialog_flow.cy', () => {
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
      appPage.visitTaskByName('subtask5')
    })

    it('should have an initial state of "Not Started"', () => {
      cy.get('[data-test=task-header-status-text]').should(
        'have.text',
        'Not started'
      )
    })
    describe('When a Level B task status is changed to IN PROGRESS', () => {
      before(() => {
        cy.login(user.username)
        appPage.changeTaskStatus('subtask5', 2)
      })

      describe('a dialog should be displayed', () => {
        it('should have the correct title', () => {
          cy.get('[data-test=dialog-header-title-text]').should(
            'have.text',
            'Status changes: subtask5'
          )
        })
        it('should display the confirmation dialog', () => {
          cy.get('[data-test=dialog-prompt-text]').should(
            'have.text',
            'The following changes will be made. Are you sure you want to continue?'
          )
        })
        it('should display the chip with the changed tasks', () => {
          cy.get('[data-test=task-update-chip]').should('exist')
        })

        describe('Clicking the Cancel button ', () => {
          before(() => {
            cy.get('[data-test=cancel-dialog-button]').click()
          })
          it('should no longer display the dialog', () => {
            cy.get('[data-test=dialog-prompt-text]').should('not.exist')
          })
          it('The taskcard should still have the state of "Not Started"', () => {
            cy.get('[data-test=task-header-status-text]').should(
              'have.text',
              'Not started'
            )
          })
        })

        describe('Clicking the continue button', () => {
          before(() => {
            cy.login(user.username)
            appPage.changeTaskStatus('subtask5', 1, true)
          })

          it('should no longer display the dialog', () => {
            cy.get('[data-test=dialog-prompt-text]').should('not.exist')
          })

          it('The taskcard status should change to "In Progress"', () => {
            cy.get('[data-test=task-header-status-text]').should(
              'have.text',
              'In progress'
            )
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
          })
        })
      })
    })
  })
})
