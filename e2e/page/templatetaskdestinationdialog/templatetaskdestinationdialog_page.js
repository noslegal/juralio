export default {
  get: {
    templateSelector: () => cy.get('[data-test=template-select-container]'),
    templateSelectorInput: () => cy.get('[data-test=template-select-container]').find('input'),
    templateSelectorItem: () => cy.get('[data-test=template-search-name]'),

    parentTypeSelector: () => cy.get('[data-test=destination-type-selection-dropdown]', { timeout: 8000 }),
    parentTypeHeader: () => cy.get('[data-test=destination-type-header]', { timeout: 8000 }),
    parentTypeLevelA: () => cy.get('[data-test=destination-level-a]', { timeout: 8000 }),
    parentTypeSubTaskOf: () => cy.get('[data-test=destination-subtask-of]', { timeout: 8000 }),
    parentTypeSelectValidationMessage: () => cy.get(
      '[data-test=destination-type-selection-dropdown-validation-message]', { timeout: 8000 }
    ),

    taskSelector: () => cy.get('[data-test=template-task-select]', { timeout: 8000 }),
    taskSelectorInput: () => cy.get('[data-test=template-task-select]', { timeout: 8000 }).find('input'),
    taskListItem: index => cy
      .get('[data-test=template-task-search-item]', { timeout: 8000 })
      .eq(index),

    createButton: () => cy.get('[data-test=action-dialog-button]', { timeout: 8000 }),
  },
}
