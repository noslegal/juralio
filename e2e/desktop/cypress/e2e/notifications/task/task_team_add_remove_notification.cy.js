import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import {
  checkGlobalNotificationCount,
  checkGlobalTaskTeamAddNotification,
  checkGlobalTaskTeamRemoveNotification,
} from '../../../../../helpers/notifications/global-notification-helper'
import {
  checkNotificationCount,
  checkTaskTeamAddNotification,
  checkTaskTeamRemoveNotification,
} from '../../../../../helpers/notifications/inbox-notification-helper'
import { removeTeamMember } from '../../../../../helpers/tasks/tasks_api_helper'
/* eslint-disable arrow-parens */
import { createUser } from '../../../../../helpers/users/user_api_helper'
import globalNotificationsPage from '../../../../../page/notifications/global_notifications_page'

describe('task_team_add_remove_notification.cy', () => {
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
            prefix: 'task_team_notficication',
            teamMembers: [user1, user2],
            matterAdmins: [user1],
            projects: [
              {
                name: 'Alpha Project',
                tasks: [{ name: 'Moon', teamMembers: [user2, user1] }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
  })

  describe('When removing a user from a task', () => {
    before(() => {
      cy.login(user1.username)
      removeTeamMember(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        user2.id
      )
      appPage.visitTaskByName('Moon')
      cy.get('[data-test=users-control]').eq(0).click()
      //cy.get('[data-test=delete-icon]').eq(0).click({force:true})
    })

    it('should be one team members', () => {
      cy.get('[data-test=user-list-item]').should('have.length', 1)
    })

    describe('and then login as the removed user', () => {
      before(() => {
        cy.login(user2.username)
        appPage.visitHome()
      })

      checkGlobalNotificationCount(3)

      describe('When viewing the notification list', () => {
        before(() => {
          cy.login(user2.username)
          appPage.visitHome()
          globalNotificationsPage.get.notificationButton().click()
        })

        checkGlobalTaskTeamAddNotification(1, 'Moon')

        checkGlobalTaskTeamRemoveNotification(0, 'Moon')
      })
    })
  })
})
