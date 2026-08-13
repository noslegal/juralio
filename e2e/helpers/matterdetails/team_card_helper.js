export const getAutocompleteInput = () =>
  cy
    .get('[data-test=matter-people-content]')
    .find('[data-test=add-user-matter-button]')

export const getMatterAccessSelect = rowIndex =>
  cy
    .get(`[data-rowindex=${rowIndex}]`)
    .find('[data-test=matter-content]')

export const getMatterAccessOption = optionDataTest =>
  cy.get(`[role=listbox] [data-test=${optionDataTest}]`)

export const getUserRowByUsername = username => {
  cy.get('[data-test=search-button]').click()
  cy.get('[data-test=Search]')
    .clear()
    .type(username.substring(0, 10), { delay: 5 })
  return cy.get('[data-test=matters-user-list-item]')
}
