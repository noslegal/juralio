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
import global_notifications_page from '../../../../../../page/notifications/global_notifications_page'

describe('task_knock_on_date_change_event_notification.cy', () => {
  let notificationConsumers, fixture, appPage

  before(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - 15) // subtract a few minutes to allow for some deviation & client & server clocks
    let tenDaysBeforeNow = new Date()
    let tenDaysFromNow = new Date()
    tenDaysBeforeNow.setDate(now.getDate() - 10)
    tenDaysFromNow.setDate(now.getDate() + 10)

    createNotificationConsumers().then(nCs => {
      notificationConsumers = nCs
      const seed = {
        matter: {
          prefix: 'task_knock_on_date_change_event',
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
                  name: 'Parent',
                  tasks: [
                    {
                      name: 'Child A',
                      properties: {
                        plannedStartDate: tenDaysBeforeNow,
                        plannedEndDate: now,
                        // actualStartDate: tenDaysBeforeNow,
                        // actualEndDate: now,
                      },
                      teamMembers: [notificationConsumers.taskTeamMember],
                      followers: [notificationConsumers.taskFollower],
                    },
                    {
                      name: 'Child B',
                      properties: {
                        plannedStartDate: now,
                        plannedEndDate: tenDaysFromNow,
                        // actualStartDate: tenDaysBeforeNow,
                        // actualEndDate: now,
                      },
                      teamMembers: [notificationConsumers.taskTeamMember],
                      followers: [notificationConsumers.taskFollower],
                    },
                  ],
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
    [NC_TASK_TEAM_MEMBER]: 4,
    [NC_TASK_TEAM_FOLLOWER]: 0,
  }

  checkGlobalNotificationCountsForUsers(
    () => appPage.visitHome(),
    u => notificationConsumers[u],
    initialNotificationCounts
  )

  describe('after setting planned end date of parent', () => {
    before(() => {
      cy.login(notificationConsumers.taskCreator.username)
      updatePED(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        '+',
        2
      )
    })

    const changedNotificationCountsA = {
      [NC_TASK_CREATOR]: initialNotificationCounts[NC_TASK_CREATOR],
      [NC_MATTER_TEAM_MEMBER]: initialNotificationCounts[NC_MATTER_TEAM_MEMBER],
      [NC_TASK_TEAM_MEMBER]: 1,
      [NC_TASK_TEAM_FOLLOWER]: 2,
    }

    checkGlobalNotificationCountsForUsers(
      () => appPage.visitHome(),
      u => notificationConsumers[u],
      changedNotificationCountsA
    )

    describe('When viewing the home page as another task team member', () => {
      before(() => {
        cy.login(notificationConsumers.taskTeamMember.username)
        appPage.visitHome()
        global_notifications_page.get.notificationButton().click()
      })

      it('latest notification records the date change', () => {
        getGlobalNotification(0).should('contain', 'Planned end date ')
      })

      describe('after setting planned start date of parent', () => {
        before(() => {
          cy.login(notificationConsumers.taskCreator.username)
          updatePSD(
            fixture.matter.id,
            fixture.projects[0].id,
            fixture.tasks[0].id,
            '-',
            2
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
      })
    })
  })
})
