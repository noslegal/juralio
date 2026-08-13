import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'
import { updateTask } from '../../../../helpers/matterprojects/task_api_helper'

describe('post_user_notification_dismiss.cy', () => {
  let actor,
    recipient,
    otherRecipient,
    fixture,
    notifications,
    otherNotificationId

  before(() => {
    createUser()
      .then(createdUser => {
        actor = createdUser
      })
      .then(createUser)
      .then(createdUser => {
        recipient = createdUser
      })
      .then(createUser)
      .then(createdUser => {
        otherRecipient = createdUser
      })
      .then(() => {
        // Both recipients sit on the task team so the actor's status change
        // fans out a genuine UserNotification row to each of them — giving us a
        // real notification owned by a different user to attempt an IDOR against.
        const seed = {
          matter: {
            teamMembers: [actor, recipient, otherRecipient],
            matterAdmins: [actor, recipient],
            projects: [
              {
                name: 'Project 1',
                tasks: [
                  { name: 'Task', teamMembers: [recipient, otherRecipient] },
                ],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
      .then(() => {
        cy.login(actor.username)
        const task = fixture.tasks[0]
        updateTask(fixture.matter.id, task.projectId, task.id, {
          status: 'in-progress',
        })
      })
  })

  describe('when trying to dismiss a user notification', () => {
    describe('that exists and is owned by user', () => {
      before(() => {
        cy.login(recipient.username)

        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/usernotifications`,
          method: 'GET',
        }).then(response => {
          notifications = response.body.items
        })
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/usernotifications/${
            notifications[0].id
          }/dismiss`,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('that is owned by a different user', () => {
      before(() => {
        cy.login(actor.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/usernotifications/${
            notifications[0].id
          }/dismiss`,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('that is owned by another user', () => {
      before(() => {
        // Capture a real notification belonging to otherRecipient.
        cy.login(otherRecipient.username)

        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/usernotifications`,
          method: 'GET',
        }).then(response => {
          otherNotificationId = response.body.items[0].id
        })
      })

      it('should return FORBIDDEN and leave the notification undismissed', () => {
        cy.login(recipient.username)

        cy.apiSpecRequest({
          url: `${Cypress.env(
            'serverBaseUrl'
          )}/usernotifications/${otherNotificationId}/dismiss`,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })

        // A dismissed row drops out of the list, so its continued presence
        // proves the rejected attempt did not dismiss the owner's notification.
        cy.login(otherRecipient.username)

        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/usernotifications`,
          method: 'GET',
        }).then(response => {
          const notification = response.body.items.find(
            n => n.id === otherNotificationId
          )
          expect(notification).to.not.be.undefined
        })
      })
    })
  })
})
