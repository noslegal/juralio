import { generateFixture } from '../../../../../../helpers/matterprojects/fixture_helper'
import { createTaskFromFab } from '../../../../../../helpers/tasks/task_create_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../../../page/destinationdialog/destinationdialog_page'

describe('out_of_context_create_task.cy', () => {
  let user

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'CreateTaskNoteSpec',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'CreateTaskNote',
              tasks: [{ name: 'Task For Creating Notes' }],
            },
          ],
        },
      }

      generateFixture(seed)
    })
  })

  describe('When user click the global fab button and choose create Level A task', () => {
    before(() => {
      cy.login(user.username)
      cy.visit('/#/home')

      createTaskFromFab('This is a new Task', true)

      destinationPage.get.matterSelectorItem().click()

      destinationPage.get.parentTypeSelector().click()
      destinationPage.get.parentTypeLevelA().click()

      cy.backendRoute('POST', '/matter/*/workstreams/*/tasks**').as(
        'postNewTask'
      )
      destinationPage.get.createButton().click()
      cy.wait('@postNewTask')
    })

    it('should display a snackbar', () => {
      cy.get('[data-test=snackbar-message]', { timeout: 30000 }).should(
        'be.visible'
      )
    })

    it('should remain on the home page', () => {
      cy.url().should('contains', '/home')
    })
  })

  describe('When user click the global fab button and choose create subtask', () => {
    before(() => {
      cy.login(user.username)
      cy.visit('/#/home')

      createTaskFromFab('This is a new subtask', true)

      destinationPage.get.matterSelectorItem().click()

      destinationPage.get.parentTypeSelector().click()
      destinationPage.get.parentTypeSubTaskOf().click()

      destinationPage.get.taskSelectorInput().type('n')
      destinationPage.get.taskListItem(0).click()

      destinationPage.get.createButton().click()
      cy.wait(1000)
    })

    it('should display a snackbar', () => {
      cy.get('[data-test=snackbar-message]', { timeout: 30000 }).should(
        'be.visible'
      )
    })

    it('should remain on the home page', () => {
      cy.url().should('contains', '/home')
    })
  })
})
