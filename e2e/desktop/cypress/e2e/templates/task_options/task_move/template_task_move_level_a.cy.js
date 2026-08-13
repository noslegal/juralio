import { getProjectAtoCLevelData } from '../../../../../../helpers/data/task_operations_test_project_data'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import snackbarHelper from '../../../../../../helpers/snackbar/snackbar-helper'
import {
  checkTaskMapLevelAndDepthCounts,
  clickTaskCellForTaskWithName,
} from '../../../../../../helpers/taskmap/task-map-helper'
import { openTemplateTaskMove } from '../../../../../../helpers/tasks/task_operations_helpers'
import { createTemplate } from '../../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../page/taskdetail/taskdetail_page'

describe('template_task_move_level_a.cy', () => {
  let user, appPage, fixture
  let { moveDialog } = taskDetailPage

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskMoveTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: getProjectAtoCLevelData(),
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When moving tasks within a template', () => {
    let templateId
    before(() => {
      cy.login(user.username)
      createTemplate('New Template', fixture.projects[0].id).then(template => {
        templateId = template.id
      })
    })

    describe('When the taskmap is initially rendered', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTemplateTaskMap(templateId)
      })

      checkTaskMapLevelAndDepthCounts([
        { depth: 1, expectedCount: 2 },
        { depth: 2, expectedCount: 6 },
      ])

      describe('when the move menu item is clicked', () => {
        before(() => {
          cy.login(user.username)
          clickTaskCellForTaskWithName('subtask2')
          openTemplateTaskMove()
        })

        it('should display the move task dialog', () => {
          moveDialog.get.dialogTitle().should('be.visible')
        })

        it('has a drop down select', () => {
          moveDialog.get.destinationSelectionDropdown().should('be.visible')
        })

        describe('When the destination drop down is clicked', () => {
          before(() => {
            moveDialog.get.destinationSelectionDropdown().click()
          })

          it('has a drop down select menu - first item is "Select destination"', () => {
            moveDialog.get
              .destinationPrompt()
              .should('have.text', 'Select destination')
          })

          it('has a dropdown select menu - second item is "level A"', () => {
            moveDialog.get.destinationOption
              .levelA()
              .should('contain.text', 'As a new phase')
          })
        })

        describe('when the Cancel button is clicked', () => {
          before(() => {
            moveDialog.get.cancelButton().click({ force: true })
          })

          it('should NOT display the Move task dialog', () => {
            moveDialog.get.dialogTitle().should('not.exist')
          })
        })

        describe('when the Move button is clicked with nothing selected', () => {
          before(() => {
            openTemplateTaskMove()
            moveDialog.get.moveButton().click({ force: true })
          })

          it('should display the validation message', () => {
            moveDialog.get.validationMessage().should('be.visible')
          })

          it('should have a validation message of - "This field is required', () => {
            moveDialog.get
              .validationMessage()
              .should('have.text', 'This field is required')
          })

          describe('When a valid selection is made in the dropdown', () => {
            before(() => {
              moveDialog.get.destinationSelectionDropdown().click()
              moveDialog.get.destinationOption.levelA().click()
            })

            it('should not render the validation message', () => {
              moveDialog.get.validationMessage().should('not.exist')
            })
          })
        })

        describe('when the Move button is clicked with a valid selection', () => {
          before(() => {
            moveDialog.get.destinationSelectionDropdown().click()
            moveDialog.get.destinationOption.levelA().click()
            cy.backendRoute('POST', '/projecttemplates/*/tasks/*/move').as(
              'templateTaskMove'
            )
            moveDialog.get.moveButton().click()
            cy.wait('@templateTaskMove')
          })

          it('should close the Move dialog', () => {
            moveDialog.get.dialogTitle().should('not.exist')
          })

          snackbarHelper.checkShownAndHasExpectedText(
            'Template task has been moved.'
          )

          it('should redirect to the task map', () => {
            cy.url().should('contain', `template/${templateId}/taskmap`)
          })
        })
      })
    })
    describe('the task should have moved', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTemplateTaskMap(templateId)
      })

      checkTaskMapLevelAndDepthCounts([
        { depth: 1, expectedCount: 3 },
        { depth: 2, expectedCount: 5 },
      ])

      describe('the moved task on level A', () => {
        before(() => {
          cy.login(user.username)
          clickTaskCellForTaskWithName('subtask2')
        })

        it('should display a task name of -"subtask2"', () => {
          taskDetailPage.get.taskDetailName().should('have.text', 'subtask2')
        })

        it('should display a task level of - "A"', () => {
          taskDetailPage.get.jurNumber().should('contain', 'A')
        })
      })
    })
  })
})
