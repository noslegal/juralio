import chaiColors from 'chai-colors'
import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createNotificationConsumers } from '../../../../../helpers/notifications/notification-consumer-helpers'
import globalNotificationsPage from '../../../../../page/notifications/global_notifications_page'

chai.use(chaiColors)

describe('notification_read_unread_status.cy', () => {
  let notificationConsumers, fixture, appPage

  before(() => {
    createNotificationConsumers().then(nCs => {
      notificationConsumers = nCs
      const seed = {
        matter: {
          prefix: 'note_created_event',
          teamMembers: [notificationConsumers.taskCreator],
          matterAdmins: [
            notificationConsumers.taskCreator,
            notificationConsumers.matterTeamMember,
          ],
          projects: [
            {
              name: 'Beta Project',
              tasks: [],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When a user views their notifications', () => {
    describe('new notifications should initially have unread styling', () => {
      before(() => {
        cy.login(notificationConsumers.taskCreator.username)
        appPage.visitHome()
        globalNotificationsPage.get.notificationButton().click()
      })
      it('the notification should have bold text', () => {
        cy.get('[data-test=global-notification-title]')
          .last()
          .should($labels => {
            expect($labels).to.have.css('font-weight', '700')
          })
      })
    })

    describe('and clicks an unread notification', () => {
      before(() => {
        cy.login(notificationConsumers.taskCreator.username)
        appPage.visitHome()
        globalNotificationsPage.get.notificationButton().click()
        cy.get('[data-test=global-notification-title]').last().click()
      })

      describe('When viewing the notifications', () => {
        before(() => {
          globalNotificationsPage.get.notificationButton().click()
        })
        it('the notification should have normal weighted text', () => {
          cy.get('[data-test=global-notification-title]')
            .last()
            .should($labels => {
              expect($labels).to.not.have.css('font-weight', '700')
            })
        })
      })
    })
  })
})
