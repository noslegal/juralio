export default {
  colours: {
    disabled: 'rgba(0, 0, 0, 0.38)',
    enabled: 'rgb(63, 121, 155)',
  },
  get: {
    destinationDescriptionField: () =>
      cy.get('[data-test=task-creation-destination-field]'),

    editLink: () => cy.get('[data-test=task-creation-destination-field-edit]'),

    createButton: () => cy.get('[data-test=action-dialog-button]'),
    cancelButton: () => cy.get('[data-test=cancel-dialog-button]'),
  },
}
