import HttpStatus from 'http-status-codes'
import {
  getUniqueEmailAddress,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  DEFAULT_ORGANISATION_ID,
  getForbiddenUserRoleCombinations,
} from '../../../../helpers/users/user_api_helper'

describe('post_create_new_user.cy', () => {
  const USER = {
    SYSADMIN_USER: {
      username: 'sysadmin@juralio.com',
      password: 'Password1Password1$',
    },
  }

  before(() => {
    createUser(undefined, true, true, { roles: ['ROLE_ORG_ADMIN'] }).then(
      orgAdmin => {
        USER['ORG_ADMIN_USER'] = {
          username: orgAdmin.username,
          password: 'Password2Password2$',
        }
        createUser('', true, false).then(standardUser => {
          USER['STANDARD_USER'] = {
            username: standardUser.username,
            password: 'Password2Password2$',
          }
          sysadminAddUserToOrganisation(
            { id: DEFAULT_ORGANISATION_ID },
            standardUser
          )
        })
      }
    )
  })

  describe('when trying to create a user', () => {
    describe('when signed in as a standard user', () => {
      before(() => {
        cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users`,
          method: 'POST',
          body: {
            username: getUniqueEmailAddress(),
            firstname: 'john',
            lastname: 'smith',
            roles: ['ROLE_USER'],
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })

  describe('when trying to create a user', () => {
    describe('when signed in as an org admin', () => {
      before(() => {
        cy.login(USER.ORG_ADMIN_USER.username, USER.ORG_ADMIN_USER.password)
      })

      it('should return CREATED status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users`,
          method: 'POST',
          body: {
            username: `myTotallyUniqueUser1${new Date().getTime()}@juralio.com`,
            firstname: 'createdByOrgAdmin',
            lastname: 'createdByOrgAdmin',
            roles: ['ROLE_USER'],
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.CREATED)
        })
      })
    })
  })

  describe('when trying to create a user', () => {
    describe('when signed in as a sysadmin', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return CREATED status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users`,
          method: 'POST',
          body: {
            username: `myTotallyUniqueUser${new Date().getTime()}@juralio.com`,
            firstname: 'delete',
            lastname: 'delete',
            roles: ['ROLE_USER'],
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.CREATED)
        })
      })
    })
  })

  describe('when trying to create a new user with forbidden privileges', () => {
    const forbiddenCombinations = getForbiddenUserRoleCombinations()

    const createUserWithRoles = roles =>
      cy.apiSpecRequest({
        method: 'POST',
        url: `${Cypress.env('serverBaseUrl')}/users`,
        body: {
          firstname: 'Jane',
          lastname: 'Doe',
          username: 'jane@juralio.com',
          roles,
        },
      })

    describe('when signed in as a sysadmin', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should respond with BAD_REQUEST', () => {
        forbiddenCombinations.forEach(fc => {
          if (fc[0] == 'ROLE_SYSADMIN' && fc.length === 1) {
            createUserWithRoles(fc).then(response => {
              console.log('b', response.status, fc)
              expect(response.status).to.equal(HttpStatus.CREATED)
            })
          } else {
            createUserWithRoles(fc).then(response => {
              console.log('a', response.status, fc)
              expect(response.status).to.equal(HttpStatus.BAD_REQUEST)
            })
          }
          // if (fc[0] != 'ROLE_SYSADMIN' && fc.length != 1) {
          //   createUserWithRoles(fc).then(response => {
          //     console.log('a', response.status, fc)
          //     expect(response.status).to.equal(HttpStatus.BAD_REQUEST)
          //   })
          // } else {
          //   createUserWithRoles(fc).then(response => {
          //     console.log('b', response.status, fc)
          //     expect(response.status).to.equal(HttpStatus.CREATED)
          //   })
          // }
        })
      })
    })

    describe('when signed in as an org admin', () => {
      before(() => {
        cy.login(USER.ORG_ADMIN_USER.username, USER.ORG_ADMIN_USER.password)
      })

      it('should respond with BAD_REQUEST', () => {
        forbiddenCombinations.forEach(fc => {
          createUserWithRoles(fc).then(response => {
            expect(response.status).to.equal(HttpStatus.BAD_REQUEST)
          })
        })
      })
    })

    describe('when signed in as a standard user', () => {
      before(() => {
        cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
      })

      it('should respond with FORBIDDEN', () => {
        forbiddenCombinations.forEach(fc => {
          createUserWithRoles(fc).then(response => {
            expect(response.status).to.equal(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })
})
