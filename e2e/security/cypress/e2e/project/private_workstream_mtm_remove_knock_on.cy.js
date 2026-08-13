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
describe('private_workstream_mtm_remove_knock_on.cy', () => {
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
              matter_id = fixture.matter.id
              project_id = fixture.projects[0].id
              task_id = fixture.tasks[0].id
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
                cy.login(teamMember)

                cy.apiSpecRequest({
                  url: `${Cypress.env(
                    'serverBaseUrl'
                  )}/matter/${matter_id}/workstreams/${project_id}/teammembers`,
                  method: 'POST',
                  body: { users: [nonAdminMember2.id] },
                  failOnStatusCode: false,
                }).then(response => {
                  expect(response.status).to.eq(HttpStatus.OK)
                })
              })
            })
        )
    })
  })
  describe('when removing a MTM', () => {
    before(() => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${matter_id}/team`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(response => {
        let ttm = response.body.filter(u => u.user.id === nonAdminMember2.id)[0]
        cy.apiSpecRequest({
          url: `${Cypress.env(
            'serverBaseUrl'
          )}/admin/matter/${matter_id}/teammembers/${ttm.teamMemberId}`,
          method: 'DELETE',
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
    it('should also remove them from the PW', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body.privateWorkstreamTeam.length).to.eq(1)
      })
    })
  })
})
