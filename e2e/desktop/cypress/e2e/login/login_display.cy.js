describe('login_display.cy', () => {
  describe('when navigating to the login page', () => {
    before(() => {
      cy.clearUserSession()
      cy.visit('/#/login')
    })

    it('displays the correct title text in the Browser', () => {
      cy.title().should('eq', 'Login | Juralio')
    })

    describe('the username field', () => {
      const getUsernameField = () =>
        cy.get('[data-test=username-input]').find('input')

      it('should be displayed', () => {
        getUsernameField().should('be.visible')
      })
    })

    describe('the password field', () => {
      const getPasswordField = () =>
        cy.get('[data-test=password-input]').find('input')

      it('should be displayed', () => {
        getPasswordField().should('be.visible')
      })
    })

    describe('The copyright and version message', () => {
      it('the copyright text should be displayed', () => {
        cy.get('[data-test=copyright-info]').should(
          'contain',
          `Copyright © ${new Date().getFullYear()} Juralio Ltd`
        )
      })

      //build is currently set to unknown, reintroduce this test when functionality arrives
      // it('the build version text should be displayed', () => {
      //   cy.get('[data-test=version-info]').should(
      //     'contain',
      //     'Build 111.222-333'
      //   )
      // })
    })
  })
})
