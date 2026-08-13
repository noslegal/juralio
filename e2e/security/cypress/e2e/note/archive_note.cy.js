import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('archive_note.cy', () => {
  let teamMember, anotherTeamMember, nonTeamMember, fixture, note, note2
  before(() => {
    createUser().then(createdUser => {
      anotherTeamMember = createdUser
      createUser().then(createdUser => {
        nonTeamMember = createdUser
        createUser()
          .then(createdUser => {
            teamMember = createdUser
          })
          .then(() => {
            const seed = {
              matter: {
                teamMembers: [teamMember, anotherTeamMember],
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
    })
  })

  describe('when trying to archive a non-private note', () => {
    before(() => {
      cy.login(teamMember.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'Notey note', description: 'A test note.' }
      ).then(result => {
        note = result
        addNoteToTask(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id,
          { name: 'Notey note2', description: 'A test note2.' }
        ).then(result => {
          note2 = result
        })
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
          body: { archive: true },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a MATTER TEAM MEMBER & MATTER ADMIN', () => {
      before(() => {
        cy.login(teamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note.id}`,
          method: 'PATCH',
          body: { archive: true },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(anotherTeamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note2.id}`,
          method: 'PATCH',
          body: { archive: true },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })

  describe('when trying to archive a private note from a Task', () => {
    before(() => {
      cy.login(teamMember.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'Notey note', description: 'A test note.' }
      ).then(result => {
        note = result

        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note.id}`,
          method: 'PATCH',
          body: { privatePost: true },
        })
        addNoteToTask(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id,
          { name: 'Notey note2', description: 'A test note2.' }
        ).then(result => {
          note2 = result

          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/workstreams/${fixture.projects[0].id}/task/${
              fixture.tasks[0].id
            }/post/${note2.id}`,
            method: 'PATCH',
            body: { privatePost: true },
          })
        })
      })
    })

    describe('as a user who is a MATTER TEAM MEMBER but not an author', () => {
      it('should return FORBIDDEN status', () => {
        cy.login(anotherTeamMember.username)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note2.id}`,
          method: 'PATCH',
          body: { archive: true },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a user who is NOT a MATTER TEAM MEMBER', () => {
      it('should return FORBIDDEN status', () => {
        cy.login(nonTeamMember.username)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note.id}`,
          method: 'PATCH',
          body: { archive: true },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a MATTER TEAM MEMBER', () => {
      it('should return OK status', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note.id}`,
          method: 'PATCH',
          body: { archive: true },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })
  describe('when trying to archive a post in a different task', () => {
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
        body: { archive: true },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
  describe('when trying to archive a post when not a MTM', () => {
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
        body: { archive: true },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
