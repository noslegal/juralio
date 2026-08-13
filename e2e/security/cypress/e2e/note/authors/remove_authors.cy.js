import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('remove_authors.cy', () => {
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

  const getAddUrl = () =>
    `${Cypress.env('serverBaseUrl')}/matter/${fixture.matter.id}/workstreams/${
      fixture.projects[0].id
    }/task/${fixture.tasks[0].id}/post/${note.id}/authors`
  const getRemoveUrl = (taskIndex = 0) =>
    `${Cypress.env('serverBaseUrl')}/matter/${fixture.matter.id}/workstreams/${
      fixture.projects[0].id
    }/task/${fixture.tasks[taskIndex].id}/post/${note.id}/authors/`

  describe('when a note post is created and author added', () => {
    before(() => {
      cy.login(teamMember.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'Author note', description: 'A test note.' }
      ).then(result => {
        note = result
        cy.apiSpecRequest({
          url: getAddUrl(),
          method: 'POST',
          body: { userId: author.id },
        })
      })
    })

    describe('when an author is removed by user who is a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(teamMember.username)
      })

      it('should return NO_CONTENT status', () => {
        cy.apiSpecRequest({
          url: `${getRemoveUrl()}${author.id}`,
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.NO_CONTENT)
        })
      })

      describe('when an author is attempted to be removed AGAIN by user who is a MATTER TEAM MEMBER', () => {
        before(() => {
          cy.login(teamMember.username)
        })

        it('should return NOT_FOUND status', () => {
          cy.apiSpecRequest({
            url: `${getRemoveUrl()}${author.id}`,
            method: 'DELETE',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.NOT_FOUND)
          })
        })
      })

      describe('when an author is attempted to be removed by user who is NOT a MATTER TEAM MEMBER', () => {
        before(() => {
          cy.login(nonTeamMember.username)
        })

        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest({
            url: `${getRemoveUrl()}${author.id}`,
            method: 'DELETE',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('when sole author attempted to be removed by user who is a MATTER TEAM MEMBER', () => {
        before(() => {
          cy.login(teamMember.username)
        })

        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest({
            url: `${getRemoveUrl()}${teamMember.id}`,
            method: 'DELETE',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })

    describe('when attempting other Verbs on note authors endpoint', () => {
      ;['GET', 'PUT', 'PATCH', 'POST'].forEach(method => {
        it(`should return METHOD_NOT_ALLOWED status for ${method}`, () => {
          cy.login(teamMember.username)
          cy.apiSpecRequest({
            url: `${getRemoveUrl()}1234`,
            method: method,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
        })
      })
    })
  })
  describe('when trying to remove an author in a different task', () => {
    before(() => {
      cy.login(teamMember.username)
    })
    it('should return FORBIDDEN status when accessing from the wrong task', () => {
      cy.apiSpecRequest({
        url: `${getRemoveUrl(1)}${author.id}`,
        method: 'DELETE',
        body: { userId: author.id },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
  describe('when trying to remove an author in a different task when not a MTM', () => {
    before(() => {
      cy.login(nonTeamMember.username)
    })
    it('should return FORBIDDEN status when accessing from the wrong task', () => {
      cy.apiSpecRequest({
        url: `${getRemoveUrl(1)}${author.id}`,
        method: 'DELETE',
        body: { userId: author.id },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
