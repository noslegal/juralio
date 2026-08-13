export default {
  openTaskCreateFlowFromFab: () => {
    cy.get('[data-test=fab-button]').click()
    cy.wait(1000)
    cy.get('[data-test=create-task-button]', { timeout: 3000 }).click({
      force: true,
    })
  },

  openMilestoneCreateFlowFromFab: () => {
    cy.get('[data-test=fab-button]').click()
    cy.get('[data-test=create-milestone-button]').click()
  },

  openTemplateTaskCreateFlowFromFab() {
    cy.get('[data-test=fab-button]').click()
    cy.wait(5000)
    cy.get('[data-test=create-template-task-button]', {
      timeout: 30000,
    }).click()
  },

  openTemplateCreateFlowFromFab() {
    cy.get('[data-test=fab-button]').click()
    cy.wait(5000)
    cy.get('[data-test=create-template-flow-dialog-button]')
    cy.get('[data-test=create-template-flow-dialog-button]').click()
  },

  selectFirstMatter() {
    cy.backendRoute('/matter/*/workstreams*').as('projectsFetch')
    cy.get('[data-test=search-results-list]')
    cy.get('[data-test=matter-select-menu-item]').first().click()
    cy.wait('@projectsFetch')
  },

  selectFirstProject() {
    cy.backendRoute('/matter/*/workstreams/*').as('projectFetch')
    cy.get('[data-test=search-results-list]')
    cy.get('[data-test=workstream-item-name]').first().click()
    cy.wait('@projectFetch')
  },

  selectFirstTask() {
    cy.backendRoute('/matter/*/workstreams/*/tasks').as('tasksFetch')
    cy.get('[data-test=task-select]')
      .find('input')
      .click()
      .type('a')
      .type('{backspace}')
    cy.wait('@tasksFetch')
    cy.wait(5000)
    cy.get('[data-test=task-search-item]', { timeout: 30000 }).first().click()
  },

  getTaskSelector() {
    cy.get('[data-test=task-select]')
  },

  getTaskSelectorInput() {
    getTaskSelector().find('input')
  },

  getSearchResultsList() {
    cy.get('[data-test=search-results-list]')
  },
}
