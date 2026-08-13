import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { sysadminAddUserToOrganisation } from '../../../../helpers/organisation/organisation_api_helper'
import {
    createUser,
    DEFAULT_ORGANISATION_ID
} from '../../../../helpers/users/user_api_helper'


describe('get_user_tour.cy', () => {
  let user, user2, user3, fixture
  before(() => {
    createUser().then(createdUser => {
      user3 = createdUser
      createUser(undefined, true, false).then(createdUser => {
        user2 = createdUser
        sysadminAddUserToOrganisation({ id: DEFAULT_ORGANISATION_ID }, user2)
        createUser().then(createdUser => {
          user = createdUser

          const seed = {
            matter: {
              prefix: 'importantMatter',
              teamMembers: [user, user2, user3],
              matterAdmins: [user],
              projects: [{}],
            },
          }
          fixture = generateFixture(seed)
        })
      })
    })
  })

  const url = `${Cypress.env('serverBaseUrl')}/settings/user/tours`

  describe('when trying to get tour information', () => {
    describe('as a MATTER Editor', () => {
      before(() => {
        cy.login(user.username)
      })

      it('should return OK status for a GET', () => {
        cy.login(user.username)
        cy.apiSpecRequest({
          url,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a unauthenticated user', () => {
      before(() => {
        cy.logoutServerSide()
      })

      it('should return OK status for a UNAUTHORIZED', () => {
        cy.apiSpecRequest({
          url,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
    })
  })

  describe('when attempting other verbs on the endpoint', () => {
    const verbs = ['POST', 'PUT', 'PATCH', 'DELETE']

    verbs.forEach(verb =>
      it(`should return METHOD_NOT_ALLOWED status for ${verb}`, () => {
        cy.login(user.username)
        cy.apiSpecRequest({
          url,
          method: verb,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })
    )
  })
})
