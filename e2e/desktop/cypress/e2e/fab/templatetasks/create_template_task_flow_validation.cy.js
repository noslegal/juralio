import { getProjectForValidation } from '../../../../../helpers/data/task_operations_test_project_data'
import destinationHelper from '../../../../../helpers/destinationdialog/destination-dialog-helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplateFromProject } from '../../../../../helpers/templates/template_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../../page/templatetaskdestinationdialog/templatetaskdestinationdialog_page'

describe('create_template_task_flow_validation.cy', () => {
  let user, fixture, appPage

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'validation matter ',
          teamMembers: [user],
          matterAdmins: [user],
          projects: getProjectForValidation('validationProject'),
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When trying to create a level A task on a project with 16 existing level a tasks', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTemplates()

      createTemplateFromProject('validation', 'validation', 'validationProject')
      cy.get('[data-test=status-tour-close-forever]').click()
      destinationHelper.openTemplateTaskCreateFlowFromFab()

      cy.get('[data-test=text-prompt-text-field]')
        .find('input')
        .type('This is a new Task for the template in this test')

      cy.get('[data-test=action-dialog-button]').click()
    })

    it('The task parent validation message is displayed', () => {
      destinationPage.get
        .parentTypeSelectValidationMessage()
        .should('not.exist')
    })

    it('The create action button should be disabled', () => {
      destinationPage.get.createButton().should('have.attr', 'disabled')
    })

    describe('When parent type selector is clicked', () => {
      before(() => {
        destinationPage.get.parentTypeSelector()
        destinationPage.get.parentTypeSelector().click()
      })

      it('should show the list without "level A"', () => {
        destinationPage.get.parentTypeSubTaskOf().should('exist')
        destinationPage.get.parentTypeLevelA().should('not.exist')
      })

      describe('When the parent task is changed to a valid parent type', () => {
        before(() => {
          destinationPage.get.parentTypeSubTaskOf().click()
          destinationPage.get.parentTypeSelector().click()
          destinationPage.get.parentTypeSubTaskOf().click()
        })

        it('Should clear the validation message', () => {
          destinationPage.get
            .parentTypeSelectValidationMessage()
            .should('not.exist')
        })

        it('The create action button should still be disabled', () => {
          destinationPage.get.createButton().should('have.attr', 'disabled')
        })
      })

      describe('When a user tried to add a 9th subtask to a sibling', () => {
        before(() => {
          cy.backendRoute('/projecttemplates/*/tasks/search?name=*').as(
            'getTemplateTasks'
          )
          destinationPage.get.taskSelectorInput().type('task2')
          cy.wait('@getTemplateTasks')
          cy.get('[data-test=task-search-item]').first().click()
        })

        it('The task subtask validation message is displayed', () => {
          destinationPage.get
            .taskSelector()
            .contains('Tasks cannot have more than 8 subtasks.')
        })

        it('The create action button should be disabled', () => {
          destinationPage.get.createButton().should('have.attr', 'disabled')
        })

        describe('When the subtask is changed to a valid subtask', () => {
          before(() => {
            destinationPage.get.taskSelector().find('Input').clear()
            cy.backendRoute('/projecttemplates/*/tasks/search?name=*').as(
              'getTemplateTasks'
            )
            destinationPage.get.taskSelectorInput().type('task3')
            cy.wait('@getTemplateTasks')
            cy.get('[data-test=task-search-item]').first().click()
          })

          it('Should clear the validation message', () => {
            destinationPage.get
              .taskSelector()
              .should(
                'not.have.text',
                'Tasks cannot have more than 8 subtasks.'
              )
          })

          it('The create action button should be enabled', () => {
            destinationPage.get
              .createButton()
              .should('not.have.attr', 'disabled')
          })
        })
      })
    })
  })
})
