export default {
  get: {
    accountOptionsButton: () => cy.get('[data-test=account-options]'),
    accountOptionsTitle: () => cy.get('[data-test=role-option-title]'),
    orgAdminCheckbox: () => cy.get('[data-test=org-admin-checkbox]'),
    matterCreatorCheckbox: () => cy.get('[data-test=matter-creator-checkbox]'),
    knowledgeManagerCheckbox: () =>
      cy.get('[data-test=knowledge-manager-checkbox]').click(),
  },
}
