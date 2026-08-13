import HttpStatus from 'http-status-codes'

describe('sa_whitelist_api_access.cy', () => {
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

  const WHITELIST_GET_URL = id =>
    id ? `instance/whitelist/${id}` : 'instance/whitelist'
  const WHITELIST_POST_OR_DELETE_URL = id =>
    id ? `admin/instance/whitelist/${id}` : 'admin/instance/whitelist'

  describe('As SYSADMIN', () => {
    describe('when viewing the whitelist', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })
      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl').replace(
            '/api',
            ''
          )}/${WHITELIST_GET_URL()}`,
          method: 'GET',
          body: {},
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when adding to the whitelist', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env(
            'serverBaseUrl'
          )}/${WHITELIST_POST_OR_DELETE_URL()}`,
          method: 'POST',
          body: { emails: [USER.STANDARD_USER.username] },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when deleting from the whitelist', () => {
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return NOT_FOUND status when deleting from the whitelist with invalid id', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${WHITELIST_POST_OR_DELETE_URL(
            -1
          )}`,
          method: 'DELETE',
          body: {},
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.NOT_FOUND)
        })
      })
    })
  })

  describe('As a regular user', () => {
    describe('when viewing the whitelist', () => {
      before(() => {
        cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
      })
      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl').replace(
            '/api',
            ''
          )}/${WHITELIST_GET_URL()}`,
          method: 'GET',
          body: {},
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when adding to the whitelist', () => {
      before(() => {
        cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env(
            'serverBaseUrl'
          )}/${WHITELIST_POST_OR_DELETE_URL()}`,
          method: 'POST',
          body: [USER.STANDARD_USER.username],
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('when deleting from the whitelist', () => {
      before(() => {
        cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
      })

      it('should return FORBIDDEN status when deleting from the whitelist with invalid id', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${WHITELIST_POST_OR_DELETE_URL(
            -1
          )}`,
          method: 'DELETE',
          body: {},
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})
