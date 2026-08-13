import HttpStatus from 'http-status-codes'

describe('post_shared_matters.cy', () => {
  const USER = {
    STANDARD_USER: {
      username: 'matter.creator@juralio.com',
      password: 'Password2Password2$',
    },
  }

  const URL = 'matters/shared'

  describe('when trying to perform a shared matter search when not signed in', () => {
    it('should return UNAUTHORIZED status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
      })
    })
  })

  describe('when trying to perform a user filter search as an authenticated user', () => {
    beforeEach(() => {
      cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
    })

    it('should return OK status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'POST',
        body: { searchTerm: 'user' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should return METHOD_NOT_ALLOWED status for GET', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
    it('should return METHOD_NOT_ALLOWED status for PATCH', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'PATCH',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
    it('should return METHOD_NOT_ALLOWED status for DELETE', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/${URL}`,
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
  })
})
