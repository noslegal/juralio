describe('spa_index_spec.cy', () => {
  it('serves the SPA entry page anonymously on GET /', () => {
    cy.request({ url: '/', failOnStatusCode: false }).then(response => {
      expect(response.status).to.eq(200)
      expect(response.headers['content-type']).to.contain('text/html')
    })
  })

  it('does not allow non-GET methods on /', () => {
    cy.request({ method: 'POST', url: '/', failOnStatusCode: false }).then(
      response => {
        // 405 from the server; 404 when the dev-mode frontend server answers
        expect(response.status).to.be.oneOf([404, 405])
      }
    )
  })
})
