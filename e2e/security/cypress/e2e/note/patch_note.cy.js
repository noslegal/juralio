import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('patch_note.cy', () => {
  let teamMember, nonTeamMember, fixture, note
  before(() => {
    createUser()
      .then(createdUser => {
        nonTeamMember = createdUser
      })
      .then(createUser)
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
                tasks: [{ name: 'Task' }, { name: 'Task 2' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when trying to update a note from a Task', () => {
    let note
    before(() => {
      cy.login(teamMember.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'Notey note', description: 'A test note.' }
      ).then(result => {
        note = result
      })
    })

    describe('as a user who is NOT a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(nonTeamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note.id}`,
          method: 'PATCH',
          body: { name: 'New name', description: 'New description.' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a MATTER TEAM MEMBER', () => {
      beforeEach(() => {
        cy.login(teamMember.username)
      })

      it('should return OK status when using a valid payload', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note.id}`,
          method: 'PATCH',
          body: { name: 'New name', description: 'New description.' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })

      it('should respond BAD_REQUEST status when trying to set XSS payload', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note.id}`,
          method: 'PATCH',
          body: {
            name: 'XSS attacj',
            description: 'XSS in url.',
            url: 'javascript:alert("Hello");',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })

    describe('as a MATTER TEAM MEMBER trying to update the note creator', () => {
      before(() => {
        cy.login(teamMember.username)
      })

      it('should not allow modification of the note creator', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note.id}`,
          method: 'PATCH',
          body: {
            creator: {
              enabled: false,
              firstname: 'pwnedFirst',
              id: 0,
              lastname: 'pwnedLast',
              roles: ['ROLE_SYSADMIN', 'ROLE_MATTER_CREATOR'],
              username: 'pwned@pwned.com',
            },
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })
  })
  describe('when trying to update a post in a different task', () => {
    before(() => {
      cy.login(teamMember.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'Notey note', description: 'A test note.' }
      ).then(result => {
        note = result
      })
    })
    it('should return FORBIDDEN status when accessing from the wrong task', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[1].id
        }/post/${note.id}`,
        method: 'PATCH',
        body: { name: 'New name', description: 'New description.' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
  describe('when trying to update a post when not a MTM', () => {
    before(() => {
      cy.login(nonTeamMember.username)
    })
    it('should return FORBIDDEN status when accessing from the wrong task', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[1].id
        }/post/${note.id}`,
        method: 'PATCH',
        body: { name: 'New name', description: 'New description.' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
