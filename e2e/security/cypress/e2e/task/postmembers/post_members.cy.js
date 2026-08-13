import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('post_members.cy', () => {
  let teamMember, nonTeamMember, author, fixture, otherTeamMember
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
      .then(createdUser => {
        otherTeamMember = createdUser
      })
      .then(() => {
        const seed = {
          matter: {
            teamMembers: [teamMember, author, otherTeamMember],
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
    }/task/${fixture.tasks[taskIndex].id}/post/${note.id}/postmembers`

  describe('when a note is created', () => {
    before(() => {
      cy.login(teamMember.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'Author note', description: 'A test note.' }
      ).then(result => {
        note = result
      })
    })

    it('should not allow POST of non Matter team members', () => {
      cy.apiSpecRequest({
        url: getUrl(),
        method: 'POST',
        body: { user: nonTeamMember },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    describe('when logged in as a matter team member (non-post author), adding a user to post members', () => {
      it('should not allow POST of non Matter team members', () => {
        cy.login(author.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'POST',
          body: { user: nonTeamMember },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('when logged in as a matter team member, adding a user to post members', () => {
      beforeEach(() => {
        cy.login(teamMember.username)
      })

      it('should return OK status for a valid user', () => {
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'POST',
          body: { user: teamMember },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })

      it('should not allow the same user to be added again', () => {
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'POST',
          body: { user: teamMember },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })

      it('should not allow users add new members with no body given', () => {
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })

      it('should not allow users add new members with details for a user who does not exist', () => {
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'POST',
          body: { user: { id: 123456789 } },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })

    describe('when logged in as a matter team member, and using disallowed verbs', () => {
      beforeEach(() => {
        cy.login(teamMember.username)
      })

      it('should not allow for the DELETE method', () => {
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })

      it('should not allow for the PATCH method', () => {
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'PATCH',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })

      it('should not allow for the PUT method', () => {
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'PUT',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })

      it('should not allow for the GET method', () => {
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })
    })

    describe('when adding a user as a post member with an unrelated but valid task id', () => {
      before(() => {
        cy.login(teamMember.username)
      })
      it('should return FORBIDDEN', () => {
        cy.apiSpecRequest({
          url: getUrl(1),
          method: 'POST',
          body: { user: teamMember },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})
