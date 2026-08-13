import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

let teamMember,
  nonTeamMember,
  fixture,
  matter_id,
  project_id,
  task_id,
  seed,
  nonAdminMember2
describe('private_workstream_add_remove_member_api.cy', () => {
  before(() => {
    createUser().then(createdUser => {
      nonAdminMember = createdUser

      createUser('', true)
        .then(createdUser => {
          teamMember = createdUser
        })
        .then(() =>
          createUser('', true)
            .then(u => {
              nonAdminMember2 = u
              seed = {
                matter: {
                  teamMembers: [teamMember, nonAdminMember, nonAdminMember2],
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
        )
    })
  })
  describe('as a admin member who is not in the PW', () => {
    beforeEach(() => {
      matter_id = fixture.matter.id
      project_id = fixture.projects[0].id
      cy.login(teamMember.username)
    })
    it('should allow us to add a PW user', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/teammembers`,
        method: 'POST',
        body: { users: [nonAdminMember2.id] },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        it('should allow us to remove an existing PW user', () => {
          cy.login(teamMember.username)
          console.log(teamMember)
          cy.apiSpecRequest({
            url: `${Cypress.env(
              'serverBaseUrl'
            )}/matter/${matter_id}/workstreams/${project_id}/teammembers/${
              nonAdminMember2.id
            }`,
            method: 'DELETE',
            failOnStatusCode: false,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.NO_CONTENT)
            describe('as a admin member who is in the PW', () => {
              before(() => {
                cy.login(teamMember.username)
                matter_id = fixture.matter.id
                project_id = fixture.projects[0].id
                task_id = fixture.tasks[0].id
                cy.apiSpecRequest({
                  url: `${Cypress.env('serverBaseUrl')}/matter/${
                    fixture.matter.id
                  }/workstreams/${fixture.projects[0].id}/teammembers`,
                  method: 'POST',
                  body: { users: [teamMember.id] },
                }).then(response => {
                  expect(response.status).to.eq(HttpStatus.OK)
                })
              })
              beforeEach(() => {
                matter_id = fixture.matter.id
                project_id = fixture.projects[0].id
                cy.login(teamMember.username)
              })
              it('should allow us to add a PW user', () => {
                cy.apiSpecRequest({
                  url: `${Cypress.env(
                    'serverBaseUrl'
                  )}/matter/${matter_id}/workstreams/${project_id}/teammembers`,
                  method: 'POST',
                  body: { users: [nonAdminMember2.id] },
                  failOnStatusCode: false,
                }).then(response => {
                  expect(response.status).to.eq(HttpStatus.OK)
                  it('should allow us to remove an existing PW user', () => {
                    cy.login(teamMember.username)
                    cy.apiSpecRequest({
                      url: `${Cypress.env(
                        'serverBaseUrl'
                      )}/matter/${matter_id}/workstreams/${project_id}/teammembers/${
                        nonAdminMember2.id
                      }`,
                      method: 'DELETE',
                      failOnStatusCode: false,
                    }).then(response => {
                      expect(response.status).to.eq(HttpStatus.NO_CONTENT)
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })

  describe('as a non admin member who is not in the PW', () => {
    beforeEach(() => {
      matter_id = fixture.matter.id
      project_id = fixture.projects[0].id
      cy.login(nonAdminMember.username)
    })
    it('should not allow us to add a PW user', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/teammembers`,
        method: 'POST',
        body: { users: [nonAdminMember.id] },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
    it('should not allow us to remove an existing PW user', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/teammembers/${
          teamMember.id
        }`,
        method: 'DELETE',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
  describe('as a non admin member who is in the PW', () => {
    before(() => {
      cy.login(teamMember.username)
      matter_id = fixture.matter.id
      project_id = fixture.projects[0].id
      task_id = fixture.tasks[0].id
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/teammembers`,
        method: 'POST',
        body: { users: [nonAdminMember.id] },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    beforeEach(() => {
      matter_id = fixture.matter.id
      project_id = fixture.projects[0].id
      cy.login(nonAdminMember.username)
    })
    it('should not allow us to add a PW user', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/teammembers`,
        method: 'POST',
        body: { users: [nonAdminMember.id] },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
    it('should not allow us to remove an existing PW user', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/teammembers/${
          teamMember.id
        }`,
        method: 'DELETE',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})
