import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import {
  checkGlobalNotificationCount,
  getGlobalNotification,
} from '../../../../../../helpers/notifications/global-notification-helper'
import {
  checkNotificationCount,
  checkTaskMoveNotification,
} from '../../../../../../helpers/notifications/inbox-notification-helper'
import { getReadField } from '../../../../../../helpers/tasks/task-description-helper'
import {
  openTaskMoveToLevelA,
  openTaskMoveToSpecificTaskAndConfirm,
} from '../../../../../../helpers/tasks/task_operations_helpers'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import globalNotificationsPage from '../../../../../../page/notifications/global_notifications_page'

describe('task_move_intra_project_event_notification.cy', () => {
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
            prefix: 'task_moved_event',
            teamMembers: [user1, user2],
            matterAdmins: [user1],
            projects: [
              {
                name: 'Alpha Project',
                tasks: [
                  {
                    name: 'Moon',
                    tasks: [
                      {
                        name: 'Pluto',
                        followers: [user1, user2],
                        properties: {
                          description: 'Pluto description',
                        },
                      },
                      {
                        name: 'Mars',
                        teamMembers: [user1, user2],
                        properties: {
                          description: 'Mars description',
                        },
                      },
                      {
                        name: 'Jupiter',
                        teamMembers: [user1, user2],
                        properties: {
                          description: 'Jupiter description',
                        },
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

  describe('when a task is moved to Level A of same project', () => {
    before(() => {
      cy.login(user1.username)
      appPage.visitTaskByName('Pluto')
      openTaskMoveToLevelA()
      cy.get('[data-test=action-dialog-button]').click()

      cy.url().should('contain', 'taskmap')
    })

    describe('check inbox notifications for user who performed the task move operation', () => {
      before(() => {
        appPage.visitHome()
      })

      checkGlobalNotificationCount(0)
    })

    describe('and check inbox notification as a task follower on the moved task', () => {
      before(() => {
        cy.login(user2.username)
        appPage.visitHome()
      })

      checkGlobalNotificationCount(4)

      describe('When opening the notification list', () => {
        before(() => {
          globalNotificationsPage.get.notificationButton().click()
        })

        it('latest notification records the move', () => {
          getGlobalNotification(0).should('contain', 'Pluto has been moved')
        })
      })
    })
  })

  describe('when a sub task is moved to new parent task of same project', () => {
    before(() => {
      cy.login(user1.username)
      appPage.visitTaskByName('Jupiter')
      openTaskMoveToSpecificTaskAndConfirm('Mars', true)
    })

    describe('check inbox notifications for user who performed the task move operation', () => {
      before(() => {
        appPage.visitHomeViaNavigation()
      })

      checkGlobalNotificationCount(0)
    })

    describe('check inbox notifications for another task team member on the moved task', () => {
      before(() => {
        cy.login(user2.username)
        appPage.visitHome()
      })

      checkGlobalNotificationCount(1)

      describe('When opening the notification list', () => {
        before(() => {
          globalNotificationsPage.get.notificationButton().click()
        })
        it('latest notification records the move', () => {
          getGlobalNotification(0).should('contain', 'Jupiter has been moved')
        })
      })
    })
  })

  describe('when a sub task is moved to new parent task of same project', () => {
    before(() => {
      cy.login(user1.username)
      appPage.visitTaskByName('Pluto')
      openTaskMoveToSpecificTaskAndConfirm('Moon', true)
    })

    describe('check inbox notifications for user who performed the task move operation', () => {
      before(() => {
        appPage.visitHomeViaNavigation()
      })

      checkGlobalNotificationCount(0)
    })

    describe('check inbox notifications for task follower on the moved task', () => {
      before(() => {
        cy.login(user2.username)
        appPage.visitHome()
      })

      checkGlobalNotificationCount(1)

      describe('When opening the notification list', () => {
        before(() => {
          globalNotificationsPage.get.notificationButton().click()
        })
        it('latest notification records the move', () => {
          getGlobalNotification(0).should('contain', 'Pluto has been moved')
        })
      })
    })

    describe('when clicking on the 2nd new move notification in the global inbox', () => {
      before(() => {
        cy.backendRoute('/matter/*/workstreams/*/task/*').as('getTask')
        getGlobalNotification(1).click()
        cy.wait('@getTask')
      })

      it('should display a task name of -"Jupiter"', () => {
        getReadField(0).should('have.text', 'Jupiter description')
      })
    })

    describe('when clicking on the 3rd new move notification in the global inbox', () => {
      before(() => {
        globalNotificationsPage.get.notificationButton().click()
        cy.backendRoute('/matter/*/workstreams/*/task/*').as('getTask')
        getGlobalNotification(0).click()
        cy.wait('@getTask')
      })

      it('should display a task name of -"Pluto"', () => {
        getReadField(0).should('have.text', 'Pluto description')
      })
    })
  })
})
