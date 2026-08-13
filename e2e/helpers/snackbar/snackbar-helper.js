export default {
  checkShownAndHasExpectedText(expectedText, expectedActionText) {
    it('Snack shown with a message as "' + expectedText + '"', () => {
      cy.get('[data-test=snackbar-message]', { timeout: 30000 })
        .should('be.visible')
        .should('contain', expectedText)
    })
    it('Snack shows dismiss text', () => {
      cy.get('[data-test=snackbar-dismiss]')
        .should('be.visible')
        .should('contain', 'Dismiss')
    })
    if (expectedActionText) {
      it('Snack shown with action text  "' + expectedActionText + '"', () => {
        cy.get('[data-test=snackbar-redirect-action-button]')
          .should('be.visible')
          .should('have.text', expectedActionText)
      })
    }
  },
  clickActionButton() {
    cy.get('[data-test=snackbar-redirect-action-button]').click()
  },
  clickDismissButton() {
    cy.get('[data-test=snackbar-dismiss]').click()
  },
}
