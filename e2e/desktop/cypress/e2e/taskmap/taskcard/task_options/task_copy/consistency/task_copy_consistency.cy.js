import { get3LevelATasksWithSubsData } from '../../../../../../../../helpers/data/task_operations_test_project_data'
import { selectDate } from '../../../../../../../../helpers/date/picker/date_picker_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../../../helpers/matterprojects/fixture_helper'
import { showDoneTasks } from '../../../../../../../../helpers/taskmap/task-map-helper'
import { openTaskCopy } from '../../../../../../../../helpers/tasks/task_operations_helpers'
import { createUser } from '../../../../../../../../helpers/users/user_api_helper'

describe(
  'task_copy_consistency.cy',
  { retries: { runMode: 3, openMode: 3 } },
  () => {
    let user, appPage, fixture

    // The onboarding reactour tour renders with role="dialog", which collides
    // with the date-picker selector in date_picker_helper and intermittently
    // hijacks year selection. Dismiss it before any date interaction so the
    // picker is the only [role=dialog].
    const dismissOverlays = () => {
      cy.get('body').then($body => {
        if ($body.find('.reactour__close').length) {
          cy.get('.reactour__close').click({ force: true })
        }
      })
    }

    before(() => {
      cy.window().then(win => {
        win.sessionStorage.clear()
      })
      createUser().then(createdUser => {
        user = createdUser
        const seed = {
          matter: {
            prefix: 'TaskCopyTest',
            teamMembers: [user],
            matterAdmins: [user],
            projects: get3LevelATasksWithSubsData(),
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
    })

    describe('When a done parent is selected', () => {
      before(() => {
        cy.login(user.username)
        appPage.changeTaskStatus('task3', 2, true)
        dismissOverlays()
        selectDate('[data-test=actual-start-date]', 2015, 6, 15)
        cy.wait(5000)
        selectDate('[data-test=actual-end-date]', 2015, 6, 16)
        cy.get('[data-test=action-dialog-button]', { timeout: 30000 }).click({
          force: true,
        })
        appPage.visitTaskMap()

        dismissOverlays()

        appPage.visitTaskByName('subtask10')
      })

      it('should have an initial status of "Done"', () => {
        cy.get('[data-test=task-header-status-text]').should(
          'have.text',
          'Done'
        )
      })

      it('should display the ASD', () => {
        cy.get('[data-test="actual-start-date"]').should(
          'contain.text',
          'Tue 16 Jun 2015'
        )
      })

      it('should display the AED', () => {
        cy.get('[data-test="actual-end-date"]').should(
          'contain.text',
          'Tue 16 Jun 2015'
        )
      })

      describe('When the child task is copied', () => {
        before(() => {
          cy.login(user.username)
          appPage.visitTaskByName('subtask10')
          openTaskCopy()
          cy.get('[data-test="new-task-name-text-field"]')
            .find('input')
            .type('done copied task')
            .type('{enter}')
        })

        describe('it should display a snackbar', () => {
          it('with a message', () => {
            cy.get('[data-test=snackbar-message]')
              .should('be.visible')
              .should('have.text', 'Task copied.')
          })
        })

        describe('it should persist correct status', () => {
          before(() => {
            cy.login(user.username)
            appPage.visitTaskMap()
            showDoneTasks()
            // cy.get('body').click()
          })

          it('should have 10 level B task', () => {
            cy.get('[data-test=depth-2]').should('have.length', 10)
          })

          it('the fourth level B task should be the copied task', () => {
            cy.get('[data-test=depth-2]')
              .eq(3)
              .should('contain', 'done copied task')
          })

          describe('clicking on the copied task', () => {
            before(() => {
              cy.get('[data-test=depth-2]')
                .eq(3)
                .find('[data-test=name]')
                .click()
            })

            it('should have the title "done copied task"', () => {
              cy.get('[data-test=read-field]').should(
                'contain',
                'done copied task'
              )
            })

            it('should have a status of "Done"', () => {
              cy.get('[data-test=task-header-status-text]').should(
                'contain',
                'Done'
              )
            })

            it('should display the ASD', () => {
              cy.get('[data-test="actual-start-date"]')
                // .find('input')
                .should('contain.text', 'Tue 16 Jun 2015')
            })

            it('should display the AED', () => {
              cy.get('[data-test="actual-end-date"]')
                // .find('input')
                .should('contain.text', 'Tue 16 Jun 2015')
            })
          })
        })
      })
    })

    describe('When a Not started task is selected', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('subtask3')
        dismissOverlays()
        selectDate('[data-test="planned-start-date"]', 2015, 6, 15)
        cy.wait(1000)
        selectDate('[data-test="planned-end-date"]', 2015, 6, 16)
        cy.wait(1000)
      })

      it('should have an initial status of "Not started"', () => {
        cy.get('[data-test=task-header-status-text]').should(
          'contain',
          'Not started'
        )
      })

      it('should display the PSD', () => {
        cy.get('[data-test="planned-start-date"]')
          // .find('input')
          .should('contain.text', 'Mon 15 Jun 2015')
      })

      it('should display the PED', () => {
        cy.get('[data-test="planned-end-date"]')
          // .find('input')
          .should('contain.text', 'Tue 16 Jun 2015')
      })

      describe('When the task is copied', () => {
        before(() => {
          cy.login(user.username)
          appPage.visitTaskByName('subtask3')
          openTaskCopy()
          cy.get('[data-test="new-task-name-text-field"]')
            .find('input')
            .clear()
            .type('not started copied task')
            .type('{enter}')
        })

        describe('it should display a snackbar', () => {
          it('with a message', () => {
            cy.get('[data-test=snackbar-message]')
              .should('be.visible')
              .should('have.text', 'Task copied.')
          })
        })

        describe('it should persist correct status', () => {
          before(() => {
            cy.login(user.username)
            appPage.visitTaskMap()
            showDoneTasks()
            // cy.get('body').click()
          })

          it('should have 11 level B task', () => {
            cy.get('[data-test=depth-2]').should('have.length', 11)
          })

          it('the eighth task should be the copied task', () => {
            cy.get('[data-test=depth-2]')
              .eq(7)
              .should('contain', 'not started copied task')
          })

          describe('clicking on the copied task', () => {
            before(() => {
              cy.get('[data-test=depth-2]')
                .eq(7)
                .find('[data-test=name]')
                .click()
            })

            it('should have the title "not started copied task"', () => {
              cy.get('[data-test=read-field]').should(
                'contain',
                'not started copied task'
              )
            })

            it('should have a status of "Not started"', () => {
              cy.get('[data-test=task-header-status-text]').should(
                'contain',
                'Not started'
              )
            })

            it('should display the PSD', () => {
              cy.get('[data-test="planned-start-date"]')
                // .find('input')
                .should('contain.text', 'Mon 15 Jun 2015')
            })

            it('should display the PED', () => {
              cy.get('[data-test="planned-end-date"]')
                // .fin'contain.text'd('input')
                .should('contain.text', 'Tue 16 Jun 2015')
            })
          })
        })
      })
    })
  }
)
