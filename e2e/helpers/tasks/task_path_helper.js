export const getTaskPathItems = () =>
  cy.get('[data-test=task-path-item]')

export const assertPathItemContents = (index, expectedLevel) => {
  cy.get('[data-test=task-level-letter]')
    .eq(index)
    .should('have.text', expectedLevel)
}
