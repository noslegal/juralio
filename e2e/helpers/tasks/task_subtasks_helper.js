export function assertSubtaskText(group, taskIndex, expectedText) {
  cy.get(`[data-test=${group}]`)
    .find('[data-test=task-cell-test]')
    .eq(taskIndex)
    .find('[data-test=name]')
    .should('have.text', expectedText)
}

export function assertSubtaskCount(group, expectedCount) {
  cy.get(`[data-test=${group}]`)
    .find('[data-test=task-cell-test]')
    .should('have.length', expectedCount)
}
