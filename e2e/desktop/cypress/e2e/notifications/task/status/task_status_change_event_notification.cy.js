import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import {
  checkGlobalNotificationCount,
  checkGlobalTaskStatusNotification,
} from '../../../../../../helpers/notifications/global-notification-helper'
import {
  checkNotificationCount,
  checkTaskStatusNotification,
  getNotification,
} from '../../../../../../helpers/notifications/inbox-notification-helper'
import { getReadField } from '../../../../../../helpers/tasks/task-description-helper'
/* eslint-disable arrow-parens */
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import globalNotificationsPage from '../../../../../../page/notifications/global_notifications_page'

describe('task_status_change_event_notification.cy', () => {
  let user1, user2, fixture, appPage
  const INITIAL_NOTIFICATION_COUNT = 0

  const statusSequence = [
    'In progress',
    'Not started',
    'In progress',
    'Done',
    'Not required',
  ]
  const statusSequenceNotifications = [
    'In progress',
    //'Not started', // This notification is no longer displayed to the user in Global.
    'In progress',
    'Done',
    'Not required',
  ]

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
            prefix: 'task_status_event',
            teamMembers: [user1, user2],
            matterAdmins: [user1],
            projects: [
              {
                name: 'Alpha Project',
                tasks: [
                  {
                    name: 'Moon',
                    teamMembers: [user2],
                    properties: { description: 'Moon description' },
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

  describe('when viewing the Home page as user who created the tasks', () => {
    before(() => {
      cy.login(user1.username)
      appPage.visitHome()
      appPage.changeTaskStatus('Moon', 1)
      appPage.changeTaskStatus('Moon', 0)
      appPage.changeTaskStatus('Moon', 1)
      appPage.changeTaskStatus('Moon', 2)
      appPage.changeTaskStatusNotRequired('Moon')
      appPage.visitHomeViaNavigation()
    })

    // Should not display status change notification for the user who performed the operation
    checkGlobalNotificationCount(0)

    describe('when the Homepage inbox is shown', () => {
      before(() => {
        cy.login(user2.username)
        appPage.visitHome()
      })

      const COUNT = INITIAL_NOTIFICATION_COUNT + 6
      const START_INDEX = 3
      checkGlobalNotificationCount(COUNT)

      describe('When viewing the notification list', () => {
        before(() => {
          globalNotificationsPage.get.notificationButton().click()
        })

        for (
          let index = 0;
          index < statusSequenceNotifications.length;
          index++
        ) {
          // eslint-disable-next-line no-loop-func
          describe('notifications show the tasks status changes', () => {
            checkGlobalTaskStatusNotification(
              START_INDEX - index,
              'Moon',
              'task_status_event',
              statusSequenceNotifications[index]
            )
          })
        }
      })

      describe('when clicking on the 1st global status change notification on the Home page', () => {
        before(() => {
          cy.login(user2.username)
          appPage.visitHome()
          globalNotificationsPage.get.notificationButton().click()
          globalNotificationsPage.get.notifications().eq(0).click()
        })

        it('should display a task description of -"Moon description"', () => {
          getReadField(0).should('have.text', 'Moon description')
        })
      })
    })
  })
})
