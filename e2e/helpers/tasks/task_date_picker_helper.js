const pushDateButton = keyNumber => {
  cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/**').as('patchTask')
  cy.get('[data-test=calendar-date]')
    .contains(new RegExp(`^${keyNumber}$`))
    .click()
  cy.wait('@patchTask')
  cy.wait(1000)
}

export default pushDateButton
