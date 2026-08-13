import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('add_authors.cy', () => {
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

  const getAddUrl = (taskIndex = 0) =>
    `${Cypress.env('serverBaseUrl')}/matter/${fixture.matter.id}/workstreams/${
      fixture.projects[0].id
    }/task/${fixture.tasks[taskIndex].id}/post/${note.id}/authors`

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

    describe('when the creating user is added AGAIN as author by user who is a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(teamMember.username)
      })

      it('should return BAD_REQUEST status', () => {
        cy.apiSpecRequest({
          url: getAddUrl(),
          method: 'POST',
          body: { userId: teamMember.id },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })

    describe('when a MTM author is added as author by user who is a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(teamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: getAddUrl(),
          method: 'POST',
          body: { userId: author.id },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when a MTM author is added AGAIN as author by user who is a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(teamMember.username)
      })

      it('should return BAD_REQUEST status', () => {
        cy.apiSpecRequest({
          url: getAddUrl(),
          method: 'POST',
          body: { userId: author.id },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })

    describe('when an author (who is NOT a MATTER TEAM MEMBER) is added', () => {
      before(() => {
        cy.login(teamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: getAddUrl(),
          method: 'POST',
          body: { userId: nonTeamMember.id },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('when an author is added as a user who is NOT a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(nonTeamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: getAddUrl(),
          method: 'POST',
          body: { userId: author.id },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('when attempting other Verbs on note authors endpoint', () => {
      ;['GET', 'PUT', 'PATCH', 'DELETE'].forEach(method => {
        it(`should return METHOD_NOT_ALLOWED status for ${method}`, () => {
          cy.login(teamMember.username)
          cy.apiSpecRequest({
            url: getAddUrl(),
            method: method,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
        })
      })
    })
  })
  describe('when trying to add an author in a different task', () => {
    before(() => {
      cy.login(teamMember.username)
    })
    it('should return FORBIDDEN status when accessing from the wrong task', () => {
      cy.apiSpecRequest({
        url: getAddUrl(1),
        method: 'POST',
        body: { userId: author.id },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
  describe('when trying to add an author in a different task when not a MTM', () => {
    before(() => {
      cy.login(nonTeamMember.username)
    })
    it('should return FORBIDDEN status when accessing from the wrong task', () => {
      cy.apiSpecRequest({
        url: getAddUrl(1),
        method: 'POST',
        body: { userId: author.id },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
