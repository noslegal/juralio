import { getProjectWithMultiFLevelData } from '../../../../../../helpers/data/task_operations_test_project_data'
import destinationHelper from '../../../../../../helpers/destinationdialog/destination-dialog-helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import snackbarHelper from '../../../../../../helpers/snackbar/snackbar-helper'
import { createTaskFromFabInContext } from '../../../../../../helpers/tasks/task_create_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../../../page/destinationdialog/destinationdialog_page'
import textWithDestinationDialog from '../../../../../../page/textwithdestinationdialog/textwithdestinationdialog_page'

describe('context_create_task_level_f_validation.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'testmattertaskcreate',
          teamMembers: [user],
          matterAdmins: [user],
          projects: getProjectWithMultiFLevelData(),
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when in creating a Subtask', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('subtask11 F')
      destinationHelper.openTaskCreateFlowFromFab()
    })

    snackbarHelper.checkShownAndHasExpectedText(
      'Level F tasks cannot have subtasks.'
    )

    describe('when in dialog creating a Subtask', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('subtask9 D')
        createTaskFromFabInContext('', true)
      })

      it('The field is shown correctly', () => {
        textWithDestinationDialog.get
          .destinationDescriptionField()
          .should('have.text', 'As a subtask of subtask9 D #7')
      })

      it('The edit link is hidden', () => {
        textWithDestinationDialog.get.editLink().should('not.be.visible')
      })

      describe('When a name is entered', () => {
        before(() => {
          cy.get('[data-test=text-prompt-text-field]')
            .find('input')
            .type('Buy Costumes')
        })

        it('The edit link is enabled', () => {
          textWithDestinationDialog.get
            .editLink()
            .should(
              'have.css',
              'color',
              textWithDestinationDialog.colours.enabled
            )
        })

        describe('When the edit link is clicked', () => {
          before(() => {
            textWithDestinationDialog.get.editLink().click()
          })
          it('The destination dialog is shown', () => {
            destinationPage.get.parentTypeSelector().should('be.visible')
          })
        })
      })
    })

    describe('When a name is entered and Next pressed', () => {
      before(() => {
        cy.login(user.username)

        appPage.visitTaskByName('subtask9 D')
        createTaskFromFabInContext('This is a new Task', true, true)
      })

      describe('changing the task destination', () => {
        before(() => {
          cy.backendRoute('/matter/*/workstreams/*/tasks').as('getTasks')

          cy.wait(1000)
          destinationPage.get.parentTypeSelector().click()
          destinationPage.get.parentTypeSubTaskOf().click()

          destinationPage.get.taskSelector().find('Input').clear()

          cy.wait('@getTasks')

          destinationPage.get.taskListItem(1).click()
        })

        it('Create button should be enabled', () => {
          destinationPage.get.createButton().should('not.have.attr', 'disabled')
        })
      })
    })
  })
})
