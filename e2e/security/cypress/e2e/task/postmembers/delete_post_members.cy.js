import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('delete_post_members.cy', () => {
  let teamMember, nonTeamMember, author, fixture
  let note

  before(() => {
    createUser()
      .then(createdUser => {
        nonTeamMember = createdUser
      })
      .then(createUser)
      .then(createdUser => {
        teamMember = createdUser
      })
      .then(createUser)
      .then(createdUser => {
        author = createdUser
      })
      .then(() => {
        const seed = {
          matter: {
            teamMembers: [teamMember, author],
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

  const getUrl = (taskIndex = 0) =>
    `${Cypress.env('serverBaseUrl')}/matter/${fixture.matter.id}/workstreams/${
      fixture.projects[0].id
    }/task/${fixture.tasks[taskIndex].id}/post/${note.id}/postmembers/${
      teamMember.id
    }`

  const getMember2Url = (taskIndex = 0) =>
    `${Cypress.env('serverBaseUrl')}/matter/${fixture.matter.id}/workstreams/${
      fixture.projects[0].id
    }/task/${fixture.tasks[taskIndex].id}/post/${note.id}/postmembers/${
      author.id
    }`

  const getBadUrl = (taskIndex = 0) => `${Cypress.env(
    'serverBaseUrl'
  )}/matter/${fixture.matter.id}/workstreams/${fixture.projects[0].id}/task/${
    fixture.tasks[taskIndex].id
  }/post/${note.id}/postmembers/123456789
    }`

  const getAddUrl = (taskIndex = 0) =>
    `${Cypress.env('serverBaseUrl')}/matter/${fixture.matter.id}/workstreams/${
      fixture.projects[0].id
    }/task/${fixture.tasks[taskIndex].id}/post/${note.id}/postmembers`

  describe('when a meeting note with 2 attendees is created', () => {
    before(() => {
      cy.login(teamMember.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'Member note', description: 'A test note.' }
      ).then(result => {
        note = result
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: getAddUrl(),
          method: 'POST',
          body: { user: teamMember },
        })
        cy.apiSpecRequest({
          url: getAddUrl(),
          method: 'POST',
          body: { user: author },
        })
      })
    })

    describe('when deleting a attendee', () => {
      it('should not allow for a delete by a non matter team member', () => {
        cy.login(nonTeamMember.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'DELETE',
          body: { user: teamMember },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })

      it('should return NO CONTENT status when succesfully deleted', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'DELETE',
          body: { user: teamMember },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.NO_CONTENT)
        })
      })
    })

    describe('when deleting the only attendee from the team', () => {
      it('should return NO CONTENT status when successfully deleted', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: getMember2Url(),
          method: 'DELETE',
          body: { user: author },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.NO_CONTENT)
        })
      })
      it('should not allow GET method', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })
      it('should not allow POST method', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })
      it('should not allow PATCH method', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'PATCH',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })
      it('should not allow PUT method', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'PUT',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })
    })
  })

  describe('when a note is created', () => {
    before(() => {
      cy.login(teamMember.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'Member note', description: 'A test note.' }
      ).then(result => {
        note = result
      })
    })
    describe('deleting when no attendee exists', () => {
      it('should return FORBIDDEN status', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
      it('should return forbidden when invalid a userid is given in the url', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: getBadUrl(),
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})
