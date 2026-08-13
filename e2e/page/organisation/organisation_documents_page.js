export default {
  get: {
    switchLabel: () => cy.get('[data-test=documents-panel-switch-label]'),
    switch: () => cy.get('[data-test=documents-panel-switch]'),
    switchStatus: () => cy.get('[data-test=documents-panel-switch-status]'),
    switchHelperText: () => cy.get('[data-test=documents-panel-helper-text]'),
  },
}
