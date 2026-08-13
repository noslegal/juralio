import HttpStatus from 'http-status-codes'
import { sysadminAddUserToOrganisation } from '../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  DEFAULT_ORGANISATION_ID,
  getForbiddenUserRoleCombinations,
} from '../../../../helpers/users/user_api_helper'

describe('patch_update_user_details.cy', () => {
  const USER = {
    SYSADMIN_USER: {
      username: 'sysadmin@juralio.com',
      password: 'Password1Password1$',
    },
  }

  let user

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      createUser(undefined, true, true, { roles: ['ROLE_ORG_ADMIN'] }).then(
        orgAdmin => {
          USER.ORG_ADMIN_USER = orgAdmin
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
  })

  describe('when trying to update a users details', () => {
    describe('when signed in as a standard user', () => {
      before(() => {
        cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/${user.id}`,
          method: 'PATCH',
          body: {
            firstname: 'sick',
            lastname: 'cactus',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })

  describe('when trying to update a users details', () => {
    describe('when signed in as a sysadmin', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/${user.id}`,
          method: 'PATCH',
          body: {
            firstname: 'sick',
            lastname: 'cactus',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })

  describe('when trying to update a users details', () => {
    describe('when signed in as an org admin', () => {
      beforeEach(() => {
        cy.login(USER.ORG_ADMIN_USER.username, USER.ORG_ADMIN_USER.password)
      })

      it('should return OK status when modifying name fields', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/${user.id}`,
          method: 'PATCH',
          body: {
            firstname: 'sick2',
            lastname: 'cactus2',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })

      it('should return BAD_REQUEST status when trying to remove own org admin role', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/${
            USER.ORG_ADMIN_USER.id
          }`,
          method: 'PATCH',
          body: {
            roles: ['ROLE_USER'],
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })
  })

  describe("when trying to update a user's mfa enabled status", () => {
    describe('when signed in as a standard user', () => {
      before(() => {
        cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/${user.id}`,
          method: 'PATCH',
          body: {
            mfaEnabled: true,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('when signed in as a sysadmin', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/${user.id}`,
          method: 'PATCH',
          body: {
            mfaEnabled: true,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when signed in as an org admin', () => {
      before(() => {
        cy.login(USER.ORG_ADMIN_USER.username, USER.ORG_ADMIN_USER.password)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/${user.id}`,
          method: 'PATCH',
          body: {
            mfaEnabled: true,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })

  describe('when trying to patch a user to have forbidden privileges', () => {
    const forbiddenCombinations = getForbiddenUserRoleCombinations()

    const updateUserWithRoles = roles =>
      cy.apiSpecRequest({
        method: 'PATCH',
        url: `${Cypress.env('serverBaseUrl')}/users/${user.id}`,
        body: {
          roles,
        },
      })
    describe('when signed in as an org admin', () => {
      before(() => {
        cy.login(USER.ORG_ADMIN_USER.username, USER.ORG_ADMIN_USER.password)
      })

      it('should respond with BAD_REQUEST', () => {
        cy.login(USER.ORG_ADMIN_USER.username, USER.ORG_ADMIN_USER.password)
        forbiddenCombinations.forEach(fc => {
          updateUserWithRoles(fc).then(response => {
            expect(response.status).to.equal(HttpStatus.BAD_REQUEST)
          })
        })
      })
    })

    describe('when signed in as a sysadmin', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should respond with BAD_REQUEST', () => {
        forbiddenCombinations.forEach(fc => {
          if (
            fc[0] !== 'ROLE_SYSADMIN' ||
            fc.includes('ROLE_DEMO') ||
            fc.includes('ROLE_WIP') ||
            fc.includes('ROLE_ANALYSIS') ||
            fc.includes('ROLE_UPDATES')
          ) {
            updateUserWithRoles(fc).then(response => {
              expect(response.status).to.equal(HttpStatus.BAD_REQUEST)
            })
          } else {
            updateUserWithRoles(fc).then(response => {
              expect(response.status).to.equal(HttpStatus.OK)
            })
          }
        })
      })
    })

    describe('when signed in as a standard user', () => {
      before(() => {
        cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
      })

      it('should respond with FORBIDDEN', () => {
        forbiddenCombinations.forEach(fc => {
          updateUserWithRoles(fc).then(response => {
            expect(response.status).to.equal(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })

  describe('when trying to disable own account', () => {
    before(() => {
      cy.login(USER.ORG_ADMIN_USER.username, USER.ORG_ADMIN_USER.password)
    })

    it('should return BAD_REQUEST status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/users/${USER.ORG_ADMIN_USER.id}`,
        method: 'PATCH',
        body: {
          enabled: false,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})
