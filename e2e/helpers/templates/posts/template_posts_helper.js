export default {
  completeLinkNameDialog(options = { waitForCreate: true }) {
    cy.get('[data-test=text-prompt-text-field]').type('a new note')
    cy.get('[data-test=link-url]').type('https://wikipedia.org')
    clickCreateAndWait(options.waitForCreate)
  },
  typeInNote(noteText) {
    cy.get('[data-test=notes-content-read-field]').click()
    cy.wait(1000)
    cy.get('[data-test=notes-content-edit-field]').type(noteText)
  },
  finaliseNote() {
    cy.get('[data-test=finalise-button]').click()
  },
  completeNoteNameDialog(
    options = { waitForCreate: true },
    noteText = 'a new note'
  ) {
    cy.get('[data-test=text-prompt-text-field]').type(noteText)
    clickCreateAndWait(options.waitForCreate)
  },
  completeDestinationDialogFromTemplateContext(searchInput) {
    cy.get('[data-test=task-select-base]').click()
    cy.get('[data-test=auto-complete-search-term]')
      .last()
      .find('input')
      .type(searchInput)
    cy.wait(500)
    cy.get('[data-test=search-result-list-item]').first().click()

    cy.backendRoute('POST', '/projecttemplates/*/tasks/*/posts').as(
      'createPost'
    )
    cy.get('[data-test=action-dialog-button]').click()
    cy.wait('@createPost')
  },
}
const clickCreateAndWait = (waitforCreate = true) => {
  if (waitforCreate) {
    cy.backendRoute('POST', '/projecttemplates/*/tasks/*/posts').as('postNote')
    cy.backendRoute('/projecttemplates/*/tasks/*/posts/*').as('fetchPost')
  }
  cy.get('[data-test="action-dialog-button"]').click()
  if (waitforCreate) cy.wait(['@postNote', '@fetchPost'])
}
