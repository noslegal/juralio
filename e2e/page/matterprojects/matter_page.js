const matterPage = {
  get: {
    clientName: () => cy.get('[data-test=client-name]'),
    matterName: () => cy.get('[data-test=matter-name]'),
    userDefinedReferenceNumber: () =>
      cy.get('[data-test=user-defined-reference-number]'),
    statusToggle: () => cy.get('[data-test=status-select-selection-dropdown]'),
    juralioReferenceNumber: () =>
      cy.get('[data-test=juralio-reference-number]'),
    matterDetailsButton: () => cy.get('[data-test=edit-matter-details-button]'),
    createNewWorkstreamButton: () =>
      cy.get('[data-test=create-new-workstream]'),
    singleWorkstreamsWorkstreamsText: () =>
      cy.get('[data-test=single-workstreams]'),
    multipleWorkstreamsText: () => cy.get('[data-test=multiple-workstreams]'),
    matterTeamSize: () => cy.get('[data-test=matter-team-size]'),
    matterAdminCount: () => cy.get('[data-test=matter-admins-count]'),
    teamSummaryPanel: () => cy.get('[data-test=team-summary-panel]'),
    clientNameInput: () => cy.get('[data-test=client-name] input'),
    nameInput: () => cy.get('[data-test=name] input'),
    referenceNumberInput: () => cy.get('[data-test=reference-number] input'),
    matterOverviewButton: () => cy.get('[data-test=go-to-matter-overview]'),
  },
}

export default matterPage
