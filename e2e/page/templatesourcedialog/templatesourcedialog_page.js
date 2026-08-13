export default {
  get: {
    matterSelector: () => cy.get('[data-test=matter-select-container]'),
    matterSelectorInput: () =>
      cy.get('[data-test=matter-select-container]').find('input'),
    matterSelectorItem: () => cy.get('[data-test=matter-select-menu-item]'),

    projectSelector: () => cy.get('[data-test=project-select-container]'),
    projectSelectorInput: () =>
      cy.get('[data-test=project-select-container]').find('input'),
    projectSelectorItem: () =>
      cy.get('[data-test=workstream-item-name]', { timeout: 30000 }),

    taskSelector: () => cy.get('[data-test=task-select]', { timeout: 60000 }),
    taskSelectorInput: () => cy.get('[data-test=task-select]').find('input'),
    taskSelectorItem: () => cy.get('[data-test=task-search-item]'),

    parentTypeSelector: () =>
      cy.get('[data-test=destination-type-selection-dropdown]'),
    parentTypeLevelA: () => cy.get('[data-test=destination-level-a]'),
    parentTypeSubTaskOf: () => cy.get('[data-test=destination-subtask-of]'),

    createButton: () =>
      cy.get('[data-test=action-dialog-button]', { timeout: 5000 }),
    cancelButton: () =>
      cy.get('[data-test=cancel-dialog-button]', { timeout: 5000 }),
    subtaskOf: () => cy.get('[data-test=subtask-of]', { timeout: 5000 }),
    levelA: () => cy.get('[data-test=level-a]', { timeout: 5000 }),
    destinationSelect: () =>
      cy.get('[data-test=destination-select]', { timeout: 5000 }),
    existingRadio: () =>
      cy.get('[data-test=existing-project-radio]', { timeout: 5000 }),
  },
}
