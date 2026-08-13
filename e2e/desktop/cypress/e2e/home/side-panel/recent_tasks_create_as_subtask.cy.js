import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import {
    createTaskFromFab,
    createTaskFromFabInContext
} from '../../../../../helpers/tasks/task_create_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../../page/destinationdialog/destinationdialog_page'

describe('recent_tasks_create_as_subtask.cy', () => {
  let user, appPage, fixture

  before(() => {
    createUser().then((createdUser) => {
      user = createdUser
      cy.login(user.username)
      const seed = {
        matter: {
          prefix: 'recent_tasks_for_newly_created',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Test Project',
              tasks: [{ name: 'Level A' }],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when creating a task as a subtask', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Level A')
      createTaskFromFabInContext('Level B')
    })

    describe('and go back to home page', () => {
      before(() => {
        cy.login(user.username)
        cy.visit('/#/home')
        cy.get('[data-test=home-recently-viewed-tab]').click()
      })

      it('should have 2 recent tasks', () => {
        cy.get('[data-test=juralio-chip-task]').should('have.length', 2)
      })

      it('the first one should be Level B', () => {
        cy.get('[data-test="juralio-chip-task"]')
          .eq(0)
          .should('have.text', 'Level B')
      })

      it('the second one should be Level A', () => {
        cy.get('[data-test="juralio-chip-task"]')
          .eq(1)
          .should('contain.text', 'Level A')
      })
    })

    describe('click FAB button and choose create task', () => {
      before(() => {
        cy.login(user.username)
        cy.visit('/#/home')
        cy.get('[data-test=home-recently-viewed-tab]').click()

        createTaskFromFab('This is a new Task', true)
      })

      it('should display the distination dialog', () => {
        destinationPage.get.matterSelector().should('be.visible')
      })

      describe('select matter project and task', () => {
        before(() => {
          destinationPage.get.matterSelectorItem().click()

          destinationPage.get.parentTypeSelector().click()
          destinationPage.get.parentTypeSubTaskOf().click()
          destinationPage.get.taskSelectorInput().type('Level A')
          destinationPage.get.taskListItem(0).click()
        })

        it('cancel the creation', () => {
          destinationPage.get.cancelButton().click()
        })
      })

      it('the last visited task should be Task B', () => {
        cy.get('[data-test="juralio-chip-task"]')
          .eq(0)
          .should('have.text', 'Level B')
      })
    })
  })
})
