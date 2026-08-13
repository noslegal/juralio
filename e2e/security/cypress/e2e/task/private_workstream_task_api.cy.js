import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

let teamMember, nonTeamMember, fixture, matter_id, project_id, task_id

describe('private_workstream_task_api.cy', () => {
  before(() => {
    createUser().then(createdUser => {
      nonTeamMember = createdUser

      createUser('', true)
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
                  name: 'Private Project',
                  tasks: [{ name: 'Task' }, { name: 'task2' }],
                },
                {
                  name: 'Public  Project',
                  tasks: [],
                },
              ],
            },
          }
          fixture = generateFixture(seed)
        })
        .then(() => {
          cy.login(teamMember)
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
              fixture.matter.id
            }/workstreams/${fixture.projects[0].id}`,
            method: 'PATCH',
            body: {
              isPrivate: true,
            },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
    })
  })
  describe('when trying to interact with a task not as a private team member', () => {
    beforeEach(() => {
      matter_id = fixture.matter.id
      project_id = fixture.projects[0].id
      task_id = fixture.tasks[0].id
      cy.login(nonTeamMember.username)
    })
    it('should not allow us to fetch a task', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not allow us to update a task', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}`,
        method: 'PATCH',
        body: { name: 'update!' },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not allow us to create a task', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/tasks`,
        method: 'POST',
        body: { name: 'update!', status: 'not-started', project: project_id },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not allow us to copy a task', () => {
      cy.login(nonTeamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/copy`,
        method: 'POST',
        body: { name: 'copied task', destinationParentType: 'PROJECT' },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not allow us to move a task', () => {
      cy.login(nonTeamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/move`,
        method: 'POST',
        body: { name: 'copied task' },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not allow us to follow a task', () => {
      cy.login(nonTeamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/followers`,
        method: 'POST',
        body: { name: 'copied task' },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not allow us to unfollow a task', () => {
      cy.login(nonTeamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/followers/${
          teamMember.id
        }`,
        method: 'DELETE',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not allow us to reorder a task', () => {
      let p

      cy.login(nonTeamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/tasks`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(response => {
        p = response.body

        cy.apiSpecRequest({
          url: `${Cypress.env(
            'serverBaseUrl'
          )}/matter/${matter_id}/workstreams/${project_id}/tasks`,
          method: 'PATCH',
          body: { taskOrder: p },
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
    it('should not allow us to archive a task', () => {
      cy.login(nonTeamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/archive`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not allow us to unarchive a task', () => {
      cy.login(nonTeamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/unarchive`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('when trying to interact with a task not as a private team member', () => {
    beforeEach(() => {
      cy.login(teamMember.username)
    })
    it('should  allow us to fetch a task', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should allow us to update a task', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}`,
        method: 'PATCH',
        body: { name: 'update!' },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should allow us to create a task', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/tasks`,
        method: 'POST',
        body: { name: 'update!', status: 'not-started', project: project_id },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.CREATED)
      })
    })
    it('should allow us to copy a task', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/copy`,
        method: 'POST',
        body: { name: 'copied task' },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.CREATED)
      })
    })
    it('should allow us to move a task', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/move`,
        method: 'POST',
        body: { name: 'copied task', destinationParentType: 'PROJECT' },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should allow us to follow a task', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/followers`,
        method: 'POST',
        body: { name: 'copied task' },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should allow us to unfollow a task', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/followers/${
          teamMember.id
        }`,
        method: 'DELETE',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.NO_CONTENT)
      })
    })
    it('should allow us to reorder a task', () => {
      let p

      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/tasks`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(response => {
        p = response.body

        cy.apiSpecRequest({
          url: `${Cypress.env(
            'serverBaseUrl'
          )}/matter/${matter_id}/workstreams/${project_id}/tasks`,
          method: 'PATCH',
          body: { taskOrder: p },
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
    it('should  allow us to archive a task', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/archive`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })
})
