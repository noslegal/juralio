import 'cypress-file-upload'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

const GOOD_FIXTURE = 'template_import/good_template.json'

const attachPayload = payload =>
  cy.get('[data-test=json-import-file-input]').attachFile({
    fileContent: payload,
    fileName: 'template.json',
    mimeType: 'application/json',
    encoding: 'utf8',
  })

const enterNameAndSubmit = (name = 'Imported Test Template') => {
  cy.get('[data-test=json-import-rename-field]')
    .find('input')
    .clear()
    .type(name)
  cy.get('[data-test=action-dialog-button]').click()
}

const flatTaskListFromTree = taskTree => {
  const flatList = []
  if (!taskTree || !taskTree.tasks) return []
  taskTree.tasks.forEach(task => walk(task))
  return flatList

  function walk(task) {
    flatList.push(task)
    if (!task.tasks || task.tasks.length === 0) return
    task.tasks.forEach(task => walk(task))
  }
}

describe('template_json_import_success.cy', () => {
  let user

  before(() => {
    createKnowledgeManagerUser('import_success_spec').then(createdUser => {
      user = createdUser
    })
  })

  const openImportDialog = () => {
    cy.login(user.username)
    cy.visit('/#/templates')
    cy.get('[data-test=import-template-json-button]', {
      timeout: 20000,
    }).click()
  }

  const loadGood = () =>
    cy.fixture(GOOD_FIXTURE).then(p => JSON.parse(JSON.stringify(p)))

  describe('successful import', () => {
    const importedName = 'Imported Test Template'
    let importedTemplateId

    before(() => {
      openImportDialog()
      cy.backendRoute('POST', '/projecttemplates/import/json').as('importJson')
      loadGood().then(attachPayload)
      enterNameAndSubmit(importedName)
      cy.wait('@importJson').then(intercept => {
        expect(intercept.response.statusCode).to.eq(201)
        importedTemplateId = intercept.response.body.id
      })
    })

    it('should show the success snackbar', () => {
      cy.get('[data-test=snackbar-message]').should(
        'contain.text',
        'Template uploaded successfully'
      )
    })

    it('should navigate to the imported template overview', () => {
      cy.url().should('contain', `/template/${importedTemplateId}/overview`)
    })

    it('should display the user-entered template name (not the JSON name)', () => {
      cy.get('[data-test=bread1]').should('contain.text', importedName)
    })

    describe('when navigating to the template map', () => {
      before(() => {
        cy.login(user.username)
        cy.visit(`/#/template/${importedTemplateId}/taskmap`)
        cy.get('[data-test=loading-map-progress]').should('not.exist')
        cy.wait(1000)
      })

      it('should display all three top-level phases', () => {
        cy.get('[data-test=task-cell-test]').should('contain.text', 'Phase A')
        cy.get('[data-test=task-cell-test]').should('contain.text', 'Phase B')
        cy.get('[data-test=task-cell-test]').should('contain.text', 'Phase C')
      })

      it('should display subtasks under Phase A', () => {
        cy.get('[data-test=task-cell-test]').should('contain.text', 'Group 1')
        cy.get('[data-test=task-cell-test]').should('contain.text', 'Group 2')
      })

      it('should display nested subtasks under Group 1', () => {
        cy.get('[data-test=task-cell-test]').should('contain.text', 'Subtask 1')
        cy.get('[data-test=task-cell-test]').should('contain.text', 'Subtask 2')
        cy.get('[data-test=task-cell-test]').should(
          'contain.text',
          'A Deliverable'
        )
      })

      it('should display the milestone and plain task under Phase B', () => {
        cy.get('[data-test=task-cell-test]').should(
          'contain.text',
          'A Milestone'
        )
        cy.get('[data-test=task-cell-test]').should(
          'contain.text',
          'Plain Task'
        )
      })
    })

    describe('when inspecting the imported template data via API', () => {
      let apiTemplate, flatTasks

      before(() => {
        cy.login(user.username)
        cy.request({
          url: `${Cypress.env(
            'serverBaseUrl'
          )}/projecttemplates/${importedTemplateId}`,
          method: 'GET',
        }).then(response => {
          apiTemplate = response.body
          flatTasks = flatTaskListFromTree(response.body)
        })
      })

      it('should have the user-entered name', () => {
        expect(apiTemplate.name).to.eq(importedName)
      })

      it('should have 3 top-level phases', () => {
        const level1 = apiTemplate.tasks.filter(t => t.level === 1)
        expect(level1).to.have.length(3)
      })

      it('should preserve the milestone flag on A Milestone', () => {
        const milestone = flatTasks.find(t => t.name === 'A Milestone')
        expect(milestone).to.exist
        expect(milestone.isMilestone).to.eq(true)
      })

      it('should preserve the deliverable flag on A Deliverable', () => {
        const deliverable = flatTasks.find(t => t.name === 'A Deliverable')
        expect(deliverable).to.exist
        expect(deliverable.isDeliverable).to.eq(true)
      })

      it('should import all four posts on Phase A', () => {
        const phaseA = flatTasks.find(
          t => t.name === 'Phase A' && t.level === 1
        )
        expect(phaseA).to.exist

        cy.login(user.username)
        cy.request({
          url: `${Cypress.env(
            'serverBaseUrl'
          )}/projecttemplates/${importedTemplateId}/tasks/${phaseA.id}/posts`,
          method: 'GET',
        }).then(response => {
          const postNames = response.body.map(p => p.name)
          expect(postNames).to.include('Normal Note')
          expect(postNames).to.include('Web Link Post')
          expect(postNames).to.include('Document Link Post')
          expect(postNames).to.include('Meeting Post')
        })
      })

      it('should import the resource', () => {
        cy.login(user.username)
        cy.request({
          url: `${Cypress.env(
            'serverBaseUrl'
          )}/projecttemplates/${importedTemplateId}/resources`,
          method: 'GET',
        }).then(response => {
          const resourceNames = response.body.map(r => r.name)
          expect(resourceNames).to.include('A Resource')
        })
      })
    })
  })
})
