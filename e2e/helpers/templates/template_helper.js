import templateSourceDialogPage from '../../page/templatesourcedialog/templatesourcedialog_page'
import destinationHelper from '../destinationdialog/destination-dialog-helper'
import snackbarHelper from '../snackbar/snackbar-helper'
import { clickIncludePosts } from './project_from_template_helper'
import {
  createTemplateTaskLink,
  createTemplateTaskNote,
} from './template_api_helper'

export function createTemplateFromProject(
  templateName,
  matterName,
  projectName
) {
  const project = projectName ? projectName : 'Project'
  destinationHelper.openTemplateCreateFlowFromFab()

  cy.backendRoute('/matters?excludeAdministrable=true').as('getMatters')
  cy.get('[data-test=create-from-existing-project]').click()
  cy.wait('@getMatters')

  cy.get('[data-test=new-template-name]')
    .should('be.visible')
    .find('input')
    .type(templateName)

  templateSourceDialogPage.get.matterSelector().click()

  cy.focused().type(matterName)

  cy.backendRoute('/matter/*/workstreams*').as('getProjects')
  templateSourceDialogPage.get
    .matterSelectorItem()
    .contains(matterName)
    .should('be.visible')
    .click({ force: true })
  cy.wait('@getProjects')

  cy.backendRoute('POST', '/projecttemplates*').as('postProjectTemplate')
  cy.get('[data-test=action-dialog-button]').click()
  cy.wait('@postProjectTemplate')

  cy.backendRoute('/projecttemplates/*/tasks').as('getTemplateTasks')
  snackbarHelper.clickActionButton()
  cy.wait('@getTemplateTasks')
}

export function checkTemplateTaskSnackBar() {
  snackbarHelper.checkShownAndHasExpectedText(
    'New template task successfully created',
    'open'
  )
}

export function populateTemplateWithPosts(template) {
  for (let i = 0; i < template.tasks.length; i++) {
    createTemplateTaskNote(
      template.id,
      template.tasks[i].id,
      'Test Post [' + i + ']',
      'This is sample text.'.repeat(i * i)
    )
    createTemplateTaskLink(
      template.id,
      template.tasks[i].id,
      'Test Post [' + i + ']',
      'This is sample text.'.repeat(i * i),
      'https://en.wikipedia.org/wiki/Squirrel',
      'Word document'
    )
  }
}

export function createProjectFromTemplateSingle(options, wait = true) {
  if (options.disablePosts) clickIncludePosts()
  if (options.disablePosts) {
    cy.get('[data-test=action-dialog-button]').click()
  }
  cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()
  cy.wait(1000)
  cy.get('[data-test=action-dialog-button]').click()
  cy.get('[data-test=new-stream]').click()
  cy.get('[data-test=action-dialog-button]').click()

  cy.backendRoute('POST', '/matter/*/workstreams?*').as('createProject')
  cy.get('[data-test=action-dialog-button]').click()
  if (wait) {
    cy.wait('@createProject')
  }
}

export function createProjectFromTemplateMulti(options) {
  if (options.disablePosts) clickIncludePosts()

  cy.get('[data-test=existing-project-radio]').click()
  cy.get('[data-test=matter-select-container]').click()
  cy.get('[data-test=matter-select-menu-item]').eq(0).click()

  cy.get('[data-test=destination-select]').click()
  cy.get('[data-test=new-stream]').click()
  cy.get('[data-test=new-name]').type(options.name)
  cy.get('[data-test=action-dialog-button]').click()
}
