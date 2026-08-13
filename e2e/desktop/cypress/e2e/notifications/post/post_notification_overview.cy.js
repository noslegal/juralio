/* eslint-disable arrow-parens */

import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import { createNotificationConsumers } from '../../../../../helpers/notifications/notification-consumer-helpers'
import globalNotificationsPage from '../../../../../page/notifications/global_notifications_page'
import taskdetailPage from '../../../../../page/taskdetail/taskdetail_page'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'

describe('post_notification_overview.cy', () => {
  let notificationConsumers, fixture, appPage
  const visitHelpers = new VisitHelpers()
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

  describe('after creating a note and a link as another user', () => {
    before(() => {
      cy.login(notificationConsumers.taskCreator.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'a new note' }
      )
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'a new link', url: 'https://google.com', type: 'Link' }
      )
      appPage.visitTaskByName('Moon')
      cy.get('[data-test=note-listitem-name]').eq(0).click()
      cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*/post/*').as(
        'markFinal'
      )
      taskdetailPage.noteDetails.get.finaliseButton().click()
      cy.wait('@markFinal')
      cy.wait(5000)
    })

    describe('after visiting the home page as a TTM', () => {
      before(() => {
        cy.login(notificationConsumers.taskTeamMember.username)
        visitHelpers.visitHome()
        cy.reload()
        globalNotificationsPage.get.notificationButton().click()
      })
      it('the latest notification refers to the Task', () => {
        globalNotificationsPage.get
          .notifications()
          .eq(0)
          .should('contains.text', 'was finalised')

        globalNotificationsPage.get
          .notifications()
          .eq(1)
          .should('contains.text', 'You were added to Moon')
      })

      describe('When clicking on the post notification', () => {
        before(() => {
          globalNotificationsPage.get.notifications().eq(0).click()
        })
        it('should go to the post', () => {
          cy.url().should('contain', '/post/')
        })
      })
    })
  })
})
