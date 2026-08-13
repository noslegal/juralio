const getCheckbox = () => cy.get('[data-test=include-posts]')

export const clickIncludePosts = () => getCheckbox().click()

export const checkIncludePostsTicked = options => {
  getCheckbox().should('be.visible')

  if (options.checked) {
    getCheckbox().find('input').should('be.checked')
  } else {
    getCheckbox().find('input').should('not.be.checked')
  }
}

export const selectTemplateTaskAndConfirm = index => {
  cy.get('[data-test=use-template-button]', { timeout: 30000 }).click()
  cy.get('[data-test=use-partial-template-radio]').click()
  cy.get('[data-test=action-dialog-button]').click()
  cy.wait(5000)
  cy.get('[data-test=task-cell-test]').eq(index).click()
  cy.get('[data-test=confirm-selection-button]').click({ force: true })
}

export const selectTemplateProjectAndConfirm = () => {
  cy.get('[data-test=use-template-button]').click()
  cy.get('[data-test=use-full-template-radio]').click()
  cy.get('[data-test=action-dialog-button]').click()
}
