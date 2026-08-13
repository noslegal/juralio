describe('unauthorised_redirection.cy', () => {
  before(() => {
    cy.visit('/#/logout')
  })

  describe('when logged out and attempting to access matter details page', () => {
    before(() => {
      cy.visit('/#/matters/32')
    })

    it('should not open matters details page', () => {
      cy.url().should('not.contain', 'matters/32')
    })
  })
})
