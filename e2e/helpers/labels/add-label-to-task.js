// Assume test has navigate to taskDetails

// eslint-disable-next-line import/prefer-default-export
export const addLabelToTask = label => {
  cy.backendRoute('/matter/*/labels*').as('getLabels')
  cy.get('[data-test=add-label-button]').click()
  cy.wait('@getLabels')

  cy.wait(1000)
  cy.get('[data-test=label-chip-text]').contains(label).click()
}

export const addRiskToTask = (label, modifier = 'red') => {
  cy.backendRoute('/matter/*/labels*').as('getLabels')
  cy.get('[data-test=add-label-button]').click()
  cy.wait('@getLabels')

  cy.wait(1000)
  cy.get('[data-test=label-chip-text]').contains(label).click()
  cy.get(`[data-test=modifier-option-${modifier}]`).click()
}

export const addHashtagToTask = label => {
  cy.backendRoute('/matter/*/labels*').as('getLabels')
  cy.get('[data-test=add-label-button]').click()
  cy.wait('@getLabels')

  cy.wait(1000)
  cy.get('[data-test=label-search-field]').find('input').type(`${label}{enter}`)
}
