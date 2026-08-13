export default {
  get: {
    listRiskSystem: () => cy.get('[data-test=list-risksystem]'),
    listRiskOrganisation: () => cy.get('[data-test=list-riskorganisation]'),
    listRiskMatter: () => cy.get('[data-test=list-riskbespoke]'),
    listWorkflowSystem: () => cy.get('[data-test=list-workflowsystem]'),
    listWorkflowOrganisation: () =>
      cy.get('[data-test=list-workfloworganisation]'),
    listWorkflowMatter: () => cy.get('[data-test=list-workflowbespoke]'),
    listRisksBespoke: () =>
      cy.get('[data-test=list-riskbespoke] [data-test=label-chip-text]'),
    listWorkflowBespoke: () =>
      cy.get('[data-test=list-workflowbespoke] [data-test=label-chip-text]'),
    listUserDefined: () =>
      cy.get('[data-test=list-userDefined] [data-test=label-chip-text]'),
    labelChipIndicators: () => cy.get('[data-test=label-chip-indicator]'),
    labelChipText: () => cy.get('[data-test=label-chip-text]'),
    labelListTitle: () =>
      cy.get('[data-test=label-list-title]', { timeout: 30000 }),
    labelListZeroState: () => cy.get('[data-test=label-list-title-zero-state]'),
    labelTextField: () => cy.get('[data-test=label-text-field]'),
    labelCreationDate: () => cy.get('[data-test=label-creation-date]'),
    labelToggleText: () => cy.get('[data-test=switch-with-text-status]'),
    labelToggles: () => cy.get('[data-test=switch-with-text]'),
    labelsPanelCaption: () => cy.get('[data-test=panel-caption]'),
    labelsPanelItem: () => cy.get('[data-test=labels]'),
    labelsPanelTitle: () => cy.get('[data-test=panel-title]'),
    labelsUsageCountLink: () => cy.get('[data-test=label-usage-count-link]'),
    labelsUsageCountDialogText: () => cy.get('[data-test=dialog-usage-count]'),
    riskTab: () => cy.get('[data-test=risk-tab]'),
    workflowTab: () => cy.get('[data-test=workflow-tab]'),
    addLabelButton: () => cy.get('[data-test=add-label-button]'),
    editLabelButton: () => cy.get('[data-test=edit-label-button]'),
    deleteLabelButton: () =>
      cy.get('[data-test=delete-label-button]', { timeout: 10000 }),
    deletedLabelListItem: () => cy.get('[data-test=deleted-label-list-item]'),
    deletedLabelListItemText: () =>
      cy.get('[data-test=deleted-label-list-item-right-text]'),
    saveLabelButton: () => cy.get('[data-test=label-text-field-save-button]'),
    userDefinedTab: () => cy.get('[data-test=hashtag-tab]'),
    cancelLabelButton: () =>
      cy.get('[data-test=label-text-field-cancel-button]'),
  },
}
