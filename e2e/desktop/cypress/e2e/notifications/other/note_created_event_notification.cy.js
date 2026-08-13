import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import {
  checkGlobalNotificationCount,
  checkGlobalNotificationCountsForUsers,
} from '../../../../../helpers/notifications/global-notification-helper'
import { checkNotificationCount } from '../../../../../helpers/notifications/inbox-notification-helper'
import {
  createNotificationConsumers,
  NC_MATTER_TEAM_MEMBER,
  NC_TASK_CREATOR,
  NC_TASK_TEAM_FOLLOWER,
  NC_TASK_TEAM_MEMBER,
} from '../../../../../helpers/notifications/notification-consumer-helpers'

describe('note_created_event_notification.cy', () => {
  let notificationConsumers, fixture, appPage

  before(() => {
    createNotificationConsumers().then(nCs => {
      notificationConsumers = nCs
      const seed = {
        matter: {
          prefix: 'note_created_event',
          teamMembers: [
            notificationConsumers.taskCreator,
            notificationConsumers.matterTeamMember,
            notificationConsumers.taskTeamMember,
            notificationConsumers.taskFollower,
          ],
          matterAdmins: [notificationConsumers.matterTeamMember],
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
    [NC_TASK_TEAM_MEMBER]: 0,
    [NC_TASK_TEAM_FOLLOWER]: 0,
  }

  checkGlobalNotificationCountsForUsers(
    () => appPage.visitHome(),
    u => notificationConsumers[u],
    initialNotificationCounts
  )

  describe('When a user is on a task', () => {
    describe('and creates a note', () => {
      before(() => {
        cy.login(notificationConsumers.taskCreator.username)
        appPage.visitTaskByName('Sun')
        addNoteToTask(
          fixture.matter.id,
          fixture.projects[1].id,
          fixture.tasks[1].id,
          { name: 'a new note' }
        )
      })

      const postNoteCreationNotificationCounts = {
        [NC_TASK_CREATOR]: initialNotificationCounts[NC_TASK_CREATOR],
        [NC_MATTER_TEAM_MEMBER]:
          initialNotificationCounts[NC_MATTER_TEAM_MEMBER],
        [NC_TASK_TEAM_MEMBER]: initialNotificationCounts[NC_TASK_TEAM_MEMBER],
        [NC_TASK_TEAM_FOLLOWER]:
          initialNotificationCounts[NC_TASK_TEAM_FOLLOWER],
      }

      checkGlobalNotificationCountsForUsers(
        () => appPage.visitHome(),
        u => notificationConsumers[u],
        postNoteCreationNotificationCounts
      )

      describe('When another team member is on the homepage, the inbox shows the note creation notification', () => {
        const newCount = initialNotificationCounts.taskTeamMember
        before(() => {
          cy.login(notificationConsumers.taskTeamMember.username)
          appPage.visitHome()
        })
        checkGlobalNotificationCount(newCount)
      })
    })
  })
})
