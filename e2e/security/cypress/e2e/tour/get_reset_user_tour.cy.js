import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  DEFAULT_ORGANISATION_ID,
} from '../../../../helpers/users/user_api_helper'

describe('get_reset_user_tour.cy', () => {
  let user, user2, user3, fixture
  let url

  before(() => {
    createUser(undefined, true, false, { roles: ['ROLE_ORG_ADMIN'] }).then(
      createdUser => {
        user3 = createdUser
        createUser(undefined, true, false, { roles: ['ROLE_ORG_ADMIN'] }).then(
          createdUser => {
            user2 = createdUser
            sysadminAddUserToOrganisation(
              { id: DEFAULT_ORGANISATION_ID },
              user2
            )
            createUser().then(createdUser => {
              user = createdUser
              url = `${Cypress.env('serverBaseUrl')}/settings/user/${
                user.id
              }/resetTours`
              const seed = {
                matter: {
                  prefix: 'importantMatter',
                  teamMembers: [user, user2],
                  matterAdmins: [user],
                  projects: [{}],
                },
              }
              fixture = generateFixture(seed)

              createOrganisation(null, false).then(_organisation => {
                sysadminAddUserToOrganisation(
                  { id: _organisation.body.id },
                  user3
                )
              })
            })
          }
        )
      }
    )
  })

  describe('when trying to get tour information', () => {
    describe('as a Sys admin', () => {
      before(() => {
        cy.login('sysadmin@juralio.com', 'Password1Password1$')
      })

      it('should return OK status for a GET', () => {
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

    describe('as an Org Admin', () => {
      before(() => {
        cy.login(user2.username)
      })

      it('should return OK status for a GET', () => {
        cy.apiSpecRequest({
          url,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as an Org Admin from other org', () => {
      before(() => {
        cy.login(user3.username)
      })

      it('should return OK status for a GET', () => {
        cy.apiSpecRequest({
          url,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })

  describe('when attempting other verbs on the endpoint Sysadmin', () => {
    const verbs = ['POST', 'PUT', 'PATCH', 'DELETE']

    verbs.forEach(verb =>
      it(`should return METHOD_NOT_ALLOWED status for ${verb}`, () => {
        cy.login('sysadmin@juralio.com', 'Password1Password1$')
        cy.apiSpecRequest({
          url,
          method: verb,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })
    )
  })

  describe('when attempting other verbs on the endpoint MTM', () => {
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
