import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

let teamMember,
  nonTeamMember,
  fixture,
  matter_id,
  project_id,
  task_id,
  post_id,
  user_2

describe('private_workstream_post_api.cy', () => {
  before(() => {
    createUser().then(createdUser => {
      nonTeamMember = createdUser

      createUser('', true)
        .then(createdUser => {
          teamMember = createdUser
        })
        .then(() => {
          createUser('', true)
            .then(createdUser => {
              user_2 = createdUser
            })

            .then(() => {
              const seed = {
                matter: {
                  teamMembers: [teamMember, user_2],
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
              addNoteToTask(
                fixture.matter.id,
                fixture.projects[0].id,
                fixture.tasks[0].id,
                {
                  name: 'Private Note',
                  description: 'Trains are wonderful machines.',
                  finalised: false,
                }
              ).then(res => {
                post_id = res.id
              })
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
  })
  describe('As a regular user ', () => {
    before(() => {
      cy.login(user_2.username)
      matter_id = fixture.matter.id
      project_id = fixture.projects[0].id
      task_id = fixture.tasks[0].id
    })
    beforeEach(() => {
      cy.login(user_2.username)
    })
    it('should not be allowed to fetch a post', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/post/${post_id}`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not be allowed to fetch a post', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/posts`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not be allowed to update a post', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/post/${post_id}`,
        method: 'PATCH',
        body: { description: 'test' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should be allowed to create a post', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/posts`,
        method: 'POST',
        body: { description: 'test', name: 'new post' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not be allowed to archive a post', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/post/${post_id}`,
        method: 'PATCH',
        body: { archive: true },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not be allowed to unarchive a post', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/post/${post_id}`,
        method: 'PATCH',
        body: {
          matterId: matter_id,
          projectId: project_id,
          taskId: task_id,
          type: 'prevLocation',
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should be allowed to add an author to a post', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/post/${post_id}/authors`,
        method: 'POST',
        body: {
          userId: teamMember.id,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should be allowed to remove an author to a post', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/post/${post_id}/authors/${
          teamMember.id
        }`,
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should be allowed to move a post', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/post/${post_id}/move`,
        method: 'POST',
        body: {
          newTaskId: fixture.tasks[1].id,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
  describe('As a private user ', () => {
    beforeEach(() => {
      cy.login(teamMember.username)
    })
    it('should be allowed to fetch a post', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/post/${post_id}`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should be allowed to fetch a post', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/posts`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should be allowed to update a post', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/post/${post_id}`,
        method: 'PATCH',
        body: { description: 'test' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should be allowed to create a post', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/posts`,
        method: 'POST',
        body: { description: 'test', name: 'new post' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.CREATED)
      })
    })
    it('should be allowed to archive a post', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/post/${post_id}`,
        method: 'PATCH',
        body: { archive: true },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should be allowed to unarchive a post', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/post/${post_id}`,
        method: 'PATCH',
        body: {
          matterId: matter_id,
          projectId: project_id,
          taskId: task_id,
          type: 'prevLocation',
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should be allowed to add an author to a post', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/post/${post_id}/authors`,
        method: 'POST',
        body: {
          userId: user_2.id,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should be allowed to remove an author to a post', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/post/${post_id}/authors/${
          user_2.id
        }`,
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.NO_CONTENT)
      })
    })
    it('should be allowed to move a post', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/task/${task_id}/post/${post_id}/move`,
        method: 'POST',
        body: {
          newTaskId: fixture.tasks[1].id,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })
})
