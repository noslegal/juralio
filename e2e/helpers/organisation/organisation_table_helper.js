// eslint-disable-next-line import/prefer-default-export
export const getOrgRowByOrgName = orgName => {
  cy.get('[data-test=search-button]').click()
  cy.get('[data-test=Search]').clear().type(orgName, { delay: 5 })
  return cy.get('[data-test=organisation-list-item]')
}
