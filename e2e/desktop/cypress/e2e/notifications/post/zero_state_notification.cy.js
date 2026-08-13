import {
    generateFixture, getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import globalNotificationsPage from '../../../../../page/notifications/global_notifications_page'



describe('zero_state_notification.cy', () => {
  let user1, user2, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user2 = createdUser

      createUser().then(createdUser => {
        user1 = createdUser
        const seed = {
          matter: {
            prefix: 'task_created_event',
            teamMembers: [user2],
            matterAdmins: [user2],
            projects: [],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
    })
  })

  describe('when viewing the Home page as a new user', () => {
    before(() => {
      cy.login(user1.username)
      appPage.visitHome()
    })

    describe('the notifications zero state', () => {
      it('should NOT show the notification count', () => {
        globalNotificationsPage.get.notificationChip().should('not.exist')
      })
      describe('when the notification list is shown', () => {
        before(() => {
          globalNotificationsPage.get.notificationButton().click()
        })
        it('should show the correct zero state text', () => {
          globalNotificationsPage.get.zeroState().should('be.visible')
        })
      })
    })
  })
})
