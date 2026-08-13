import HttpStatus from 'http-status-codes'
import { generateFixtureUsingMatterCreator } from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

let organisation,
  orgAdmin,
  nonTeamMember,
  fixture,
  matter_id,
  project_id,
  task_id,
  note_id

describe('matter_pending_deletion.cy', () => {
  before(() => {
    createOrganisation('', false).then(o => {
      organisation = o.body
      createUser('', true, false,{
        roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
      }).then(createdUser => {
        sysadminAddUserToOrganisation(
          { id: organisation.id },
          createdUser
        ).then(cu => {
          orgAdmin = cu.body
          createUser('', true, false).then(createdUser => {
            sysadminAddUserToOrganisation(organisation, createdUser)
              .then(cu2 => {
                nonTeamMember = cu2.body
                const seed = {
                  matter: {
                    teamMembers: [nonTeamMember],
                    matterAdmins: [],
                    projects: [
                      {
                        name: 'Project',
                        tasks: [{ name: 'Task' }],
                      },
                    ],
                  },
                }
                console.log(orgAdmin)
                fixture = generateFixtureUsingMatterCreator(
                  seed,
                  orgAdmin.username
                )
              })
              .then(() => {
                addNoteToTask(
                  fixture.matter.id,
                  fixture.projects[0].id,
                  fixture.tasks[0].id,
                  {
                    name: 'note.',
                    finalised: false,
                    privateNote: false,
                    description: '<p>Text</p>',
                  }
                )
              })
              .then(note => {
                note_id = note.id
              })
          })
        })
      })
    })
  })
  describe('when logged in as a regular team member', () => {
    before(() => {
      cy.login(nonTeamMember)
      matter_id = fixture.matter.id
      project_id = fixture.projects[0].id
      task_id = fixture.tasks[0].id
    })
    it('should NOT allow us to PATCH the matter status for deletion', () => {
      console.log(orgAdmin,nonTeamMember)
      cy.login(nonTeamMember)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }`,
        method: 'PATCH',
        body: {
          matterStatus: 'pending deletion',
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
  describe('when making the request as an org admin', () => {
    beforeEach(() => {
      cy.login(orgAdmin)
      matter_id = fixture.matter.id
      project_id = fixture.projects[0].id
      task_id = fixture.tasks[0].id
    })
    it('should allow us to PATCH the matter status for deletion', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }`,
        method: 'PATCH',
        body: {
          matterStatus: 'pending deletion',
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })

    it('should NOT allow us to PATCH the matter when it is pending deletion', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }`,
        method: 'PATCH',
        body: {
          name: 'a name',
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    it('should NOT allow us to GET the matter when it is pending deletion', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${fixture.matter.id}`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.NOT_FOUND)
      })
    })

    it('should NOT allow us to GET all the workstreams when it is pending deletion', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.NOT_FOUND)
      })
    })

    it('should NOT allow us to GET a workstream when it is pending deletion', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${project_id}`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    it('should NOT allow us to PATCH a workstream when it is pending deletion', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/workstreams/${project_id}`,
        body: {
          name: 'test',
        },
        method: 'PATCH',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.NOT_FOUND)
      })
    })

    it('should NOT allow us to GET all tasks when they are pending deletion', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${project_id}/tasks`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    it('should NOT allow us to GET a task when it is pending deletion', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${project_id}/task/${task_id}`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    it('should NOT allow us to PATCH a task when it is pending deletion', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/workstreams/${project_id}/task/${task_id}`,
        body: {
          name: 'test',
        },
        method: 'PATCH',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    it('should NOT allow us to GET all task posts when they are pending deletion', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${project_id}/task/${task_id}/posts`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    it('should NOT allow us to GET a task post when it is pending deletion', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${project_id}/task/${task_id}/post/${note_id}`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    it('should NOT allow us to PATCH a task post when it is pending deletion', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/workstreams/${project_id}/task/${task_id}/post/${note_id}`,
        body: {
          name: 'test',
        },
        method: 'PATCH',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    it('should allow us to GET a deleted matter log', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matters/deleted`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })

    it('should NOT allow us to POST a deleted matter log', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matters/deleted`,
        body: {
          name: 'test',
        },
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })

    it('should NOT allow us to PATCH a deleted matter log', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matters/deleted`,
        body: {
          id: 23,
          name: 'test',
        },
        method: 'PATCH',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })

    it('should NOT allow us to DELETE a deleted matter log', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matters/deleted`,
        body: {
          id: 23,
        },
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
  })

  describe('when logged in as a regular team member', () => {
    beforeEach(() => {
      cy.login(nonTeamMember)
    })
    it('should NOT allow us to GET a deleted matter log', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matters/deleted`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    it('should NOT allow us to POST a deleted matter log', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matters/deleted`,
        body: {
          name: 'test',
        },
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    it('should NOT allow us to PATCH a deleted matter log', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matters/deleted`,
        body: {
          id: 23,
          name: 'test',
        },
        method: 'PATCH',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    it('should NOT allow us to DELETE a deleted matter log', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matters/deleted`,
        body: {
          id: 23,
        },
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
