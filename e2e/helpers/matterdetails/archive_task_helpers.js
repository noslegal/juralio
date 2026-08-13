export function archiveLevelATask(project) {
  cy.get('[data-test=project-selector-closed]').click()
  cy.wait(1000)
  cy.get('[data-test=taskmap-navigation]').eq(project).click()
  cy.get('[data-test=options-dropdown]').eq(1).click()
  cy.get('[data-test=task-card-option-menu-archive]').click()
  cy.get('[data-test=action-dialog-button]').click()
}

export function goToarchiveTable(userHasBothRole, matterUrl) {
  cy.login(userHasBothRole.username)
  cy.visit(matterUrl)
  cy.wait(1000)
  cy.get('[data-test=archive]').click()
}

export function archiveTaskById(matterId, projectId, taskId) {
  cy.visit(`/#/matter/${matterId}/workstream/${projectId}/task/${taskId}`)
  cy.wait(1000)
  cy.get('[data-test=task-card-option-menu-button]', { timeout: 30000 }).click()
  cy.get('[data-test=task-card-option-menu-more]').click()
  cy.get('[data-test=task-card-option-menu-archive]').click()
  cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/archive').as(
    'archiveTask'
  )
  cy.get('[data-test=action-dialog-button]').click()
  cy.wait('@archiveTask')
  cy.wait(1000)
}

export function archiveTask(task) {
  cy.get('[data-test=options-dropdown]').eq(task).click()
  cy.wait(1000)
  cy.get('[data-test=task-card-option-menu-more]').click()
  cy.get('[data-test=task-card-option-menu-archive]').click()
  cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/archive').as(
    'archive'
  )
  cy.get('[data-test=action-dialog-button]').click()
  cy.wait('@archive')
  cy.wait(1500)
}
