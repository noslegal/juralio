import destinationHelper from '../../../../../helpers/destinationdialog/destination-dialog-helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplateFromProject } from '../../../../../helpers/templates/template_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../../page/templatetaskdestinationdialog/templatetaskdestinationdialog_page'

describe(
  'create_template_task_destination_dialog_display.cy',
  { retries: { runMode: 3, openMode: 1 } },
  () => {
    let user, fixture, appPage

    before(() => {
      createKnowledgeManagerUser().then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'testmattertaskcreate',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'Task Create From FAB Spec',
                tasks: [{ name: 'Task To have subtasks' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
    })

    describe('when the Create template task FAB button is clicked', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTemplates()

        createTemplateFromProject(
          'A new Template for this test',
          'testmattertaskcreate',
          'Task Create From FAB Spec'
        )
      })

      describe('When a name is entered and Next pressed', () => {
        before(() => {
          destinationHelper.openTemplateTaskCreateFlowFromFab()
          cy.get('[data-test=text-prompt-text-field]')
            .find('input')
            .type('This is a new Task for the template in this test')
          cy.get('[data-test=action-dialog-button]').click()
        })

        it('should have the header text', () => {
          cy.get('[data-test=dialog-header-title-text]').should(
            'have.text',
            'Choose a destination for your new template task'
          )
        })

        describe('should have a template select component', () => {
          it('template select should be visible', () => {
            destinationPage.get.templateSelector()
            destinationPage.get.templateSelector().should('be.visible')
          })

          describe('when selecting a template', () => {
            before(() => {
              destinationPage.get.templateSelectorInput().click()
              destinationPage.get
                .templateSelectorInput()
                .clear()
                .type('A new Template for this test')
              cy.get('[data-test=task-item-name-0]').click()
            })

            it('should be visible', () => {
              destinationPage.get.templateSelector().should('be.visible')
            })
          })
        })

        describe('when the parent type selector is clicked', () => {
          before(() => {
            destinationPage.get.parentTypeSelector().click()
          })
          it('Has header "Choose a destination" ', () => {
            destinationPage.get
              .parentTypeHeader()
              .should('have.text', 'Choose a destination')
          })
          it('Has an option "level A" ', () => {
            destinationPage.get
              .parentTypeLevelA()
              .should('contain.text', 'As a new phase')
          })
          it('Has an option "subtask of ..." ', () => {
            destinationPage.get
              .parentTypeSubTaskOf()
              .should('contain.text', 'As a subtask')
          })

          describe('When "level A" is selected', () => {
            before(() => {
              cy.get('[data-test="status-tour-close-forever"]').click()
              destinationPage.get.parentTypeLevelA().click()
            })

            it('The task selector is not displayed', () => {
              destinationPage.get.taskSelector().should('not.exist')
            })

            it('Has the level A task option selected ', () => {
              destinationPage.get.parentTypeLevelA().should('exist') // Loosen this due to flakey test runs.
            })
          })

          describe('When "subtask of" is selected', () => {
            before(() => {
              destinationPage.get.parentTypeSelector().click()
              destinationPage.get.parentTypeSubTaskOf().click()
            })
            it('Has the "Sub task of" option selected', () => {
              destinationPage.get
                .parentTypeSelector()
                .should('contain.text', 'As a subtask')
            })
            it('The task selector is displayed', () => {
              destinationPage.get.taskSelector().should('be.visible')
            })
          })

          describe('When "level A task" is re-selected', () => {
            before(() => {
              destinationPage.get.parentTypeSelector().click()
              destinationPage.get.parentTypeLevelA().click()
            })
            it('The task selector is no longer displayed', () => {
              destinationPage.get.taskSelector().should('not.exist')
            })

            it('Has the level A option selected', () => {
              destinationPage.get
                .parentTypeSelector()
                .should('contain.text', 'As a new phase')
            })
          })
        })
      })
    })
  }
)
