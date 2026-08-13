import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { getGlobalNotification } from '../../../../../helpers/notifications/global-notification-helper'
import snackbarHelper from '../../../../../helpers/snackbar/snackbar-helper'
import {
  openMenuForSubtask,
  showNotRequiredTasks,
} from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import globalNotificationsPage from '../../../../../page/notifications/global_notifications_page'
import { generatePoint, performDrag } from '../dnd/task-map-drag-helpers.cy'

const visitHelpers = new VisitHelpers()

describe('not_required.cy', () => {
  let user, fixture, appPage
  let user1, user2, user3, user4, user5

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const createUser1 = () =>
        createUser('MMM').then(createdUser => (user1 = createdUser))

      const createUser2 = () =>
        createUser('CUSER2').then(createdUser => (user2 = createdUser))

      const createUser3 = () =>
        createUser('BUSER3').then(createdUser => (user3 = createdUser))

      const createUser4 = () =>
        createUser('AUSER4').then(createdUser => (user4 = createdUser))

      const createUser5 = () =>
        createUser('USER5').then(createdUser => (user5 = createdUser))

      createUser1()
        .then(createUser2)
        .then(createUser3)
        .then(createUser4)
        .then(createUser5)
        .then(() => {
          const seed = {
            matter: {
              prefix: 'taskMapTest',
              teamMembers: [user, user1, user2, user3, user4, user5],
              matterAdmins: [user],
              projects: [
                {
                  tasks: [
                    {
                      properties: {
                        name: 'task1',
                        status: 'in-progress',
                      },
                      teamMembers: [user1, user2, user3, user4, user5],
                      tasks: [
                        {
                          name: 'task1a',
                          followers: [user1, user2, user3, user4, user5],
                        },
                        {},
                      ],
                    },
                    {
                      properties: {
                        name: 'task2',
                        status: 'in-progress',
                      },
                    },
                    {
                      properties: {
                        name: 'task3',
                        status: 'in-progress',
                      },
                    },
                  ],
                },
              ],
            },
          }

          fixture = generateFixture(seed)
          appPage = getWrapper(fixture)
        })
    })
  })

  describe('when visiting the task map', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'Not required note' }
      )
    })

    it('should have 6 task cells in total', () => {
      // cy.get('[data-test=container]').should('have.length', 1)
      cy.get('[data-test=structureItem]').should('have.length', 5)
    })

    describe('When setting a task to Not Required', () => {
      before(() => {
        openMenuForSubtask('task1')
        cy.get('[data-test=menu-text]').eq(3).click()
      })

      it('should show the confirmation dialog', () => {
        cy.get('[data-test=dialog-prompt-text]').should(
          'have.text',
          "Continuing will mark this task and any subtasks as 'not required'. This will also remove dates, team members and followers from the relevant tasks."
        )
      })

      describe('When clicking the cancel button', () => {
        before(() => {
          cy.get('[data-test=cancel-dialog-button]').click()
        })

        it('should no longer show the confirmation dialog', () => {
          cy.get('[data-test=dialog-prompt-text]').should('not.exist')
        })

        describe('When setting a task to Not Required via the subtask menu', () => {
          before(() => {
            openMenuForSubtask('task1')
            cy.get('[data-test=menu-text]').eq(3).click({ force: true })
          })

          it('should show the confirmation dialog', () => {
            cy.get('[data-test=dialog-prompt-text]').should('exist')
          })

          describe('When clicking the action button', () => {
            before(() => {
              cy.get('[data-test=action-dialog-button]').click()
            })

            it('should no longer show the confirmation dialog', () => {
              cy.get('[data-test=dialog-prompt-text]').should('not.exist')
            })

            snackbarHelper.checkShownAndHasExpectedText(
              'Task (including 2 subtasks) marked as not required'
            )

            it('should not longer show team members on the tasks', () => {
              cy.get('[task-cell-multi-count]').should('not.exist')
            })
          })
        })
      })

      describe('not required tasks on the task map', () => {
        it('should not show be default', () => {
          cy.get('[data-test=task-cell-test]').should('have.length', 2)
        })
        describe('showing the not-required tasks', () => {
          before(() => {
            showNotRequiredTasks()
            // cy.get('body').click()
          })
          it('should show the not required tasks', () => {
            cy.get('[data-test=task-cell-test]').should('have.length', 5)
          })
        })

        describe('the dropdown options', () => {
          before(() => {
            cy.get('[data-test=task-cell-test]')
              .eq(3)
              .find('[data-test=options-dropdown]')
              .click()
          })
          it('should only have six options + divider', () => {
            cy.get('[data-test=task-card-option-menu]')
            cy.get('[data-test=task-card-option-menu-more]').click()
            cy.get('[data-test=task-card-option-menu]')
              .children()
              .should('have.length', 6)
          })
          it('should be the archive option', () => {
            cy.get('[data-test=task-card-option-menu]')
              .find('[data-test=menu-text-archive]')
              .should('exist')
          })
          after(() => {
            cy.get('body').type('{esc}')
            cy.get('[data-test=task-card-option-menu]').should('not.exist')
          })
        })
      })
      describe('drag and drop interaction with not required tasks', () => {
        describe('trying to drag a not required task', () => {
          before(() => {
            performDrag(3, generatePoint(0, 0), { wait: false })
          })
          it('should not engage the move mechanism', () => {
            cy.get('[data-test=global-snackbar]').should('not.exist')
          })
        })
        // describe('when moving another task', () => {
        //   before(() => {
        //     performDrag(1, generatePoint(300, 7000), { wait: false })
        //     cy.get('[data-test=enterMoveMode]').click()
        //   })
        //   it('should not be a legal drag target', () => {
        //     cy.get('[data-test=move-button-right]').should('have.length', 1)
        //   })
        //   after(() => {
        //     //exit out of move
        //     cy.get('body').type('{esc}')
        //   })
        // })
        describe('NR task details', () => {
          before(() => {
            cy.get('[data-test=task-cell-test]').eq(2).click()
          })
          it('should not have any dates', () => {
            cy.get('[data-test=key-dates-not-required]').should('exist')
            cy.get('[data-test=key-dates-not-required]').should(
              'have.text',
              'Not required tasks are view-only and do not have dates. To edit this task, first use the options menu (⋮) to change its status.'
            )
          })
          it('should not have any subtasks', () => {
            cy.get('[class=task-group]').should('not.exist')
          })
        })
        describe('NR task post', () => {
          before(() => {
            cy.get('[data-test=note-listitem-name]').eq(0).click()
          })
          describe('menu options', () => {
            before(() => {
              cy.get('[data-test=task-content-header-menu-button]').click()
            })
            after(() => {
              cy.get('body').type('{esc}')
            })
            it('should only have 1 option', () => {
              cy.get('[data-test=task-note-option-menu]')
                .find('ul')
                .children()
                .should('have.length', 1)
            })
            it('should be a download option', () => {
              cy.get('[data-test=task-note-download-word]').should('exist')
            })
          })
          it('should not be able to see the finalise button', () => {
            cy.get('[data-test=finalise-button]').should('not.exist')
          })
          it('should have the privacy toggle hidden', () => {
            cy.get('[data-test=note-detail-private-switch]').should('not.exist')
          })
          it('should not be able to add authors', () => {
            cy.get('[data-test=team-search]').should('not.exist')
          })
        })
      })
      describe('when a task is marked as not-required', () => {
        before(() => {
          cy.login(user1.username)
          appPage.visitHome()
        })
        describe('When opening the notification list', () => {
          before(() => {
            globalNotificationsPage.get.notificationButton().click()
          })

          it('should display the not required notification', () => {
            getGlobalNotification(0).should(
              'contain',
              'task1 was marked as not required'
            )
          })
        })
      })
      //   describe('visiting the project inbox', () => {
      //     before(() => {
      //       cy.login(user1.username)
      //       visitHelpers.visitProjectTimeLine(
      //         fixture.matter.id,
      //         fixture.projects[0].id,
      //         false
      //       )
      //     })
      //     it('should display the not required notification', () => {
      //       cy.get('[data-test=inbox-notification]')
      //         .eq(-1)
      //         .find('[data-test=notification-task-name]')
      //         .should('have.text', 'task1')
      //       cy.get('[data-test=inbox-notification]')
      //         .eq(-1)
      //         .find('[data-test=notification-statement]')
      //         .should('have.text', 'marked as Not required')
      //     })
      //   })
    })
  })
})
