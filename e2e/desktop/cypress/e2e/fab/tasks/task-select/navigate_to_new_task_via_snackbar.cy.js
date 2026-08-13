import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createTaskFromFabInContext } from '../../../../../../helpers/tasks/task_create_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../../../page/destinationdialog/destinationdialog_page'

describe('navigate_to_new_task_via_snackbar.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'testmattertaskcreateandnav',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Create & Nav From FAB Spec',
              tasks: [{ name: 'Task To have subtasks' }, { name: 'Here Goes' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When Task is created from task details screen as a subtask in context', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Task To have subtasks')

      createTaskFromFabInContext('This is a new Task')
    })

    it('The snack bar is NOT shown', () => {
      cy.get('[data-test=snackbar-message]').should('not.exist')
    })
  })

  describe('When Task is created from task details screen as a level A task in context', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Task To have subtasks')
      createTaskFromFabInContext('Monkeys', true, true)

      destinationPage.get.parentTypeSelector().click()
      destinationPage.get.parentTypeLevelA().click()

      cy.backendRoute('POST', '/matter/*/workstreams/*/tasks**').as(
        'postNewTask'
      )
      destinationPage.get.createButton().click()
      cy.wait('@postNewTask')
    })

    it('The snack bar is NOT shown', () => {
      cy.get('[data-test=snackbar-message]').should('not.exist')
    })
  })
})
