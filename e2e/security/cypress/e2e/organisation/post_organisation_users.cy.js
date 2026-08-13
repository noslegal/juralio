import HttpStatus from 'http-status-codes'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('post_organisation_users.cy', () => {
  let userOrg1, userOrg2, userToAddAndRemove
  let organisation1, organisation2
  let org1UsersUrl, org2UsersUrl

  before(() => {
    createUser(undefined, undefined, false).then(createdUser => {
      userToAddAndRemove = createdUser

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

              org1UsersUrl = `${Cypress.env('serverBaseUrl')}/organisations/${
                organisation1.body.id
              }/users`
              org2UsersUrl = `${Cypress.env('serverBaseUrl')}/organisations/${
                organisation2.body.id
              }/users`
            })
          })
        })
      })
    })
  })

  describe('when trying to modify the organisation users', () => {
    describe('as Organisation 1 ORG ADMIN', () => {
      beforeEach(() => {
        cy.login(userOrg1.username)
      })

      it('should return CREATED status when adding a user who is NOT part of the organisation', () => {
        cy.apiSpecRequest({
          url: org1UsersUrl,
          method: 'POST',
          body: { username: userToAddAndRemove.username },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.CREATED)
        })
      })

      it('should return CREATED status when adding a user who is ALREADY part of the organisation', () => {
        cy.apiSpecRequest({
          url: org1UsersUrl,
          method: 'POST',
          body: { username: userToAddAndRemove.username },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.CREATED)
        })
      })

      after(() => {
        cy.apiSpecRequest({
          url: org1UsersUrl,
          method: 'DELETE',
          body: { username: userToAddAndRemove.username },
        })
      })
    })

    describe('as Organisation 2 user ORG ADMIN', () => {
      beforeEach(() => {
        cy.login(userOrg2.username)
      })

      it('should return FORBIDDEN status when trying to add a user to org 1', () => {
        cy.apiSpecRequest({
          url: org1UsersUrl,
          method: 'POST',
          body: { username: userToAddAndRemove.username },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })

      it('should return FORBIDDEN status when trying to delete a user from the organisation', () => {
        cy.apiSpecRequest({
          url: org1UsersUrl,
          method: 'DELETE',
          body: { username: userToAddAndRemove.username },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
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
      beforeEach(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return CREATED status when adding a user who is not part of the organisation', () => {
        cy.apiSpecRequest({
          url: org1UsersUrl,
          method: 'POST',
          body: { username: userToAddAndRemove.username },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.CREATED)
        })
      })

      it('should return CREATED status when adding a user who is ALREADY part of the organisation', () => {
        cy.apiSpecRequest({
          url: org1UsersUrl,
          method: 'POST',
          body: { username: userToAddAndRemove.username },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.CREATED)
        })
      })
    })

    describe('as an unauthenticated user', () => {
      it('should return UNAUTHORIZED status when trying to add a user to the organisation', () => {
        cy.apiSpecRequest({
          url: org1UsersUrl,
          method: 'POST',
          body: { username: userToAddAndRemove.username },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
    })
  })
})
