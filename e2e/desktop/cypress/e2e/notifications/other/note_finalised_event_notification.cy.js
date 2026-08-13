import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { openCreateNote } from '../../../../../helpers/notes/notes_create_helper'
import {
  checkGlobalNoteFinalisedNotification,
  checkGlobalNotificationCount,
  checkGlobalNotificationCountsForUsers,
} from '../../../../../helpers/notifications/global-notification-helper'
import {
  checkNoteFinalisedNotification,
  checkNotificationCount,
} from '../../../../../helpers/notifications/inbox-notification-helper'
import {
  createNotificationConsumers,
  NC_MATTER_TEAM_MEMBER,
  NC_TASK_CREATOR,
  NC_TASK_TEAM_FOLLOWER,
  NC_TASK_TEAM_MEMBER,
} from '../../../../../helpers/notifications/notification-consumer-helpers'
import globalNotificationsPage from '../../../../../page/notifications/global_notifications_page'

describe('note_finalised_event_notification.cy', () => {
  let notificationConsumers, fixture, appPage

  before(() => {
    createNotificationConsumers().then(nCs => {
      notificationConsumers = nCs
      const seed = {
        matter: {
          prefix: 'note_finalised_event',
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
                  teamMembers: [
                    notificationConsumers.taskCreator,
                    notificationConsumers.taskTeamMember,
                  ],
                  followers: [notificationConsumers.taskFollower],
                },
              ],
            },
            {
              name: 'Beta Project',
              tasks: [
                {
                  name: 'Sun',
                  teamMembers: [
                    notificationConsumers.taskCreator,
                    notificationConsumers.taskTeamMember,
                  ],
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
    [NC_TASK_TEAM_MEMBER]: 3,
    [NC_TASK_TEAM_FOLLOWER]: 0,
  }

  checkGlobalNotificationCountsForUsers(
    () => appPage.visitHome(),
    u => notificationConsumers[u],
    initialNotificationCounts
  )

  describe('When a user is on a task and creates a note', () => {
    before(() => {
      cy.login(notificationConsumers.taskCreator.username)
      appPage.visitTaskByName('Sun')
      openCreateNote()
    })

    describe('and then marks the note final and then back to draft', () => {
      before(() => {
        cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*/post/*').as(
          'patchNote'
        )
        cy.get('[data-test=finalise-button]', { timeout: 30000 }).click()
        cy.wait('@patchNote')
      })

      it('should show the finalised date', () => {
        cy.get('[data-test=note-listitem-finalised-date]').should('exist')
      })

      describe('when marking note as draft', () => {
        before(() => {
          cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*/post/*').as(
            'patchPost'
          )
          cy.get('[data-test=finalise-button]', { timeout: 30000 }).click()
          cy.wait('@patchPost')
        })

        const finalNotificationCounts = {
          [NC_TASK_CREATOR]: 0,
          [NC_MATTER_TEAM_MEMBER]: 0,
          [NC_TASK_TEAM_MEMBER]: 1,
          [NC_TASK_TEAM_FOLLOWER]: 2,
        }

        checkGlobalNotificationCountsForUsers(
          () => appPage.visitHome(),
          u => notificationConsumers[u],
          finalNotificationCounts
        )

        describe('and views the homepage inbox notifications as another task team member', () => {
          before(() => {
            cy.login(notificationConsumers.taskTeamMember.username)
            appPage.visitHome()
          })

          checkGlobalNotificationCount(0)

          describe('the Homepage inbox notifications show the note notification I have created', () => {
            before(() => {
              globalNotificationsPage.get.notificationButton().click()
            })
            checkGlobalNoteFinalisedNotification(
              0,
              `${new Date().toLocaleDateString('en-CA')} Note was finalised`
            )
          })
        })

        describe('and views the homepage inbox notifications as a task team follower', () => {
          before(() => {
            cy.login(notificationConsumers.taskFollower.username)
            appPage.visitHome()
          })

          describe('the Homepage inbox notifications show the note notification I have created', () => {
            checkGlobalNotificationCount(0)

            describe('when the notification list is shown', () => {
              before(() => {
                globalNotificationsPage.get.notificationButton().click()
              })
              checkGlobalNoteFinalisedNotification(
                0,
                `${new Date().toLocaleDateString('en-CA')} Note was finalised`
              )
            })
          })
        })
      })
    })
  })
})
