/* eslint-disable import/prefer-default-export */
export const openFilterPanel = () => {
  cy.get('[data-test=selector-label]').click()
  cy.get('[data-test=person-filter-selected-text]').click()
}

export const filterByUser = (searchText, index) => {
  cy.get('[data-test=selector-label]').click({ force: true })
  cy.get('[data-test=person-filter-selected-text]').click()
  cy.get(
    '[data-test=panel-selector-panel] [data-test=auto-complete-search-term]'
  )
    .find('input')
    .type(searchText)
  cy.get('[data-test=panel-selector-panel] [data-test=search-result-list-item')
    .eq(index)
    .click()
}

export const filterByYou = () => {
  cy.backendRoute('/todo/search**').as('fetchTodos')
  cy.backendRoute('/usernotifications/**').as('fetchNotifications')
  cy.get('[data-test=selector-label]').click({ force: true })
  cy.get('[data-test=person-filter-selected-text]').click()
  cy.get('[data-test=person-filter-you]').click()
  cy.wait('@fetchNotifications')
  cy.wait('@fetchTodos')
}

export const filterByAnybody = () => {
  cy.get('[data-test=person-filter-selected-text]').click()
  cy.get('[data-test=person-filter-everyone]').click()
}

export const filterByUnassigned = () => {
  cy.get('[data-test=selector-label]').click({ force: true })
  cy.get('[data-test=person-filter-selected-text]').click()
  cy.get('[data-test=person-filter-unassigned]').click()
}

export const selectTaskViaTimeline = name =>
  cy.get('[data-test=task-browser-bar]').contains(name).click()
