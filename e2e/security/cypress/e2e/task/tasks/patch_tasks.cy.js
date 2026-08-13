import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('patch_tasks.cy', () => {
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
                    {
                      name: 'Task',
                      tasks: [{ name: 'Task' }, { name: 'Task' }],
                    },
                  ],
                },
              ],
            },
          }
          fixture = generateFixture(seed)
        })
    })
  })

  describe('when patching a task list as non-MTM', () => {
    it('should return FORBIDDEN status', () => {
      cy.login(nonTeamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/tasks`,
        method: 'PATCH',
        body: {
          parentProject: fixture.projects[0].id,
          taskOrder: [{ id: fixture.tasks[0].id }],
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('when patching an incomplete task list on task as a MTM', () => {
    it('should return FORBIDDEN status', () => {
      cy.login(nonTeamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/tasks`,
        method: 'PATCH',
        body: {
          parentTask: fixture.tasks[0].id,
          taskOrder: [{ id: fixture.tasks[1].id }],
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('when patching a task list on project as a MTM', () => {
    it('should return OK status', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/tasks`,
        method: 'PATCH',
        body: {
          parentProject: fixture.projects[0].id,
          taskOrder: [{ id: fixture.tasks[0].id }],
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('when patching a task list on task as a MTM', () => {
    it('should return OK status', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/tasks`,
        method: 'PATCH',
        body: {
          parentTask: fixture.tasks[0].id,
          taskOrder: [{ id: fixture.tasks[1].id }, { id: fixture.tasks[2].id }],
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('when patching a task list with dupes on task as a MTM', () => {
    it('should return BAD_REQUEST status', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/tasks`,
        method: 'PATCH',
        body: {
          parentTask: fixture.tasks[0].id,
          taskOrder: [{ id: fixture.tasks[2].id }, { id: fixture.tasks[2].id }],
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })

  describe('when patching an invalid task list on project as a MTM', () => {
    it('should return BAD_REQUEST status', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/tasks`,
        method: 'PATCH',
        body: {
          parentProject: fixture.projects[0].id,
          taskOrder: [{ id: fixture.tasks[0].id }, { id: fixture.tasks[2].id }],
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})
