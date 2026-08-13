import HttpStatus from 'http-status-codes'
import {
  addUserToOrganisation,
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  DEFAULT_ORGANISATION_ID,
} from '../../../../../helpers/users/user_api_helper'

describe('sa_update_organisation_details.cy', () => {
  const USER = {
    SYSADMIN_USER: {
      username: 'sysadmin@juralio.com',
      password: 'Password1Password1$',
    },
  }

  const URL = `organisations/${DEFAULT_ORGANISATION_ID}`
  let standardUser, orgAdmin, anotherOrg, anotherOrgAdmin

  before(() => {
    createUser('', true, true).then(createdUser => {
      orgAdmin = createdUser
      addUserToOrganisation(
        orgAdmin,
        ['ROLE_USER'],
        DEFAULT_ORGANISATION_ID
      ).then(newUser => {
        standardUser = newUser
      })
      createOrganisation('org-' + new Date().toISOString(), false).then(
        organisation => {
          anotherOrg = organisation

          createUser('Another org admin', undefined, false, {
            roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
          }).then(createdUser => {
            anotherOrgAdmin = createdUser
            sysadminAddUserToOrganisation(anotherOrg.body, anotherOrgAdmin)
          })
        }
      )
    })
  })

  describe('when trying to update a certain organisation', () => {
    describe('when signed in as an org admin user', () => {
      beforeEach(() => {
        cy.login(orgAdmin.username, orgAdmin.password)
      })

      it('should return BAD_REQUEST status when trying to update name', () => {
        cy.login(orgAdmin.username, orgAdmin.password)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'PATCH',
          body: {
            name: 'Juralio',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })

      it('should return FORBIDDEN status when trying to update enabled', () => {
        cy.login(orgAdmin.username, orgAdmin.password)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'PATCH',
          body: {
            enabled: true,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })

      it('should return OK status when trying to update MFA', () => {
        cy.login(orgAdmin.username, orgAdmin.password)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'PATCH',
          body: {
            mfaEnabled: false,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })

      it('should return FORBIDDEN status when trying to toggle enabled and toggle mfaEnabled because enabled is sys admin only', () => {
        cy.login(orgAdmin.username, orgAdmin.password)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'PATCH',
          body: {
            mfaEnabled: false,
            enabled: true,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })

      it('should return FORBIDDEN status when trying to update an org that does not exist', () => {
        cy.login(orgAdmin.username, orgAdmin.password)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/organisations/i-dont-exist`,
          method: 'PATCH',
          body: {
            mfaEnabled: false,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })

  describe('when trying to update a certain organisation', () => {
    describe('when signed in as an org admin user of another organisation', () => {
      beforeEach(() => {
        cy.login(anotherOrgAdmin.username, anotherOrgAdmin.password)
      })

      it('should return BAD_REQUEST status when trying to update name', () => {
        cy.login(anotherOrgAdmin.username, anotherOrgAdmin.password)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'PATCH',
          body: {
            name: 'Juralio',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })

      it('should return FORBIDDEN status when trying to update enabled', () => {
        cy.login(anotherOrgAdmin.username, anotherOrgAdmin.password)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'PATCH',
          body: {
            enabled: true,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })

      it('should return FORBIDDEN status when trying to update MFA', () => {
        cy.login(anotherOrgAdmin.username, anotherOrgAdmin.password)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'PATCH',
          body: {
            mfaEnabled: false,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })

  describe('when trying to update a certain organisation', () => {
    describe('when signed in as a standard user', () => {
      before(() => {
        cy.login(standardUser.username, standardUser.password)
      })

      it('should return FORBIDDEN status when trying to update enabled', () => {
        cy.login(standardUser.username, standardUser.password)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'PATCH',
          body: {
            enabled: false,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })

      it('should return FORBIDDEN status when trying to update name', () => {
        cy.login(standardUser.username, standardUser.password)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'PATCH',
          body: {
            name: 'Juralio',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })

      it('should return FORBIDDEN status when trying to update mfaEnabled', () => {
        cy.login(standardUser.username, standardUser.password)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'PATCH',
          body: {
            mfaEnabled: false,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })

  describe('when trying to update a certain organisation', () => {
    describe('when signed in as a sysadmin', () => {
      beforeEach(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return OK status when trying to update MFA', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'PATCH',
          body: {
            mfaEnabled: false,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })

      it('should return OK status when trying to update name', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'PATCH',
          body: {
            name: 'Juralio',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })

      it('should return OK status when trying to update enabled', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'PATCH',
          body: {
            enabled: true,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })
})
