import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('restore_archived_post.cy', () => {
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
            teamMembers: [nonMatterAdmin, matterAdmin],
            matterAdmins: [matterAdmin],
            projects: [
              {
                name: 'Project 1',
                tasks: [{ name: 'Task' }, { name: 'Task' }],
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
    })

    describe('When logged in as non-Matter Admin', () => {
      before(() => {
        cy.login(nonMatterAdmin.username)
      })
      it('should return FORBIDDEN status as a user', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/post/${note.id}`,
          method: 'PATCH',
          body: {
            matterId: fixture.matter.id,
            projectId: fixture.projects[0].id,
            taskId: fixture.tasks[0].id,
            type: 'prevLocation',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('When logged in as Matter Admin', () => {
      beforeEach(() => {
        cy.login(matterAdmin.username)
      })
      it('should return BAD_REQUEST status if restoration details incomplete', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/post/${note.id}`,
          method: 'PATCH',
          body: {
            matterId: fixture.matter.id,
            taskId: fixture.tasks[0].id,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
      it('should return BAD_REQUEST status if restoration details incomplete', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/post/${note.id}`,
          method: 'PATCH',
          body: {
            matterId: fixture.matter.id,
            projectId: fixture.projects[0].id,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
      it('should return BAD_REQUEST status if restoration details incomplete', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/post/${note.id}`,
          method: 'PATCH',
          body: {
            projectId: fixture.projects[0].id,
            taskId: fixture.tasks[0].id,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
      it('should return BAD_REQUEST status if restoration details not valid', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/post/${note.id}`,
          method: 'PATCH',
          body: {
            matterId: fixture.matter.id,
            projectId: fixture.projects[0].id,
            taskId: fixture.tasks[1].id,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })

    describe('When logged in as Matter Admin', () => {
      before(() => {
        cy.login(matterAdmin.username)
      })
      it('should return OK status as a user who is a MATTER ADMIN', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/post/${note.id}`,
          method: 'PATCH',
          body: {
            matterId: fixture.matter.id,
            projectId: fixture.projects[0].id,
            taskId: fixture.tasks[0].id,
            type: 'prevLocation',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })
})
