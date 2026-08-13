import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { sysadminAddUserToOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser, DEFAULT_ORGANISATION_ID } from '../../../../../helpers/users/user_api_helper'

describe('get_specific_matter_users.cy', () => {
  let user, user2, fixture
  before(() => {
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

  describe('when trying to get matter team members ', () => {
    describe('as a MATTER TEAM MEMBER', () => {
      beforeEach(() => {
        cy.login(user.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/team`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })

      it('should return METHOD_NOT_ALLOWED status for a POST', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/team`,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })

      it('should return METHOD_NOT_ALLOWED status for a PATCH', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/team`,
          method: 'PATCH',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })

      it('should return METHOD_NOT_ALLOWED status for a DELETE', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/team`,
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })
    })
  })

  describe('when trying to get matter team members', () => {
    describe('when not a MATTER TEAM MEMBER', () => {
      before(() => {
        createUser('other user', undefined, false).then(createdUser => {
          user2 = createdUser
          sysadminAddUserToOrganisation({ id: DEFAULT_ORGANISATION_ID }, user2)
        })
      })

      it('should return FORBIDDEN status', () => {
        cy.login(user2.username)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/team`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})