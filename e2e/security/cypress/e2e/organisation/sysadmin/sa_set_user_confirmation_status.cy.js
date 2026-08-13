import HttpStatus from 'http-status-codes'
import {
  DEFAULT_ORGANISATION_ID,
  MATTER_CREATOR_ID,
} from '../../../../../helpers/users/user_api_helper'

describe('sa_set_user_confirmation_status.cy', () => {
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
  const instanceSettingsURL = `${Cypress.env(
    'serverRootBaseUrl'
  )}/api/admin/instance/settings`

  const URL = `organisations/${DEFAULT_ORGANISATION_ID}/user/${MATTER_CREATOR_ID}/confirm`
  before(() => {
    cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)

    cy.apiSpecRequest({
      url: instanceSettingsURL,
      method: 'PATCH',
      body: {
        enableUserConfirmation: true,
      },
    })
  })

  describe('when trying to update a users confirmed status', () => {
    describe('when signed in as a standard user', () => {
      before(() => {
        cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'POST',
          body: {},
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })

  describe('when trying to get a users confirmation status', () => {
    describe('when signed in as a standard user', () => {
      before(() => {
        cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'GET',
          body: {},
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })

  describe('when trying to update a users confirmed status', () => {
    describe('when signed in as a sysadmin', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return CREATED status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'POST',
          body: {},
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })

  describe('when trying to get a users confirmation status', () => {
    describe('when signed in as a sysadmin', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return CREATED status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'GET',
          body: {},
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })
})
