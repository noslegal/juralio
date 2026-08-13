import destinationPage from '../../page/destinationdialog/destinationdialog_page'
import textWithDestinationDialog from '../../page/textwithdestinationdialog/textwithdestinationdialog_page'

export function openCreateTask() {
  cy.get('[data-test=fab-button]').click()
  cy.wait(1000)
  cy.get('[data-test=create-task-button]', { timeout: 30000 }).click({
    force: true,
  })
}

export function enterTaskName(taskName) {
  openCreateTask()
  cy.backendRoute('/matters*').as('mattersFetch')
  cy.get('[data-test=text-prompt-text-field]')
    .find('input')
    .type(taskName)
    .type('{enter}')
  cy.wait('@mattersFetch')
}
export function enterTaskNameNoOpen(taskName) {
  cy.get('[data-test=text-prompt-text-field]')
    .find('input')
    .type(taskName)
    .type('{enter}')
}

export function enterTaskNameNoOpenNoSubmit(taskName) {
  cy.get('[data-test=text-prompt-text-field]').find('input').type(taskName)
}

export function createTaskFromFabInContext(
  taskName,
  skipCreate = false,
  changeDestination = false
) {
  openCreateTask()
  if (taskName.length > 0) {
    cy.get('[data-test=text-prompt-text-field]').find('input').type(taskName)
  }

  if (!skipCreate) {
    cy.backendRoute('POST', '/matter/*/workstreams/*/tasks**').as('postNewTask')
    cy.get('[data-test=text-prompt-text-field]').find('input').type('{enter}')
    cy.wait('@postNewTask')
  }

  if (changeDestination) {
    cy.backendRoute('/matter/*/workstreams/*').as('getProject')
    textWithDestinationDialog.get.editLink().click()
    cy.wait('@getProject')
  }
}

export function createTaskFromFabRapid(taskName, skipCreate = false) {
  openCreateTask()
  cy.get('[data-test=text-prompt-text-field]').find('input').type(taskName)

  if (skipCreate) return

  cy.get('[data-test=text-prompt-text-field]').type('{enter}')

  cy.backendRoute('POST', '/matter/*/workstreams/*/tasks**').as('postNewTask')
  destinationPage.get.createButton().click()
  cy.wait('@postNewTask')
}

export function createTaskFromFab(taskName, skipCreate, levelAtask) {
  cy.backendRoute('/matters*').as('mattersFetch')
  openCreateTask()
  cy.get('[data-test=text-prompt-text-field]')
    .find('input')
    .type(taskName)
    .type('{enter}')
  cy.wait('@mattersFetch')
  ensureDialogInteractable(skipCreate)

  if (!skipCreate) {
    if (levelAtask) {
      destinationPage.get.parentTypeSelector().click()
      destinationPage.get.parentTypeLevelA().click()
    }

    ensureDialogInteractable(levelAtask)
    cy.backendRoute('POST', '/matter/*/workstreams/*/tasks**').as('postNewTask')
    destinationPage.get.createButton().click()
    cy.wait('@postNewTask')
  }
}

function ensureDialogInteractable(skipTaskCheck) {
  // Ensure Dialog has appeared and elements are ready for interaction.
  cy.get('[data-test=juralio-dialog]')
  destinationPage.get.matterSelector()
  if (!skipTaskCheck) {
    destinationPage.get.taskSelectorInput()
    destinationPage.get.taskSelector()
  }
  destinationPage.get.createButton()
}
