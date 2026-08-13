import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'

describe('task_dates_confirmation_api.cy', () => {
  let user, user2, fixture
  before(() => {
    createUser('other user', undefined, false).then(createdUser => {
      user2 = createdUser
      createUser().then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'importantMatter',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'Project 1',
                tasks: [{ name: 'Happy' }],
              },
              {
                name: 'Project 2',
                tasks: [{ name: 'Halloween' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
    })
  })

  describe('when trying to get consistency lists', () => {
    describe('as a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(user.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/checkConsistency`,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
      it('should return UNAUTHORIZED status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/checkConsistency`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
      it('should return UNAUTHORIZED status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/checkConsistency`,
          method: 'PATCH',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
      it('should return UNAUTHORIZED status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/checkConsistency`,
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
    })
  })
})
