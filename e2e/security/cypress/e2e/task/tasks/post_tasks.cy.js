import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('post_tasks.cy', () => {
  let teamMember, nonTeamMember, fixture
  before(() => {
    createUser().then(createdUser => {
      nonTeamMember = createdUser

      createUser()
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
  })

  describe('when getting a task as non-MTM', () => {
    it('should return FORBIDDEN status', () => {
      cy.login(nonTeamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/tasks`,
        method: 'POST',
        body: {
          matterId: fixture.matter.id,
          name: 'Task',
          project: fixture.projects[0].id,
          status: 'not-started',
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('when getting a task as a MTM', () => {
    it('should return CREATED status', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/tasks`,
        method: 'POST',
        body: {
          matterId: fixture.matter.id,
          name: 'Task',
          project: fixture.projects[0].id,
          status: 'not-started',
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.CREATED)
      })
    })
  })
})
