import chaiColors from 'chai-colors'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { showNotRequiredTasks } from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskmapPage from '../../../../../page/taskmap/taskmap_page'

chai.use(chaiColors)

describe('status_change_reordering.cy', () => {
  const taskCellMenu = taskmapPage.operationMenu

  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskMapTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {
                  name: '1',
                },
                {
                  name: '2',
                },
                {
                  name: '3',
                },
                {
                  name: '4',
                },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  const getTaskCellForTask = name =>
    cy
      .get('[data-task-name]', { timeout: 30000 })
      .contains(new RegExp(`^${name}$`))
      .closest('[data-task-cell]')

  const openMenuForTask = name => {
    cy.wait(500)
    getTaskCellForTask(name)
      .find('[data-test=options-dropdown]')
      .click({ timeout: 10000 })
    taskCellMenu.menuItemsText().should('be.visible')
  }

  describe('when navigating to the task map', () => {
    const taskNames = ['Task without Subtask', 'Task with Subtask', 'Subtask']

    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()
    })

    describe('When changing the status to go backwards the task goes to front of previous group ', () => {
      before(() => {
        openMenuForTask('4')
        cy.backendRoute(
          'GET',
          `/matter/${fixture.matter.id}/workstreams/${fixture.projects[0].id}?includePosts=true&includeTaskTeam=true`
        ).as('updateTask')
        taskCellMenu.menuItemsText().eq(1).click({ timeout: 3000 })
        cy.wait('@updateTask')
      })

      it('is the correct colour for the status', () => {
        cy.wait(3000)
        cy.get('[data-task-name]', { timeout: 30000 }).eq(0).contains('4')
      })
    })

    describe('When changing the status to go forwards the task goes to back of next group ', () => {
      before(() => {})

      it('is the correct colour for the status', () => {
        openMenuForTask('4')
        taskCellMenu.menuItemsText().eq(1).click()
        cy.wait(3000)
        cy.get('[data-task-name]').eq(0).contains('4')
        openMenuForTask('2')
        taskCellMenu.menuItemsText().eq(1).click()
        cy.wait(1000)
        cy.get('[data-task-name]').eq(1).contains('2')
      })
    })

    describe('When changing the status to go to not-required the task goes to back of next group ', () => {
      before(() => {
        openMenuForTask('4')
        taskCellMenu.menuItemsText().eq(3).click()
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(1000)

        showNotRequiredTasks()
        // cy.get('body').click()
        cy.wait(1000)
      })

      it(
        'is the correct colour for the status',
        { retries: { runMode: 2, openMode: 1 } },
        () => {
          cy.wait(3000)
          cy.get('[data-task-name]').eq(3).contains('4')
        }
      )
    })
  })
})
