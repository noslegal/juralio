/* eslint-disable arrow-parens */
import {
  updatePED,
  updatePSD,
} from '../../../../../../helpers/date/date_api_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import {
  checkGlobalNotificationCount,
  getGlobalNotification,
} from '../../../../../../helpers/notifications/global-notification-helper'
import { checkNotificationCount } from '../../../../../../helpers/notifications/inbox-notification-helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import globalNotificationsPage from '../../../../../../page/notifications/global_notifications_page'

const getUsername = user => user.firstname + ' ' + user.lastname

describe('task_planned_date_change_event_notification.cy', () => {
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
            prefix: 'task_date_event',
            teamMembers: [user1, user2],
            matterAdmins: [user1],
            projects: [
              {
                name: 'Alpha Project',
                tasks: [
                  {
                    name: 'Moon',
                    // properties: {},
                    teamMembers: [user1, user2],
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

  describe('when viewing the Home page', () => {
    before(() => {
      cy.login(user1.username)
      appPage.visitHome()
    })

    checkGlobalNotificationCount(0)

    describe('after setting a planned end date', () => {
      before(() => {
        cy.login(user1.username)
        updatePED(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id,
          '+',
          1
        )
        cy.reload()
      })

      describe('the user who performed the date change', () => {
        it('should not see the date change notification', () => {
          checkNotificationCount(0)
        })
      })

      describe('the team member on the updated task', () => {
        before(() => {
          cy.login(user2.username)
          appPage.visitHome()
        })

        checkGlobalNotificationCount(3)

        describe('When opening the notification list', () => {
          before(() => {
            globalNotificationsPage.get.notificationButton().click()
          })

          it('latest notification records the date setting', () => {
            getGlobalNotification(0).should(
              'contain',
              'Planned end date added:'
            )
          })
        })
      })
    })

    describe('after updating the planned end date', () => {
      before(() => {
        cy.login(user1.username)
        updatePED(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id,
          '+',
          3
        )
        appPage.visitHome()
      })

      // No new notification for performing user
      checkGlobalNotificationCount(0)

      describe('the team member on the updated task', () => {
        before(() => {
          cy.login(user2.username)
          appPage.visitHome()
        })

        checkGlobalNotificationCount(1)

        describe('When opening the notification list', () => {
          before(() => {
            globalNotificationsPage.get.notificationButton().click()
          })

          it('latest notification records the date setting', () => {
            getGlobalNotification(0).should(
              'contain',
              'Planned end date changed to'
            )
          })
        })
      })

      describe('after setting a planned start date', () => {
        before(() => {
          cy.login(user1.username)
          updatePSD(
            fixture.matter.id,
            fixture.projects[0].id,
            fixture.tasks[0].id,
            '-',
            5
          )
          appPage.visitHome()
        })

        // No new notification for performing user
        checkGlobalNotificationCount(0)

        describe('the team member on the updated task', () => {
          before(() => {
            cy.login(user2.username)
            appPage.visitHome()
          })

          checkGlobalNotificationCount(1)

          describe('When opening the notification list', () => {
            before(() => {
              globalNotificationsPage.get.notificationButton().click()
            })

            it('latest notification records the date setting', () => {
              getGlobalNotification(0).should(
                'contain',
                'Planned start date added:'
              )
            })
          })
        })
      })

      describe('after updating the planned start date', () => {
        before(() => {
          cy.login(user1.username)
          updatePSD(
            fixture.matter.id,
            fixture.projects[0].id,
            fixture.tasks[0].id,
            '-',
            3
          )
          appPage.visitHome()
        })
        describe('the user who performed the date change', () => {
          checkGlobalNotificationCount(0)

          describe('the team member on the updated task', () => {
            before(() => {
              cy.login(user2.username)
              appPage.visitHome()
            })
            checkGlobalNotificationCount(1)

            describe('When opening the notification list', () => {
              before(() => {
                globalNotificationsPage.get.notificationButton().click()
              })

              it('latest notification records the date setting', () => {
                getGlobalNotification(0).should(
                  'contain',
                  'Planned start date changed to'
                )
              })
            })
          })
        })
      })
    })
  })
})
