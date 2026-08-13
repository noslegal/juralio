import nameGenerator from 'project-name-generator'
import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'

const newTemplateName = nameGenerator.generate().spaced
const { moveDialog } = taskDetailPage

describe('template_subtask_create_then_move.cy', () => {
  let user, fixture, newTemplate, appPage, visitHelpers

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskCardTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Test Project',
              tasks: [
                { name: 'Transfer Documents' },
                {
                  name: 'Print Documents',
                  tasks: [{ name: 'Shred' }],
                },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
      visitHelpers = new VisitHelpers()
    })
  })

  before(() => {
    cy.login(user.username)

    createTemplate(newTemplateName, fixture.projects[0].id).then(template => {
      newTemplate = template

      appPage.visitTemplates()
      cy.backendRoute('/projecttemplates/*/tasks*').as('getTemplateTasks')
      cy.get(
        `[data-recordid=${newTemplate.id}] [data-test=template-name]`
      ).click()
      cy.get('[data-test=taskmap-navigation]').click()
      cy.wait('@getTemplateTasks')

      cy.backendRoute('/projecttemplates/*/tasks/*').as('getTemplateTask')
      cy.backendRoute('/projecttemplates/*/tasks/*/posts').as(
        'getTemplateTaskPosts'
      )
      cy.get('[data-task-name]')
        .contains('Print Documents')
        .click('center', { force: true })
      cy.wait(['@getTemplateTask', '@getTemplateTaskPosts'])
    })
  })

  describe('When creating the first task', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTemplateTaskDetails(
        newTemplate.id,
        newTemplate.tasks[0].id
      )
      taskDetailPage.get.subtaskAddButton().click()
      cy.backendRoute('POST', '/projecttemplates/*/tasks').as(
        'postTemplateTask'
      )
      cy.backendRoute('GET', '/projecttemplates/*').as('getTemplate')
      cy.get('[data-test=edit-name-field]').find('input').type('Tomato{enter}')
      cy.wait('@postTemplateTask')
      cy.wait('@getTemplate')
      cy.get('[data-test=edit-name-field]').find('input').type('{esc}')
    })
    describe('When clicking on the move operation', () => {
      before(() => {
        cy.get('[data-test=options-dropdown]').eq(0).click()
        cy.get('[data-test=menu-text-move]').click()
      })

      it('Should open the move dialog', () => {
        cy.get('[data-test=dialog-header-title-text]').should(
          'contain',
          'Move task:'
        )
        cy.get('[data-test=dialog-header-title-text]').should(
          'contain',
          'Tomato'
        )
      })

      describe('When clicking on the move operation', () => {
        before(() => {
          moveDialog.get.destinationSelectionDropdown().click()
          moveDialog.get.destinationOption.newTask().click()
        })

        it('has a destination subtask field', () => {
          moveDialog.get
            .destinationTextField()
            .should('have.attr', 'placeholder', 'Choose a template task')
        })
      })
    })
  })
})
