import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('get_specific_project_content_search.cy', () => {
  let user, user2, fixture
  before(() => {
    createUser().then(createdUser => {
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
                tasks: [{ name: 'task a' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
    })
  })

  describe('when performing content search in context of a project  as an authenticated user who is a MTM', () => {
    beforeEach(() => {
      cy.login(user.username)
    })

    it('should return OK status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/search?searchterm=t`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should return METHOD_NOT_ALLOWED status for POST', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/search?searchterm=t`,
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
    it('should return METHOD_NOT_ALLOWED status for PATCH', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/search?searchterm=t`,
        method: 'PATCH',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
    it('should return METHOD_NOT_ALLOWED status for DELETE', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/search?searchterm=t`,
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
  })

  describe('when performing content search in context of a project as an authenticated user who is NOT a MTM', () => {
    before(() => {
      cy.login(user2.username)
    })

    it('should return FORBIDDEN status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/search?searchterm=t`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
