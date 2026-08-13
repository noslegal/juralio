import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('patch_task.cy', () => {
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
                {
                  name: 'Other Project',
                  tasks: [],
                },
              ],
            },
          }
          fixture = generateFixture(seed)
        })
    })
  })

  describe('when patching a task as non-MTM', () => {
    it('should return FORBIDDEN status', () => {
      cy.login(nonTeamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${fixture.tasks[0].id}`,
        method: 'PATCH',
        body: { name: 'Toby', status: 'done' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('when patching a task as a MTM', () => {
    it('should return OK status', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${fixture.tasks[0].id}`,
        method: 'PATCH',
        body: { name: 'Toby', status: 'done' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })
  describe('when patching a task list_idx as a MTM', () => {
    it('should return OK status', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${fixture.tasks[0].id}`,
        method: 'PATCH',
        body: { newListIdx: 5 },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })
  describe('when patching a task as a MTM with bad data ', () => {
    it('should return OK status', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${fixture.tasks[0].id}`,
        method: 'PATCH',
        body: { badData: 5 },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
  describe('when attempting to access a task from another project', () => {
    it('should return FORBIDDEN', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[1].id}/task/${fixture.tasks[0].id}`,
        method: 'PATCH',
        body: { name: 'Toby', status: 'done' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
