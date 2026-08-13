export function getReadField(lineNumber) {
  return getDescriptionField().find(`[data-test="raw-text-line${lineNumber}"]`)
}

export function getZeroStatePlaceholder() {
  return getDescriptionField().find('[data-test=zero-state-placeholder]')
}

export function getDescriptionField() {
  return cy.get('[data-test="task-description"]')
}

export function getEditField() {
  return cy
    .get('[data-test="task-description"]')
    .find('[contenteditable]')
}
