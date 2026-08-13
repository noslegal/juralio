import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('get_notes.cy', () => {
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

  describe('when trying to list notes from a Task', () => {
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
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
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
          }/posts`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})
