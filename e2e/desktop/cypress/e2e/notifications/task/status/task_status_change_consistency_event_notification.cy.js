/* eslint-disable arrow-parens */
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import {
  checkGlobalNotificationCount,
  checkGlobalNotificationCounts,
  getGlobalNotification,
} from '../../../../../../helpers/notifications/global-notification-helper'
import {
  checkNotificationCount,
  checkTaskStatusNotification,
} from '../../../../../../helpers/notifications/inbox-notification-helper'
import { getReadField } from '../../../../../../helpers/tasks/task-description-helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import globalNotificationsPage from '../../../../../../page/notifications/global_notifications_page'

describe('task_status_change_consistency_event_notification.cy', () => {
  let user1, user2, fixture, appPage

  const createUser1 = () =>
    createUser().then(createdUser => (user1 = createdUser))
  const createUser2 = () =>
    createUser().then(createdUser => (user2 = createdUser))

  before(() => {
    createUser1()
      .then(createUser2)
      .then(() => {
        const seed = {
          matter: {
            prefix: 'task_status_kn_event',
            teamMembers: [user1, user2],
            matterAdmins: [user1],
            projects: [
              {
                name: 'StatusKnockOn',
                tasks: [
                  {
                    name: 'task1',
                    properties: { description: 'task1 description' },
                    teamMembers: [user1, user2],
                    tasks: [
                      {
                        name: 'subtask2',
                        teamMembers: [user1],
                        properties: { description: 'subtask2 description' },
                      },
                      {
                        name: 'subtask3',
                        teamMembers: [user1],
                        properties: { description: 'subtask3 description' },
                      },
                      {
                        name: 'subtask4',
                        properties: { description: 'subtask4 description' },
                        teamMembers: [user1, user2],
                      },
                    ],
                  },
                  {
                    name: 'task2',
                    teamMembers: [user1],
                    properties: { description: 'task2 description' },
                    tasks: [
                      {
                        name: 'subtask5',
                        teamMembers: [user1],
                        properties: { description: 'subtask5 description' },
                      },
                      {
                        name: 'subtask6',
                        teamMembers: [user1],
                        properties: { description: 'subtask6 description' },
                      },
                      {
                        name: 'subtask7',
                        teamMembers: [user1],
                        properties: { description: 'subtask7 description' },
                      },
                    ],
                  },
                  {
                    name: 'task3',
                    properties: { description: 'task3 description' },
                    teamMembers: [user1, user2],
                    tasks: [
                      {
                        name: 'subtask8',
                        teamMembers: [user1],
                        properties: { description: 'subtask8 description' },
                      },
                      {
                        name: 'subtask9',
                        teamMembers: [user1],
                        properties: { description: 'subtask9 description' },
                      },
                      {
                        name: 'subtask10',
                        teamMembers: [user1],
                        properties: { description: 'subtask10 description' },
                      },
                    ],
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

  describe('When a child task with not started parents is set to In progress', () => {
    before(() => {
      cy.login(user1.username)
      appPage.changeTaskStatus('subtask4', 1, true)
    })

    it('The taskcard status should change to "In progress"', () => {
      cy.get('[data-test=task-header-status-text]').should(
        'have.text',
        'In progress'
      )
    })

    describe('When returning to the Home screen', () => {
      before(() => {
        cy.login(user2.username)
        appPage.visitHome()
      })

      describe('notifications show the tasks status changes', () => {
        checkGlobalNotificationCount(5)

        describe('When opening the notification list', () => {
          before(() => {
            globalNotificationsPage.get.notificationButton().click()
          })

          it('latest notification records the move', () => {
            getGlobalNotification(0).should('contain', 'subtask4 was started')
          })
        })
      })

      describe('when clicking on the notification on the Home page', () => {
        before(() => {
          cy.login(user2.username)
          appPage.visitHome()
          globalNotificationsPage.get.notificationButton().click()
          getGlobalNotification(0).click()
        })

        it('should display a task description of -"subtask4 description"', () => {
          getReadField(0).should('have.text', 'subtask4 description')
        })
      })
    })

    describe('When task with Not started children is set to done', () => {
      before(() => {
        cy.login(user1.username)
        appPage.changeTaskStatus('task3', 2, true)
      })

      it('The taskcard status should change to "Done"', () => {
        cy.get('[data-test=task-header-status-text]').should(
          'have.text',
          'Done'
        )
      })

      describe('When returning to the Home screen', () => {
        before(() => {
          cy.login(user2.username)
          appPage.visitHome()
        })

        describe('notification show the tasks status changes', () => {
          checkGlobalNotificationCounts(1, 1)

          describe('When opening the notification list', () => {
            before(() => {
              globalNotificationsPage.get.notificationButton().click()
            })

            it('notification records the status change', () => {
              getGlobalNotification(0).should('contain', 'task3 was completed')
            })
          })
        })
      })

      describe('when clicking on the notification on the Home page', () => {
        before(() => {
          cy.login(user2.username)
          appPage.visitHome()
          globalNotificationsPage.get.notificationButton().click()
          getGlobalNotification(0).click()
        })

        it('should display a task description of -"task3 description"', () => {
          getReadField(0).should('have.text', 'task3 description')
        })
      })
    })

    // Notification for IP -> NS is no longer shown
    describe('When task and children (mixed status) is set to Not started', () => {
      before(() => {
        cy.login(user1.username)
        appPage.changeTaskStatus('task1', 0, true)
      })

      it('The taskcard status should change to "Not started"', () => {
        cy.get('[data-test=task-header-status-text]').should(
          'have.text',
          'Not started'
        )
      })

      describe('When returning to the Home screen', () => {
        before(() => {
          cy.login(user2.username)
          appPage.visitHome()
        })

        checkGlobalNotificationCounts(0, 0)

        describe('When opening the notification list', () => {
          before(() => {
            globalNotificationsPage.get.notificationButton().click()
          })

          it('latest notification is not about the status change', () => {
            getGlobalNotification(2).should(
              'contain',
              'You were added to task3'
            )
          })
        })
      })
    })
  })
})
