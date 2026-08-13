import HttpStatus from 'http-status-codes'

describe('sa_get_organisations.cy', () => {
  const USER = {
    STANDARD_USER: {
      username: 'matter.creator@juralio.com',
      password: 'Password2Password2$',
    },
    SYSADMIN: {
      username: 'sysadmin@juralio.com',
      password: 'Password1Password1$',
    },
  }

  const URL = 'organisations'

  describe('when trying to list organisations', () => {
    describe('as SYSADMIN', () => {
      beforeEach(() => {
        cy.login(USER.SYSADMIN.username, USER.SYSADMIN.password)
      })
      it('should return OK status for a GET', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })

      it('should return METHOD_NOT_ALLOWED status for a PATCH', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'PATCH',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })

      it('should return METHOD_NOT_ALLOWED status for a DELETE', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })
    })

    describe('as STANDARD USER', () => {
      beforeEach(() => {
        cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
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
  })
})
