import HttpStatus from 'http-status-codes'

describe('get_active_users_month.cy', () => {
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

  const URL = 'usage/report/month'

  describe('when trying fetch the active users for a month', () => {
    describe('when signed in as a standard user', () => {
      before(() => {
        cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'POST',
          body: { period: '2020-09-01T21:59:00Z' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })

  describe('when trying fetch the active users for a month', () => {
    describe('when signed in as a sysadmin', () => {
      const requestBody = {
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
      }
      before(() => {
        cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}`,
          method: 'POST',
          body: { period: '2020-09-01T21:59:00Z' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })

      const verbs = ['GET', 'PUT', 'PATCH', 'DELETE']
      // For some reason GRAILS returns a 401 for these verbs.
      verbs.forEach(verb =>
        it(`should return UNAUTHORIZED status for ${verb}`, () => {
          cy.apiSpecRequest({
            ...requestBody,
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
          })
          cy.apiSpecRequest({
            ...requestBody,
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
          })
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
})
