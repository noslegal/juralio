/* eslint-disable import/prefer-default-export */
import taskmapPage from '../../page/taskmap/taskmap_page'
import VisitHelpers from './visit_helpers'

const taskOptionsMenu = taskmapPage.operationMenu

class Wrapper {
  constructor(fixture) {
    this.fixture = fixture
    this.visitHelpers = new VisitHelpers()
  }

  visitTaskByName(name, useWaits = true, useChecks = true) {
    let targetTask = this.fixture.tasksMappedByName[name]
    if (!targetTask) {
      console.error('Could not find task [' + name + ']')
    }

    this.visitHelpers.visitTaskDetails(
      this.fixture.matter.id,
      targetTask.projectId,
      targetTask.id,
      false,
      useWaits
    )

    if (useChecks) {
      cy.get('[data-test=task-name]', { timeout: 12000 }).should(
        'have.text',
        name
      )
    }
  }

  visitTaskById(matterId, projectId, taskId) {
    this.visitHelpers.visitTaskDetails(matterId, projectId, taskId, false, true)
    cy.get('[data-test=task-name]', { timeout: 12000 }).should('be.visible')
  }

  changeTaskStatus(name, index, confirm) {
    this.visitTaskByName(name)
    taskOptionsMenu.menuButton().click()
    cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*').as('patchTask')
    taskOptionsMenu.menuItem(index).click()
    cy.wait('@patchTask')
    cy.wait(2500)
    if (confirm) {
      cy.wait(2500)
      cy.get('[data-test=action-dialog-button]', { timeout: 12000 }).click()
      cy.wait('@patchTask')
    }
  }

  changeTaskStatusNotRequired(name) {
    this.visitTaskByName(name)
    cy.wait(500)
    taskOptionsMenu.menuButton().click()
    cy.wait(500)
    taskOptionsMenu.menuItem(3).click()
    cy.wait(500)

    cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*').as('patchTask')
    cy.get('[data-test=action-dialog-button]').click()
    cy.wait('@patchTask')
    cy.wait(500)
  }

  visitTaskMap(projectIndex = 0) {
    this.visitHelpers.visitTaskMap(
      this.fixture.matter.id,
      this.fixture.projects[projectIndex].id
    )
  }

  visitTaskList(projectIndex = 0) {
    this.visitHelpers.visitTaskList(
      this.fixture.matter.id,
      this.fixture.projects[projectIndex].id
    )
  }

  visitRoadmap(projectIndex = 0) {
    this.visitHelpers.visitRoadmap(
      this.fixture.matter.id,
      this.fixture.projects[projectIndex].id
    )
  }

  visitMatter() {
    this.visitHelpers.visitMatter(this.fixture.matter.id)
  }

  visitTemplates() {
    this.visitHelpers.visitTemplates()
  }

  visitTemplateTaskMap(id) {
    this.visitHelpers.visitTemplateTaskMap(id)
  }

  visitProjectOverview(matterId, projectId) {
    if (!matterId && !projectId) {
      matterId = this.fixture.matter.id
      projectId = this.fixture.projects[0].id
    }
    this.visitHelpers.visitProjectOverview(matterId, projectId)
  }

  visitMatterOverview(matterId) {
    this.visitHelpers.visitMatterOverview(matterId)
  }

  visitTemplateOverview(id) {
    this.visitHelpers.visitTemplateOverview(id)
  }

  visitProjectTimeLine(projectIndex = 0, useWaits = true) {
    this.visitHelpers.visitProjectTimeLine(
      this.fixture.matter.id,
      this.fixture.projects[projectIndex].id,
      useWaits
    )
  }

  visitTaskTimeLine(projectIndex = 0, taskId, mobile = false) {
    this.visitHelpers.visitTaskTimeLine(
      this.fixture.matter.id,
      this.fixture.projects[projectIndex].id,
      taskId,
      mobile
    )
  }

  visitHome(wait = true) {
    this.visitHelpers.visitHome(wait)
  }

  visitHomeViaNavigation() {
    this.visitHelpers.visitHomeViaNavigation()
  }

  visitOrgUsers() {
    this.visitHelpers.visitOrgUsers()
  }
}

export function getFixtureWrapper(fixture) {
  return new Wrapper(fixture)
}
