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
  checkTaskCreationNotification,
  checkTaskMoveNotification,
  getNotification,
} from '../../../../../../helpers/notifications/inbox-notification-helper'
import { openTaskMoveToNewProject } from '../../../../../../helpers/tasks/task_operations_helpers'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import globalNotificationsPage from '../../../../../../page/notifications/global_notifications_page'
import taskDetailPage from '../../../../../../page/taskdetail/taskdetail_page'

describe('task_move_inter_project_event_notification.cy', () => {
  let user1, user2, fixture, appPage
  let { moveDialog } = taskDetailPage

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
            prefix: 'task_moved_project_event',
            teamMembers: [user1, user2],
            matterAdmins: [user1],
            projects: [
              {
                name: 'Alpha Project',
                tasks: [
                  {
                    name: 'Moon',
                    teamMembers: [user1],
                    tasks: [
                      {
                        name: 'Pluto',
                        teamMembers: [user1],
                        followers: [user2],
                      },
                      { name: 'Mars', teamMembers: [user1, user2] },
                      { name: 'Jupiter', teamMembers: [user1, user2] },
                    ],
                  },
                ],
              },
              {
                name: 'Beta Project',
                tasks: [{ name: 'Sun', teamMembers: [user1] }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
  })

  describe('when a task is moved to Level A of a different project', () => {
    before(() => {
      cy.login(user1.username)
      appPage.visitTaskByName('Pluto')
      openTaskMoveToNewProject()
      cy.wait(2000)
      // cy.get('[data-test=workstream-item-name]').first().click()
      cy.get('[data-test=destination-selection-dropdown]').eq(1).click()
      cy.get('[data-test=destination-level-a]').click()
      cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/move').as(
        'taskMove'
      )
      moveDialog.get.moveButton().click()
      cy.wait('@taskMove')
    })

    it('renders the task map', () => {
      cy.get('[data-test=task-cell-test]', { timeout: 30000 }).should(
        'be.visible'
      )
    })

    describe('and check inbox notification as the user who performed the task move operation', () => {
      before(() => {
        cy.login(user1.username)
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
})
