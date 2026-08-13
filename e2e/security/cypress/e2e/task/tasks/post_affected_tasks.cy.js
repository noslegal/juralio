import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('post_affected_tasks.cy', () => {
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
                  tasks: [
                    { name: 'Task', tasks: [{ name: 'T1' }] },
                    { name: 'Task' },
                  ],
                },
              ],
            },
          }
          fixture = generateFixture(seed)
        })
    })
  })

  describe('when posting a updated task as non-MTM', () => {
    it('should return FORBIDDEN status', () => {
      cy.login(nonTeamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/tasksAffected`,
        method: 'POST',
        body: {
          id: fixture.tasks[0].id,
          properties: { status: 'done' },
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('when getting a updated task as an MTM', () => {
    it('should return METHOD_NOT_ALLOWED request status', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/tasksAffected`,
        method: 'GET',
        body: {
          id: fixture.tasks[0].id,
          properties: { status: 'done' },
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
  })

  describe('when delete a updated task as an MTM', () => {
    it('should return method not allowed request status', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/tasksAffected`,
        method: 'DELETE',
        body: {
          id: fixture.tasks[0].id,
          properties: { status: 'done' },
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
  })

  describe('when posting a updated task as an MTM', () => {
    it('should return OK status', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/tasksAffected`,
        method: 'POST',
        body: {
          id: fixture.tasks[0].id,
          properties: { status: 'done' },
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })
})
