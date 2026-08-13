export const get = {
  dialog: () => cy.get('[data-test=juralio-dialog]',{timeout:60000}),
  title: () =>
    cy.get('[data-test=juralio-dialog] [data-test=dialog-header-title-text]'),
  message: () => cy.get('[data-test=temporary-password-message]'),
  passwordValue: () => cy.get('[data-test=temporary-password-value]'),
  copyToClipboardLink: () => cy.get('[data-test=copy-password-link]'),
  closeButton: () => cy.get('[data-test=action-dialog-button]'),
}
