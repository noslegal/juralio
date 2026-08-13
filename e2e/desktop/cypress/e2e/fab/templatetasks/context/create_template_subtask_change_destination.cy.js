import destinationHelper from '../../../../../../helpers/destinationdialog/destination-dialog-helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createTemplateFromProject } from '../../../../../../helpers/templates/template_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../../../page/templatetaskdestinationdialog/templatetaskdestinationdialog_page'
import textWithDestinationDialog from '../../../../../../page/textwithdestinationdialog/textwithdestinationdialog_page'

describe(
  'create_template_subtask_change_destination.cy',
  { retries: { runMode: 3, openMode: 1 } },
  () => {
    let user, fixture, appPage

    before(() => {
      createKnowledgeManagerUser().then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'templatetaskcreate',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'Template For Subtask',
                tasks: [
                  { name: 'A subtask' },
                  { name: 'Task to have subtasks' },
                ],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
    })

    describe('when in a Template Task details context', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTemplates()

        createTemplateFromProject(
          'template subtask destination change',
          'templatetaskcreate',
          'Template For Subtask'
        )
        cy.backendRoute('/projecttemplates/*/tasks/*').as('getTask')
        cy.get('[data-test="status-tour-close-forever"]').click()

        cy.get('[data-test=task-cell-test]').eq(0).click({ force: true })
        cy.wait('@getTask')
        cy.wait(2000)
      })

      describe('When create template task flow initiated,a name is entered and create pressed', () => {
        before(() => {
          destinationHelper.openTemplateTaskCreateFlowFromFab()

          cy.get('[data-test=text-prompt-text-field]', { timeout: 10000 })
            .find('input')
            .type('Monkey')

          cy.backendRoute('GET', '/projecttemplates/*/tasks/*').as('getTask')
          textWithDestinationDialog.get.editLink().click()
          cy.wait('@getTask')

          destinationPage.get.taskSelector().should('be.visible')
          destinationPage.get.taskSelectorInput().click()

          destinationPage.get.taskSelector().find('Input').clear()

          destinationPage.get.taskSelectorInput().click()
          cy.wait(1000)
          cy.backendRoute('/projecttemplates/*/tasks/search?name=**').as(
            'searchTasks'
          )
          destinationPage.get
            .taskSelector()
            .find('Input')
            .type('Task to have subtasks')
          cy.wait(1000)
          cy.wait('@searchTasks')
          cy.wait(1000) // Flakey test.
          cy.get('[data-test=task-item-name-0]').click()
          cy.wait(1000)
          cy.wait('@getTask')
          cy.backendRoute('POST', '/projecttemplates/*/tasks').as('postTask')
          cy.get('[data-test=action-dialog-button]').click()
          cy.wait(1000)
          cy.wait('@postTask')
          cy.wait(1000)
          cy.backendRoute('/projecttemplates/*').as('getTemplate')
          cy.backendRoute('/projecttemplates/*/tasks/*/posts').as(
            'getTemplateTaskPosts'
          )
          cy.get('[data-test=snackbar-redirect-action-button]').click()
          cy.wait(1000)
          cy.wait(['@getTask', '@getTemplate'])
          cy.wait(1000)
          cy.wait('@getTemplateTaskPosts')
          cy.wait(2000)
        })

        it('new SubTask is shown', () => {
          cy.get('[data-test=task-name]').should('have.text', 'Monkey')
        })

        it('should display A as the first level letter', () => {
          cy.get('[data-test=task-level-letter]').eq(0).should('have.text', 'A')
        })

        describe('When navigating to the parent task', () => {
          before(() => {
            cy.backendRoute('GET', '/projecttemplates/*/tasks/*').as('getTask')
            cy.get('[data-test=task-level-letter]').eq(0).click()
            cy.wait('@getTask')
          })

          it('new SubTask is shown', () => {
            cy.get('[data-test=task-name]', { timeout: 8000 }).should(
              'have.text',
              'Task to have subtasks'
            )
          })
        })
      })
    })
  }
)
