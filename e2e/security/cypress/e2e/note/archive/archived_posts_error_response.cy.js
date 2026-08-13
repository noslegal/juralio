/*
Purpose: Tests posts endpoint to ensure HTTP return codes are sent and not 500s.

Test flow:  Set up Task with 2 note and attempt operations.


Date created: 10/03/22
*/

import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('archived_posts_error_response.cy', () => {
  let matterAdmin, fixture
  before(() => {
    createUser()
      .then(createdUser => {
        matterAdmin = createdUser
      })
      .then(() => {
        const seed = {
          matter: {
            teamMembers: [matterAdmin],
            matterAdmins: [matterAdmin],
            projects: [
              {
                name: 'Project 1',
                tasks: [{}, {}],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('When a Matter has archived Posts', () => {
    before(() => {
      cy.login(matterAdmin.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'Notey note', description: 'A test note.' }
      ).then(result => {
        note = result
        addNoteToTask(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id,
          { name: 'Notey note2', description: 'A test note2.' }
        ).then(result => {
          note2 = result
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/workstreams/${fixture.projects[0].id}/task/${
              fixture.tasks[0].id
            }/post/${note2.id}`,
            method: 'PATCH',
            body: { archive: true },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
      })
    })

    describe('When attempting to restore a non-archived note', () => {
      before(() => {
        cy.login(matterAdmin.username)
      })
      it('should return NOT_ACCEPTABLE status when task Id is not valid', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/post/${note.id}`,
          method: 'PATCH',
          body: {
            matterId: fixture.matter.id,
            projectId: fixture.projects[0].id,
            taskId: fixture.tasks[0].id,
            type: 'prevLocation',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.NOT_ACCEPTABLE)
        })
      })
    })

    describe('When attempting to restore an archived note to an invalid task', () => {
      before(() => {
        cy.login(matterAdmin.username)
      })
      it('should return FORBIDDEN status when task Id is not valid', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/post/${note2.id}`,
          method: 'PATCH',
          body: {
            matterId: fixture.matter.id,
            projectId: fixture.projects[0].id,
            taskId: 1234567890, // Fake task Id.
            type: 'prevLocation',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('When attempting to archive an archived note', () => {
      before(() => {
        cy.login(matterAdmin.username)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note.id}`,
          method: 'PATCH',
          body: { archive: true },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
      it('should return FORBIDDEN status when task is already archived', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note.id}`,
          method: 'PATCH',
          body: { archive: true, pop: true },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})
