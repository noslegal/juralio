/* eslint-disable import/prefer-default-export */
export const openSelector = isMobile => {
  cy.backendRoute('/matters').as('getMatters')

  if (!isMobile) {
    cy.backendRoute('/matter/*/workstreams?**').as('getProjects')
  }

  cy.get('[data-test=matter-switcher-button]').click()
  // cy.wait(['@getMatters', ...(isMobile ? [] : ['@getProjects'])]) Causing issues
}
