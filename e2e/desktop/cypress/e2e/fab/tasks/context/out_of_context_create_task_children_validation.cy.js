import { getProjectWithParentTaskWith8Subtasks } from '../../../../../../helpers/data/task_operations_test_project_data'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createTaskFromFab } from '../../../../../../helpers/tasks/task_create_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../../../page/destinationdialog/destinationdialog_page'

describe('out_of_context_create_task_children_validation.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'testmattertaskcreate',
          teamMembers: [user],
          matterAdmins: [user],
          projects: getProjectWithParentTaskWith8Subtasks(),
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when creating a Task out of context', () => {
    before(() => {
      cy.login(user.username)
      cy.visit('/#/home')

      createTaskFromFab('This is a new Task', true)
    })

    it('should have a matter select component', () => {
      destinationPage.get.matterSelector().should('be.visible')
    })

    describe('the destingation dialog should be filled out', () => {
      before(() => {
        cy.backendRoute('/matter/*/workstreams?*').as('getProjects')
        destinationPage.get.matterSelectorItem().click()

        destinationPage.get.parentTypeSelector().click()
        destinationPage.get.parentTypeSubTaskOf().click()
        destinationPage.get.taskSelectorInput().type('task1')
        destinationPage.get.taskListItem(1).click()
      })

      describe('When a task that has 8 children is selected', () => {
        it('Context populated task select be in error state ', () => {
          destinationPage.get
            .taskSelector()
            .find('Input')
            .should('have.attr', 'aria-invalid', 'true')
        })

        it('Context populated task should display validation message', () => {
          destinationPage.get
            .taskSelector()
            .contains('Tasks cannot have more than 8 subtasks.')
        })

        it('Create button should be disabled', () => {
          destinationPage.get.createButton().should('have.attr', 'disabled')
        })

        describe('changing the task to a valid (<8 child tasks) task', () => {
          before(() => {
            destinationPage.get.taskSelector().find('Input').clear()
            destinationPage.get.taskListItem(1).click()
          })

          it('task select should have value of "B. subtask7 - #8"', () => {
            destinationPage.get
              .taskSelector()
              .find('Input')
              .should('have.attr', 'value', 'B. subtask7 - #8')
          })

          it('task selector should not be in error state', () => {
            destinationPage.get
              .taskSelector()
              .find('Input')
              .should('have.attr', 'aria-invalid', 'false')
          })

          it('Context populated task should NOT display validation message', () => {
            destinationPage.get
              .taskSelector()
              .should(
                'not.have.text',
                'Tasks cannot have more than 8 subtasks.'
              )
          })

          it('Create button should be enabled', () => {
            destinationPage.get
              .createButton()
              .should('not.have.attr', 'disabled')
          })
        })
      })
    })
  })
})
