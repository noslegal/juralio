export default {
  get: {
    matterSelector: () => cy.get('[data-test=matter-select-container]'),
    matterSelectorInput: () =>
      cy.get('[data-test=matter-select-container]').find('input'),
    matterSelectorItem: () => cy.get('[data-test=matter-select-menu-item]'),

    projectSelector: () => cy.get('[data-test=project-select-container]'),
    projectSelectorInput: () =>
      cy
        .get('[data-test=project-select-container]', { timeour: 30000 })
        .find('input', { timeout: 30000 }),
    projectSelectorItem: () => cy.get('[data-test=workstream-item-name]'),

    parentTypeSelector: () =>
      cy.get('[data-test=destination-type-selection-dropdown]', {
        timeout: 30000,
      }),
    parentTypeHeader: () =>
      cy.get('[data-test=destination-type-header]', { timeout: 10000 }),
    parentTypeLevelA: () => cy.get('[data-test=destination-level-a]'),
    parentTypeSubTaskOf: () => cy.get('[data-test=destination-subtask-of]'),
    parentTypeSelectValidationMessage: () =>
      cy.get(
        '[data-test=destination-type-selection-dropdown-validation-message]'
      ),

    taskSelector: () => cy.get('[data-test=task-select]'),
    taskSelectorInput: () => cy.get('[data-test=task-select]').find('input'),
    taskListItem: index =>
      cy.get('[data-test=task-search-item]', { timeout: 30000 }).eq(index),

    createButton: () =>
      cy.get('[data-test=action-dialog-button]', { timeout: 5000 }),
    cancelButton: () =>
      cy.get('[data-test=cancel-dialog-button]', { timeout: 5000 }),
  },
}
