import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { checkGlobalNotificationCountsForUsers } from '../../../../../helpers/notifications/global-notification-helper'
import {
  checkNotificationCount,
  checkTaskCreationNotification,
  getNotification,
} from '../../../../../helpers/notifications/inbox-notification-helper'
import {
  createNotificationConsumers,
  NC_MATTER_TEAM_MEMBER,
  NC_TASK_CREATOR,
  NC_TASK_TEAM_FOLLOWER,
  NC_TASK_TEAM_MEMBER,
} from '../../../../../helpers/notifications/notification-consumer-helpers'
import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'

describe('task_created_event_notification.cy', () => {
  let notificationConsumers, fixture, appPage
  const PROJECT_NOTIFICATION_COUNT = 10

  before(() => {
    createNotificationConsumers().then(nCs => {
      notificationConsumers = nCs
      const seed = {
        matter: {
          prefix: 'task_created_event',
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

  describe('after initial setup', () => {
    checkGlobalNotificationCountsForUsers(
      () => appPage.visitHome(),
      u => notificationConsumers[u],
      initialNotificationCounts
    )
  })
})
