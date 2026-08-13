const makeRequest = (endpoint, method, body) => {
  let url = `${Cypress.env('serverBaseUrl')}${endpoint}`
  url = url.replace('/api', '')
  return cy.apiSpecRequest({
    url: url,
    method: method,
    body: body,
  })
}

describe('forogt_password_api.cy', () => {
  const endpoint = '/forgotpassword'
  before(() => {})
  describe('when making a POST request to /forgotpassword', () => {
    beforeEach(() => {
      cy.login('matter.creator@juralio.com', 'Password2Password2$')
    })
    it('should return client error response', () => {
      makeRequest(endpoint, 'POST', {}).then(response => {
        expect(response.status).to.be.within(400, 400)
      })
    })
  })
  describe('when making a POST request to /forgotpassword', () => {
    beforeEach(() => {
      cy.login('matter.creator@juralio.com', 'Password2Password2$')
    })
    it('should return client ok response', () => {
      makeRequest(endpoint, 'POST', { username: 'test' }).then(response => {
        expect(response.status).to.be.within(200, 200)
      })
    })
  })

  describe('when making a GET request to /forgotpassword', () => {
    beforeEach(() => {
      cy.login('matter.creator@juralio.com', 'Password2Password2$')
    })
    it('should return client error response', () => {
      makeRequest(endpoint, 'GET', {}).then(response => {
        expect(response.status).to.be.within(400, 499)
      })
    })
  })

  describe('when making a PATCH request to /forgotpassword', () => {
    beforeEach(() => {
      cy.login('matter.creator@juralio.com', 'Password2Password2$')
    })
    it('should return client error response', () => {
      makeRequest(endpoint, 'PATCH', {}).then(response => {
        expect(response.status).to.be.within(400, 499)
      })
    })
  })

  describe('when making a DELETE request to/forgotpassword', () => {
    beforeEach(() => {
      cy.login('matter.creator@juralio.com', 'Password2Password2$')
    })
    it('should return client error response', () => {
      makeRequest(endpoint, 'DELETE', {}).then(response => {
        expect(response.status).to.be.within(400, 499)
      })
    })
  })
})
