import { wrapInput } from '../wrapper/text-field-wrapper'

// eslint-disable-next-line import/prefer-default-export
export const get = {
  dialog: () => cy.get('[data-test=update-user-dialog]'),
  firstNameInput: () => wrapInput(() => cy.get('[data-test=first-name-field]')),
  lastNameInput: () => wrapInput(() => cy.get('[data-test=last-name-field]')),
  emailInput: () => wrapInput(() => cy.get('[data-test=email-field]')),
  organisationSelectorInput: () =>
    wrapInput(() => cy.get('[data-test=organisation-selector]')),
  organisationSelector: () =>
    cy.get('[data-test=organisation-selector]'),
  matterCreatorCheckbox: () =>
    cy.get('[data-test=matter-creator-checkbox] input'),
  orgAdminCheckbox: () => cy.get('[data-test=org-admin-checkbox] input'),
  userAvatar: () =>
    cy.get('[data-test=update-user-dialog] [data-test=user-avatar]'),
  saveButton: () =>
    cy.get('[data-test=update-user-dialog] [data-test=action-dialog-button]'),
  resetPasswordLink: () => cy.get('[data-test=reset-password-link]'),
  knowledgeManagerCheckbox: () =>
    cy.get('[data-test=knowledge-manager-checkbox] input'),
  internalRadioButton: () => cy.get('[data-test=internal-radio-button] input'),
  externalRadioButton: () => cy.get('[data-test=external-radio-button] input'),
}