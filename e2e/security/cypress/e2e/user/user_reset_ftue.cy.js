import HttpStatus from 'http-status-codes'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

const USER = {
  SYSADMIN_USER: {
    username: 'sysadmin@juralio.com',
    password: 'Password1Password1$',
  },
  STANDARD_USER: {
    username: 'matter.creator@juralio.com',
    password: 'Password2Password2$',
  },
}

describe('user_reset_ftue.cy', () => {
  let userFtue, orgAdminUser, orgAdminUserOther, organisationOther
  let resetUrl, resetUrlInvalidUser

  const createFtueUser = () =>
    createUser().then(createdUser => (userFtue = createdUser))

  const createOrgAdmin = () =>
    createUser('', true, true, { roles: ['ROLE_ORG_ADMIN'] }).then(
      createdUser => (orgAdminUser = createdUser)
    )
  const createOrgAdminOther = () =>
    createUser('', true, false, { roles: ['ROLE_ORG_ADMIN'] }).then(
      createdUser => (orgAdminUserOther = createdUser)
    )
  const createOrganisationOther = () =>
    createOrganisation('ORG_OTHER', false).then(
      organisation => (organisationOther = organisation)
    )
  const assignOrgAdminToOtherOrganisation = () =>
    sysadminAddUserToOrganisation(organisationOther.body, orgAdminUserOther)

  describe('when not signed in ', () => {
    it('should return UNAUTHORIZED status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/settings/user/987654321/resetftue`,
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
      })
    })
  })

  describe('when trying to reset ftue', () => {
    before(() => {
      createOrganisationOther().then(resp => {
        createOrgAdminOther().then(resp => {
          assignOrgAdminToOtherOrganisation().then(resp => {
            createFtueUser().then(resp => {
              createOrgAdmin().then(resp => {
                resetUrl = `${Cypress.env('serverBaseUrl')}/settings/user/${
                  userFtue.id
                }/resetftue`
                resetUrlInvalidUser = `${Cypress.env(
                  'serverBaseUrl'
                )}/settings/user/987654321/resetftue`
              })
            })
          })
        })
      })
    })

    describe('when signed in as a standard user', () => {
      before(() => {
        cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: resetUrl,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('when signed in as a SYSADMIN_USER', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: resetUrl,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when signed in as an Organisation Admin', () => {
      before(() => {
        cy.login(orgAdminUser.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: resetUrl,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when signed in as another Organisation Admin', () => {
      before(() => {
        cy.login(orgAdminUserOther.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: resetUrl,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('when signed in as a SYSADMIN_USER with an invalid user id', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: resetUrlInvalidUser,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })

  describe('when attempting other verbs on the endpoint', () => {
    const verbs = ['PUT', 'PATCH', 'DELETE']

    let requestBody

    before(() => {
      cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      requestBody = {
        url: resetUrl,
      }
    })

    it('should return METHOD_NOT_ALLOWED status for GET', () => {
      cy.apiSpecRequest({
        ...requestBody,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })

    // For some reason GRAILS returns a 401 for these verbs.
    verbs.forEach(verb =>
      it(`should return UNAUTHORIZED status for ${verb}`, () => {
        cy.apiSpecRequest({
          ...requestBody,
          method: verb,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
    )
  })
})
