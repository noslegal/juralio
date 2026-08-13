import HttpStatus from 'http-status-codes'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('get_organisation.cy', () => {
  let standardUser
  let userOrg1, userOrg2
  let organisation1, organisation2

  before(() => {
    createUser(undefined, undefined, true).then(createdUser => {
      standardUser = createdUser

      createOrganisation('ONE_ORG', false).then(organisation => {
        organisation1 = organisation

        createOrganisation('TWO_ORG', false).then(organisation => {
          organisation2 = organisation

          createUser('Mr Apple-', undefined, false, {
            roles: ['ROLE_ORG_ADMIN'],
          }).then(createdUser => {
            userOrg1 = createdUser

            createUser('Mr Android-', undefined, false, {
              roles: ['ROLE_ORG_ADMIN'],
            }).then(createdUser => {
              userOrg2 = createdUser

              sysadminAddUserToOrganisation(organisation1.body, userOrg1)
              sysadminAddUserToOrganisation(organisation2.body, userOrg2)
            })
          })
        })
      })
    })
  })

  const URL = 'organisation'

  describe('when trying to get the organisation details', () => {
    describe('as Organisation 1 ORG_ADMIN', () => {
      before(() => {
        cy.login(userOrg1.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'GET',
        }).then(response => {
          expect(response.body.name).contains('ONE_ORG')
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })

      describe('using verbs forbidden to org admins', () => {
        beforeEach(() => {
          cy.login(userOrg1.username)
        })
        ;['POST', 'PATCH', 'DELETE'].forEach(verb => {
          it(`should return FORBIDDEN for ${verb}`, () => {
            cy.apiSpecRequest({
              url: `${Cypress.env('serverBaseUrl')}/${URL}`,
              method: verb,
            }).then(response => {
              expect(response.status).to.eq(HttpStatus.FORBIDDEN)
            })
          })
        })
      })
    })

    describe('as Organisation 2 ORG_ADMIN', () => {
      before(() => {
        cy.login(userOrg2.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'GET',
        }).then(response => {
          expect(response.body.name).contains('TWO_ORG')
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as SysAdmin user', () => {
      const USER = {
        SYSADMIN_USER: {
          username: 'sysadmin@juralio.com',
          password: 'Password1Password1$',
        },
      }
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a Standard organisation 2 user', () => {
      before(() => {
        cy.login(standardUser.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as an unauthenticated user', () => {
      it('should return UNAUTHORIZED status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}/${
            organisation2.body.id
          }`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
    })
  })
})
