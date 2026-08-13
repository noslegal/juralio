import { getProjectAToFLevelData } from '../../../../../../../helpers/data/task_operations_test_project_data'
import {
    generateFixture,
    getWrapper
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'

describe('task_status_done_children_dialog_flow.cy', () => {
  let user, appPage, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'ATest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: getProjectAToFLevelData(),
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When a parent is in progress', () => {
    before(() => {
      cy.login(user.username)
      appPage.changeTaskStatus('task2 A', 1)
      
    })

    it('should have an initial state of "In Progress"', () => {
      cy.get('[data-test=task-header-status-text]').should(
        'have.text',
        'In progress'
      )
    })
    describe('When a Level B (child) task status is changed to DONE', () => {
      before(() => {
        cy.login(user.username)
        appPage.changeTaskStatus('subtask7 B', 2)
      })

      describe('a dialog should be displayed', () => {
        it('should have the correct title', () => {
          cy.get('[data-test=dialog-header-title-text]').should(
            'have.text',
            'Status changes: subtask7 B'
          )
        })
        it('should display the confirmation dialog', () => {
          cy.get('[data-test=dialog-prompt-text]').should(
            'have.text',
            'The following changes will be made. Are you sure you want to continue?'
          )
        })
        it('should display the counter with the number of tasks that have been changes', () => {
          cy.get('[data-test=change-counter]').should('contain', '4')
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
          it('The children subtasks should be "Not started"', () => {
            cy.get('[data-test=status-header]').should(
              'have.text',
              'Not started'
            )
          })
        })

        describe('Clicking the continue button', () => {
          before(() => {
            cy.login(user.username)
            appPage.changeTaskStatus('subtask7 B', 2, true)
            
          })

          it('should no longer display the dialog', () => {
            cy.get('[data-test=dialog-prompt-text]').should('not.exist')
          })

          it('The taskcard status should change to "Done"', () => {
            cy.get('[data-test=task-header-status-text]').should(
              'have.text',
              'Done'
            )
          })

          it('The child subtask should be "Completed"', () => {
            cy.get('[data-test=status-header]').should('have.text', 'Completed')
          })

          describe('and its child task should persist status', () => {
            before(() => {
              cy.login(user.username)
              appPage.visitTaskByName('subtask8 C')
              
            })

            it('should have a status of  "Done"', () => {
              cy.get('[data-test=task-header-status-text]').should(
                'have.text',
                'Done'
              )
            })
          })
        })
      })
    })
  })
})
