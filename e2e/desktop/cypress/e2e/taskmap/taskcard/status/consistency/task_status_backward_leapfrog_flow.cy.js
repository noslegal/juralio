import { getProjectAToFLevelData } from '../../../../../../../helpers/data/task_operations_test_project_data'
import {
    generateFixture,
    getWrapper
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'

describe('task_status_backward_leapfrog_flow.cy', () => {
  let user, appPage, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskStatusConsistency',
          teamMembers: [user],
          matterAdmins: [user],
          projects: getProjectAToFLevelData(),
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When changing status from Done to Not started', () => {
    describe('Initialising all tasks to "Done"', () => {
      before(() => {
        cy.login(user.username)
        appPage.changeTaskStatus('task2 A', 2, true)
      })

      it('The taskcard status should change to "Done"', () => {
        cy.get('[data-test=task-header-status-text]').should(
          'have.text',
          'Done'
        )
      })
    })

    describe('When chaning a child task to Not started', () => {
      before(() => {
        cy.login(user.username)
        appPage.changeTaskStatus('subtask7 B', 0)
      })

      describe('a dialog should display', () => {
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
            appPage.changeTaskStatus('subtask7 B', 0, true)
          })

          it('should no longer display the dialog', () => {
            cy.get('[data-test=dialog-prompt-text]').should('not.exist')
          })

          it('The taskcard status should change to "Not started"', () => {
            cy.get('[data-test=task-header-status-text]').should(
              'have.text',
              'Not started'
            )
          })

          it('should have children statuses as "Not started"', () => {
            cy.get('[data-test=status-header]').should(
              'have.text',
              'Not started'
            )
          })

          describe('and its children should persist the change', () => {
            before(() => {
              cy.login(user.username)
              appPage.visitTaskByName('subtask8 C')
            })

            it('The child taskcard status should change to "Not started"', () => {
              cy.get('[data-test=task-header-status-text]').should(
                'have.text',
                'Not started'
              )
            })
          })

          describe('and its parent status', () => {
            before(() => {
              cy.login(user.username)
              appPage.visitTaskByName('task2 A')
            })

            it('should change to "In progress"', () => {
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
