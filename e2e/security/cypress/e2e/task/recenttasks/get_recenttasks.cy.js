import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('get_recenttasks.cy', () => {
  let teamMember
  before(() => {
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
        generateFixture(seed)
      })
  })

  describe('when getting recent tasks for a user', () => {
    it('should return OK status', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/tasks/recent`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('when attempting other Verbs on recent tasks end point', () => {
    beforeEach(()=>{
      cy.login(teamMember.username)
    })
    it('should return METHOD_NOT_ALLOWED status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/tasks/recent`,
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
    it('should return METHOD_NOT_ALLOWED status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/tasks/recent`,
        method: 'PATCH',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
    it('should return METHOD_NOT_ALLOWED status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/tasks/recent`,
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
  })
})
