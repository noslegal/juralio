import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

let teamMember,
  nonTeamMember,
  fixture,
  matter_id,
  project_id,
  task_id,
  resource_id

describe('private_workstream_api.cy', () => {
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
              teamMembers: [teamMember, nonTeamMember],
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
  describe('as a private workstream member in a multi workstream matter', () => {
    beforeEach(() => {
      matter_id = fixture.matter.id
      project_id = fixture.projects[0].id
      task_id = fixture.tasks[0].id
      cy.login(teamMember.username)
    })
    it('should  allow us to fetch the project', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should  allow us to fetch the project preview', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/preview`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should  allow us to update the project', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/admin/matter/${matter_id}/workstreams/${project_id}`,
        method: 'PATCH',
        body: { name: 'new name' },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should allow us to fetch the project resources', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/resources`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should allow us to add to the project resources', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/resources`,
        method: 'POST',
        body: { name: 'resource', url: 'https://www.google.com', image: null },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        resource_id = response.body.id
      })
    })
    it('should allow us to update the project resources', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/resources/${resource_id}`,
        method: 'PATCH',
        body: { name: 'resource 1' },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should allow us to delete the project resources', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/resources/${resource_id}`,
        method: 'DELETE',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should  allow us to fetch the projects for the matter', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${matter_id}/workstreams`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body.length).to.eq(2)
      })
    })
    it('should allow us to add to the project visit recency', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/visit`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })
  describe('as a regular workstream member in a multi workstream matter', () => {
    beforeEach(() => {
      matter_id = fixture.matter.id
      project_id = fixture.projects[0].id
      task_id = fixture.tasks[0].id
      cy.login(nonTeamMember.username)
    })

    it('should  allow us to fetch the project', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should  allow us to fetch the project preview', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/preview`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should  allow us to update the project', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/admin/matter/${matter_id}/workstreams/${project_id}`,
        method: 'PATCH',
        body: { name: 'new name' },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
    it('should allow us to fetch the project resources', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/resources`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
    it('should allow us to add to the project resources', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/resources`,
        method: 'POST',
        body: { name: 'resource', url: 'https://www.google.com', image: null },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
    it('should allow us to update the project resources', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/resources/${resource_id}`,
        method: 'PATCH',
        body: { name: 'resource 1' },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
    it('should allow us to update the project resources', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/resources/${resource_id}`,
        method: 'DELETE',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should  allow us to fetch the projects for the matter', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${matter_id}/workstreams`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body.length).to.eq(1)
      })
    })
    it('should allow us to add to the project visit recency', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/visit`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
