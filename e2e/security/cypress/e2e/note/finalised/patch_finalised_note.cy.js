import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('patch_finalised_note.cy', () => {
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
                tasks: [{ name: 'Task' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when trying to update a finalised note on a Task', () => {
    let note
    describe('as a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(teamMember.username)
        addNoteToTask(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id,
          { name: 'Notey note', description: 'A test note.' }
        ).then(result => {
          note = result
          cy.login(teamMember.username)
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/workstreams/${fixture.projects[0].id}/task/${
              fixture.tasks[0].id
            }/post/${note.id}`,
            method: 'PATCH',
            body: { finalised: true },
          })
        })
      })

      it('should return OK status when accessed (GET) by team member', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note.id}`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })

      it('should return BAD_REQUEST status for name update', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note.id}`,
          method: 'PATCH',
          body: { name: 'New name' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })

      it('should return BAD_REQUEST status for description update', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note.id}`,
          method: 'PATCH',
          body: { description: 'New description.' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })

    describe('as a user who is NOT a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(nonTeamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note.id}`,
          method: 'PATCH',
          body: { description: 'New description time.' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})
