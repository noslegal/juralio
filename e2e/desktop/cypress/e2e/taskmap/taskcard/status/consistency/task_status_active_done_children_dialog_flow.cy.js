import { get3LevelATasksWithSubsData } from '../../../../../../../helpers/data/task_operations_test_project_data'
import {
    generateFixture,
    getWrapper
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'

describe('task_status_active_done_children_dialog_flow.cy', () => {
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

  describe('When the task parent status is DONE and has active children', () => {
    before(() => {
      cy.login(user.username)
      appPage.changeTaskStatus('task2', 2, true)
    })

    it('should have an initial state of "Done"', () => {
      cy.get('[data-test=task-header-status-text]').should('have.text', 'Done')
    })

    it('should have children statuses as "Completed"', () => {
      cy.get('[data-test=status-header]').should('have.text', 'Completed')
    })
    describe('When a parent task status is changed to NOT STARTED', () => {
      before(() => {
        cy.login(user.username)
        appPage.changeTaskStatus('task2', 0)
      })

      describe('a dialog should be displayed', () => {
        it('should have the correct title', () => {
          cy.get('[data-test=dialog-header-title-text]').should(
            'have.text',
            'Status changes: task2'
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
          it('The taskcard should still have the state of "Done"', () => {
            cy.get('[data-test=task-header-status-text]').should(
              'have.text',
              'Done'
            )
          })
        })

        describe('Clicking the continue button', () => {
          before(() => {
            cy.login(user.username)
            appPage.changeTaskStatus('task2', 0, true)
          })

          it('should no longer display the dialog', () => {
            cy.get('[data-test=dialog-prompt-text]').should('not.exist')
          })

          it('The taskcard status should change to "Not Started"', () => {
            cy.get('[data-test=task-header-status-text]').should(
              'have.text',
              'Not started'
            )
          })

          it('should have children statuses as "Not Started"', () => {
            cy.get('[data-test=status-header]').should(
              'have.text',
              'Not started'
            )
          })

          describe('and its children should persist the change', () => {
            before(() => {
              cy.login(user.username)
              appPage.visitTaskByName('subtask5')
            })

            it('The child taskcard status should change to "Not Started"', () => {
              cy.get('[data-test=task-header-status-text]').should(
                'have.text',
                'Not started'
              )
            })
          })
        })
      })
    })
  })
})
