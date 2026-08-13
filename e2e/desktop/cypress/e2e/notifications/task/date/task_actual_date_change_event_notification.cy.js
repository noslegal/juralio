/* eslint-disable arrow-parens */

import {
  updateAED,
  updateASD,
} from '../../../../../../helpers/date/date_api_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import {
  checkGlobalNotificationCountsForUsers,
  getGlobalNotification,
} from '../../../../../../helpers/notifications/global-notification-helper'
import {
  createNotificationConsumers,
  NC_MATTER_TEAM_MEMBER,
  NC_TASK_CREATOR,
  NC_TASK_TEAM_FOLLOWER,
  NC_TASK_TEAM_MEMBER,
} from '../../../../../../helpers/notifications/notification-consumer-helpers'
import globalNotificationsPage from '../../../../../../page/notifications/global_notifications_page'

describe('task_actual_date_change_event_notification.cy', () => {
  let notificationConsumers, fixture, appPage

  before(() => {
    createNotificationConsumers().then(nCs => {
      notificationConsumers = nCs
      const seed = {
        matter: {
          prefix: 'task_date_event',
          teamMembers: [
            notificationConsumers.taskCreator,
            notificationConsumers.taskTeamMember,
            notificationConsumers.taskFollower,
            notificationConsumers.matterTeamMember,
          ],
          matterAdmins: [notificationConsumers.taskCreator],
          projects: [
            {
              name: 'Alpha Project',
              tasks: [
                {
                  name: 'Moon',
                  properties: {
                    status: 'done',
                  },
                  teamMembers: [notificationConsumers.taskTeamMember],
                  followers: [notificationConsumers.taskFollower],
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

  const initialNotificationCounts = {
    [NC_TASK_CREATOR]: 0,
    [NC_MATTER_TEAM_MEMBER]: 0,
    [NC_TASK_TEAM_MEMBER]: 0,
    [NC_TASK_TEAM_FOLLOWER]: 0,
  }

  describe('after initial setup', () =>
    checkGlobalNotificationCountsForUsers(
      () => appPage.visitHome(),
      u => notificationConsumers[u],
      initialNotificationCounts
    ))

  describe('after setting an actual start date', () => {
    before(() => {
      cy.login(notificationConsumers.taskCreator.username)
      updateASD(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        '-',
        7
      )
      cy.reload()
    })

    const changedNotificationCountsA = {
      [NC_TASK_CREATOR]: initialNotificationCounts[NC_TASK_CREATOR],
      [NC_MATTER_TEAM_MEMBER]: 0,
      [NC_TASK_TEAM_MEMBER]: 3,
      [NC_TASK_TEAM_FOLLOWER]: 2,
    }

    checkGlobalNotificationCountsForUsers(
      () => appPage.visitHome(),
      u => notificationConsumers[u],
      changedNotificationCountsA
    )

    describe('after updating the actual start date', () => {
      before(() => {
        cy.login(notificationConsumers.taskCreator.username)
        updateASD(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id,
          '-',
          6
        )
      })

      const changedNotificationCountsB = {
        [NC_TASK_CREATOR]: changedNotificationCountsA[NC_TASK_CREATOR],
        [NC_MATTER_TEAM_MEMBER]:
          changedNotificationCountsA[NC_MATTER_TEAM_MEMBER],
        [NC_TASK_TEAM_MEMBER]: 1,
        [NC_TASK_TEAM_FOLLOWER]: 1,
      }

      checkGlobalNotificationCountsForUsers(
        () => appPage.visitHome(),
        u => notificationConsumers[u],
        changedNotificationCountsB
      )

      describe('when viewing the Home page as another task team follower', () => {
        before(() => {
          cy.login(notificationConsumers.taskFollower.username)
          appPage.visitHome()
        })

        describe('When opening the notification list', () => {
          before(() => {
            globalNotificationsPage.get.notificationButton().click()
          })
          it('latest notification records the date change', () => {
            getGlobalNotification(0).should(
              'contain',
              'Actual start date changed'
            )
          })
        })
      })

      describe('after setting an actual end date', () => {
        before(() => {
          cy.login(notificationConsumers.taskCreator.username)
          updateAED(
            fixture.matter.id,
            fixture.projects[0].id,
            fixture.tasks[0].id,
            '-',
            1
          )
        })
        const changedNotificationCountsC = {
          [NC_TASK_CREATOR]: changedNotificationCountsB[NC_TASK_CREATOR],
          [NC_MATTER_TEAM_MEMBER]: 0,
          [NC_TASK_TEAM_MEMBER]: 1,
          [NC_TASK_TEAM_FOLLOWER]: 1,
        }
        checkGlobalNotificationCountsForUsers(
          () => appPage.visitHome(),
          u => notificationConsumers[u],
          changedNotificationCountsC
        )
        describe('when viewing the Home page as another task team follower', () => {
          before(() => {
            cy.login(notificationConsumers.taskFollower.username)
            appPage.visitHome()
          })
          describe('When opening the notification list', () => {
            before(() => {
              globalNotificationsPage.get.notificationButton().click()
            })
            it('latest notification records the date change', () => {
              getGlobalNotification(0).should('contain', 'Actual end date')
            })
          })
        })
        describe('after updating the actual end date', () => {
          before(() => {
            cy.login(notificationConsumers.taskCreator.username)
            updateAED(
              fixture.matter.id,
              fixture.projects[0].id,
              fixture.tasks[0].id,
              '-',
              2
            )
            cy.reload()
          })
          const changedNotificationCountsD = {
            [NC_TASK_CREATOR]: changedNotificationCountsC[NC_TASK_CREATOR],
            [NC_MATTER_TEAM_MEMBER]: 0,
            [NC_TASK_TEAM_MEMBER]: 1,
            [NC_TASK_TEAM_FOLLOWER]: 1,
          }
          checkGlobalNotificationCountsForUsers(
            () => appPage.visitHome(),
            u => notificationConsumers[u],
            changedNotificationCountsD
          )
          describe('when viewing the Home page as another task team member', () => {
            before(() => {
              cy.login(notificationConsumers.taskTeamMember.username)
              appPage.visitHome()
              globalNotificationsPage.get.notificationButton().click()
            })
            it('latest notification records the date change', () => {
              getGlobalNotification(0).should(
                'contain',
                'Actual end date changed'
              )
            })
          })
        })
      })
    })
  })
})
