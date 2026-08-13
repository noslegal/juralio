/*
Purpose: Tests the post move endpoint.

Test flow:  Happy path and then Verb coverage.


Date created: 8/12/21
*/

import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('move_post.cy', () => {
  let teamMember, nonTeamMember, fixture
  before(() => {
    createUser()
      .then(createdUser => {
        nonTeamMember = createdUser
      })
      .then(createUser)
      .then(createdUser => {
        teamMember = createdUser
      })
      .then(() => {
        const seed = {
          matter: {
            teamMembers: [teamMember],
            matterAdmins: [teamMember],
            projects: [
              {
                name: 'Project 1',
                tasks: [
                  { name: 'Task' },
                  {
                    name: 'Task',
                    properties: { status: 'task-not-required' },
                    status: 'task-not-required',
                  },
                  { name: 'Task' },
                ],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  let url, note

  describe('as a MATTER TEAM MEMBER', () => {
    before(() => {
      cy.login(teamMember.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'Notey note', description: 'A test note.' }
      ).then(result => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${fixture.tasks[1].id}`,
          method: 'PATCH',
          body: { status: 'task-not-required' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })

        note = result
        url = `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/post/${note.id}/move`
      })
    })

    describe('When moving a post to not required task', () => {
      before(() => {
        cy.login(teamMember.username)
      })

      it('returns a status code of BAD_REQUEST', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
          body: { newTaskId: fixture.tasks[1].id },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })

    describe('When moving a post to another task', () => {
      before(() => {
        cy.login(teamMember.username)
      })

      it('returns a status code of OK', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
          body: { newTaskId: fixture.tasks[2].id },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when attempting other verbs on the endpoint', () => {
      const verbs = ['GET', 'PUT', 'PATCH', 'DELETE']

      verbs.forEach(verb =>
        it(`should return METHOD_NOT_ALLOWED status for ${verb}`, () => {
          cy.login(teamMember.username)
          cy.apiSpecRequest({
            url,
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
        })
      )
    })
  })

  describe('as a unauthorised user', () => {
    const verbs = ['GET', 'PUT', 'PATCH', 'DELETE']

    verbs.forEach(verb =>
      it(`should return UNAUTHORIZED status for ${verb}`, () => {
        cy.apiSpecRequest({
          url,
          method: verb,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
    )
  })
})
