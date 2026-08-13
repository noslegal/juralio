import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('archived_posts.cy', () => {
  let matterAdmin, nonMatterAdmin, nonMatterUser, fixture
  before(() => {
    createUser()
      .then(createdUser => {
        matterAdmin = createdUser
      })
      .then(createUser)
      .then(createdUser => {
        nonMatterAdmin = createdUser
      })
      .then(createUser)
      .then(createdUser => {
        nonMatterUser = createdUser
      })
      .then(() => {
        const seed = {
          matter: {
            teamMembers: [nonMatterAdmin],
            matterAdmins: [matterAdmin],
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

  describe('When a Matter has archived Posts', () => {
    before(() => {
      cy.login(nonMatterAdmin.username)
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
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/workstreams/${fixture.projects[0].id}/task/${
              fixture.tasks[0].id
            }/post/${note2.id}`,
            method: 'PATCH',
            body: { archive: true },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
      })
    })

    it('should return FORBIDDEN status as a user who is NOT a MATTER ADMIN', () => {
      cy.login(nonMatterAdmin.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/post?archived=true`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    it('should return FORBIDDEN status as a user who is NOT a MATTER TEAM MEMBER', () => {
      cy.login(nonMatterUser.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/post?archived=true`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    describe('When a Matter has archived Posts requested via query string as a user who is a MATTER ADMIN', () => {
      before(() => {
        cy.login(matterAdmin.username)
      })

      it('should return OK status ', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/posts?archived=true`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('When a Matter has Posts requested as a user who is a MATTER ADMIN', () => {
      before(() => {
        cy.login(matterAdmin.username)
      })

      it('should return BAD_REQUEST status ', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/posts`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })

    describe('when attempting other verbs', () => {
      const verbs = ['POST', 'PUT', 'PATCH', 'DELETE']

      beforeEach(() => {
        cy.login(matterAdmin.username)
      })
      verbs.forEach(verb =>
        it(`should return METHOD_NOT_ALLOWED status for ${verb}`, () => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/posts?archived=true`,
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
        })
      )
    })
  })
})
