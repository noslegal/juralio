import { wrapEditableTextField } from '../../wrapper/editable-text-field-wrapper'

// eslint-disable-next-line import/prefer-default-export
export const get = {
  menu: {
    button: () => cy.get('[data-test=overview-option-menu-button]'),
    favouriteButton: () => cy.get('[data-test=heart-button]'),
    downloadTaskListItem: () =>
      cy.get('[data-test=menu-text-download-task-list]'),
    renameItem: () => cy.get('[data-test=menu-text-rename]'),
    editDescriptionItem: () => cy.get('[data-test=menu-text-edit-description]'),
    deleteTemplate: () => cy.get('[data-test=menu-text-delete-template]'),
    copyTemplate: () => cy.get('[data-test=menu-text-copy-template]'),
  },
  peopleDialog: () => cy.get('[data-test=juralio-dialog]'),
  peopleLabel: () => cy.get('[data-test=people-label]'),
  peopleSeeAllLink: () => cy.get('[data-test=people-see-all-link]'),
  peopleZeroState: () => cy.get('[data-test=people-zero-state]'),
  postCount: () => cy.get('[data-test=post-count]'),
  postCountLabel: () => cy.get('[data-test=post-count-label]'),
  projectName: () => cy.get('[data-test=bread1]', { timeout: 10000 }),
  projectDescription: () =>
    wrapEditableTextField(
      () => cy.get('[data-test=project-description]'),
      true
    ),
  taskCount: () => cy.get('[data-test=task-count]'),
  taskCountLabel: () => cy.get('[data-test=task-count-label]'),
  templateOptions: () => cy.get('[data-test=template-options]'),
  taskMapZeroState: {
    text: () => cy.get('[data-test=project-overview-taskmap-no-content]'),
    image: () => cy.get('[data-test=zero-state-image]'),
    button: () => cy.get('[data-test=add-task-button]'),
  },
  froalaProjectDescription: () =>
    cy.get('[data-test=project-description]', { timeout: 30000 }),
}
