import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('post_notes.cy', () => {
  let teamMember, nonTeamMember, fixture
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
                tasks: [{ name: 'Task' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when trying to create a note on a Task', () => {
    describe('as a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(teamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/posts`,
          method: 'POST',
          body: { name: 'Notey note', description: 'A test note.' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.CREATED)
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
          }/posts`,
          method: 'POST',
          body: { name: 'Notey note', description: 'A test note.' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
  describe('when creating a web link', () => {
    describe('when using a url', () => {
      before(() => {
        cy.login(teamMember.username)
      })

      it('should return CREATED status', () => {
        ;[
          'https://google.com',
          'http://google.com',
          'google.com',
          'google.co.uk/test',
          'http://www.googkle.com',
          'https://www.gooogle.com',
          'http://ww.a.b.c.google.com',
        ].forEach(url => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/workstreams/${fixture.projects[0].id}/task/${
              fixture.tasks[0].id
            }/posts`,
            method: 'POST',
            body: {
              name: '1',
              privatePost: false,
              type: 'Web Link',
              url: url,
            },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.CREATED)
          })
        })
      })
    })
  })
})
