import destinationHelper from '../../../../../../helpers/destinationdialog/destination-dialog-helper'
import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createTaskFromFabInContext } from '../../../../../../helpers/tasks/task_create_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../../../page/destinationdialog/destinationdialog_page'
import taskdetail_page from '../../../../../../page/taskdetail/taskdetail_page'
import textWithDestinationDialog from '../../../../../../page/textwithdestinationdialog/textwithdestinationdialog_page'

describe('create_task_flow_task_select.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'testmattertaskcreate',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Task Create From FAB Spec',
              tasks: [{ name: 'Task To have subtasks' }, { name: 'Here Goes' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when in a Task context and Create Task FAB button is clicked', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Task To have subtasks')
      destinationHelper.openTaskCreateFlowFromFab()
    })

    describe('When a name is entered and Edit pressed', () => {
      before(() => {
        cy.get('[data-test=text-prompt-text-field]')
          .find('input')
          .type('This is a new Task')
        textWithDestinationDialog.get.editLink().click()
      })

      it('should have the Matter selected in the dialog', () => {
        destinationPage.get
          .matterSelectorInput()
          .should(
            'have.value',
            fixture.matter.name + ' - ' + fixture.matter.matterId
          )
      })
    })
  })

  describe('When Task is created', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Task To have subtasks')
      createTaskFromFabInContext('This is a new Task')
    })

    it('continue to display the parent task details', () => {
      cy.get('[data-test=task-name]').should('contain', 'Task To have subtasks')
    })

    it('Not started heading should be visible', () => {
      cy.get('[data-test=not-started-tasks]').should('be.visible')
    })

    it('There is now a single not started subtask', () => {
      cy.get('[data-test=not-started-tasks]')
        .find('[data-test=task-cell-test]')
        .should('have.length', 1)
    })

    it('new SubTask is shown', () => {
      taskdetail_page.get
        .subTasks()
        .get('[data-test=name]')
        .eq(0)
        .should('have.text', 'This is a new Task')
    })

    describe('When a second Task is created', () => {
      before(() => {
        createTaskFromFabInContext('This is a another new Task')
      })

      it('Not started heading should be visible', () => {
        cy.get('[data-test=not-started-tasks]').should('be.visible')
      })

      it('There are now 2 subtasks', () => {
        cy.get('[data-test=not-started-tasks]')
          .find('[data-test=task-cell-test]')
          .should('have.length', 2)
      })

      it('The existing SubTask is shown at the top of the list', () => {
        taskdetail_page.get
          .notStartedSubTasks()
          .get('[data-test=name]')
          .eq(0)
          .should('have.text', 'This is a new Task')
      })

      it('The new SubTask is shown at the bottom of the list', () => {
        taskdetail_page.get
          .notStartedSubTasks()
          .get('[data-test=name]')
          .eq(1)
          .should('have.text', 'This is a another new Task')
      })
    })
  })
})
