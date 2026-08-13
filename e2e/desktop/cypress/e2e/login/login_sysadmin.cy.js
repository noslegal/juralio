describe('login_sysadmin.cy', () => {
  describe('when login as sysadmin', () => {
    before(() => {
      cy.visit('/#/login')

      cy.get('[data-test="username-input"]')
        .find('input')
        .type('sysadmin@juralio.com')
      cy.get('[data-test="password-input"]')
        .find('input')
        .type('Password1Password1$')
        .type('{enter}')
    })

    it('the user should be navigated to the home page', () => {
      cy.url().should('contain', '/#/home')
    })
  })
})
