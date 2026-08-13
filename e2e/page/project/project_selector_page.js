/* eslint-disable import/prefer-default-export */
export const get = {
  closedSelector: () => cy.get('[data-test=matter-switcher-closed]'),
  openSelector: () => cy.get('[data-test=matter-switcher-matter-list]'),
  templatesList: () => cy.get('[data-test=templates-list]'),
  // caption: () => cy.get('[data-test=project-selector-caption]'),
  overviewButton: () => cy.get('[data-test=matter-switcher-workstream-chip]'),
  // inboxButton: () =>
  //   cy.get(
  //     '[data-test=project-selector-expanded] [data-test=header-navigation-inbox-button]'
  //   ),
  taskMapButton: () => cy.get('[data-test=taskmap-navigation]'),
  timelineButton: () => cy.get('[data-test=timeline-navigation]'),
}
