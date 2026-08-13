import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('post_finalised_behaviours.cy', () => {
  let teamMember, teamMember2, fixture, note
  const visitHelpers = new VisitHelpers()
  before(() => {
    createUser()
      .then(createdUser => {
        teamMember2 = createdUser
      })
      .then(createUser)
      .then(createdUser => {
        teamMember = createdUser
      })
      .then(() => {
        const seed = {
          matter: {
            teamMembers: [teamMember, teamMember2],
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
  describe('when trying to create a note on a Task', () => {
    describe('as a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(teamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/posts`,
          method: 'POST',
          body: {
            name: 'Notey note',
            description: 'A test note.',
            finalised: true,
          },
        }).then(response => {
          note = response.body
          expect(response.status).to.eq(HttpStatus.CREATED)
        })
      })
    })
    describe('as a mtm', () => {
      before(() => {
        cy.login(teamMember2)
      })
      it('should not let me update a post type', () => {
        cy.login(teamMember2)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note.id}`,
          method: 'PATCH',
          body: { type: 'MEETING_NOTE' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
      it('should not let me add myself to a finalsied post', () => {
        cy.login(teamMember2)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note.id}/authors`,
          method: 'POST',
          body: { userId: teamMember2.id },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})
