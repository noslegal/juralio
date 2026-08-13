import taskDetailPage from '../../page/taskdetail/taskdetail_page'

let { moveDialog } = taskDetailPage

export function checkListOfTasks(tasks) {
  cy.get('[data-test=task-search-item]').should('have.length', tasks.length)
  for (let i = 0; i < tasks.length; i++) {
    cy.get('[data-test=task-item-name-' + i + ']').contains(tasks[i][0])
    if (tasks[i].length > 1) {
      cy.get('[data-test=task-item-referencenumber-' + i + ']').contains(
        tasks[i][1]
      )
    }
  }
}

export function openTaskMoveTask() {
  taskDetailPage.get.optionMenuButton().click()
  cy.get('[data-test=task-card-option-menu-more]').click()
  taskDetailPage.optionMenu.get.moveMenuItem().click()
}

export function openTaskMoveToLevelA() {
  taskDetailPage.get.optionMenuButton().click()
  cy.get('[data-test=task-card-option-menu-more]').click()
  taskDetailPage.optionMenu.get.moveMenuItem().click()
  moveDialog.get.destinationSelectionDropdown().click()
  moveDialog.get.destinationOption.levelA().click()
}

export function openTaskMoveToNewParentTask() {
  taskDetailPage.get.optionMenuButton().click()
  cy.get('[data-test=task-card-option-menu-more]').click()
  taskDetailPage.optionMenu.get.moveMenuItem().click()
  moveDialog.get.destinationSelectionDropdown().click()
  moveDialog.get.destinationOption.newTask().click()
  moveDialog.get.destinationTextField().click()
  moveDialog.get.destinationTextField().type('!{BACKSPACE}')
}

export function openTaskMoveToSpecificTaskAndConfirm(
  taskName,
  confirm,
  wait = true
) {
  taskDetailPage.get.optionMenuButton().click()
  cy.get('[data-test=task-card-option-menu-more]').click()
  taskDetailPage.optionMenu.get.moveMenuItem().click()
  cy.wait(5000)
  moveDialog.get.destinationSelectionDropdown().click({ timeout: 30000 })
  moveDialog.get.destinationOption.newTask().click()
  moveDialog.get.destinationTextField().click()
  moveDialog.get.destinationTextField().type(taskName)
  if (confirm) {
    cy.backendRoute('POST', '/matter/*/workstreams/*/task/**').as('postTask')
    cy.backendRoute('/matter/*/workstreams/*?includeFullHierarchy=true').as(
      'getFullProject'
    )
    cy.get('[data-test=task-search-item]').click()
    cy.get('[data-test=action-dialog-button]').click()
    if (wait) {
      cy.wait(['@postTask', '@getFullProject'])
    }
  }
}

export function openTaskMoveToNewProject(projectShown = false) {
  taskDetailPage.get.optionMenuButton().click(15, 15, { force: true })
  cy.get('[data-test=task-card-option-menu-more]').click()
  taskDetailPage.optionMenu.get.moveMenuItem().click()
  moveDialog.get.destinationSelectionDropdown().click()
  moveDialog.get.destinationOption.newProject().click()
  if (projectShown) {
    moveDialog.get.destinationProjectTextField().click()
    moveDialog.get.destinationProjectTextField().type('!{BACKSPACE}')
  }
}

export function openTaskCopy() {
  taskDetailPage.get.optionMenuButton().click()
  cy.get('[data-test=task-card-option-menu-more]').click()
  taskDetailPage.optionMenu.get.copyMenuItem().click()
}

export function openTemplateTaskCopy() {
  taskDetailPage.get.templateOptionMenuButton().click()
  taskDetailPage.optionMenu.get.copyMenuItem().click()
}

export function openTemplateTaskMove() {
  taskDetailPage.get.templateOptionMenuButton().click()
  taskDetailPage.optionMenu.get.moveMenuItem().click()
}
