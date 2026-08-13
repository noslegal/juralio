import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import snackbarHelper from '../../../../../helpers/snackbar/snackbar-helper'
import {
  showDoneTasks,
  showNotRequiredTasks,
} from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskmapPage from '../../../../../page/taskmap/taskmap_page'

describe('not_required_unmark_done.cy', () => {
  let user, appPage, fixture
  const taskCellMenu = taskmapPage.operationMenu

  before(() => {
    cy.window().then(win => {
      win.sessionStorage.clear()
    })
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'taskMapTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            // P0
            {
              tasks: [
                {
                  name: 'task1',
                  properties: { status: 'in-progress' },
                  tasks: [
                    {
                      name: 'task2',
                      properties: { status: 'task-not-required' },
                    },
                  ],
                },
              ],
            },
            // P1
            {
              tasks: [
                {
                  name: 'task1',
                  properties: { status: 'done' },
                  tasks: [
                    {
                      name: 'task2',
                      properties: { status: 'task-not-required' },
                    },
                  ],
                },
              ],
            },
            // P2
            {
              tasks: [
                {
                  name: 'task1',
                  properties: { status: 'not-started' },
                  tasks: [
                    {
                      name: 'task2',
                      properties: { status: 'task-not-required' },
                    },
                  ],
                },
              ],
            },
            // 3
            {
              tasks: [
                {
                  name: 'task1',
                  properties: { status: 'not-started' },
                  tasks: [
                    {
                      name: 'task2',
                      properties: { status: 'task-not-required' },
                      tasks: [
                        {
                          name: 'task3',
                          properties: { status: 'task-not-required' },
                        },
                      ],
                    },
                  ],
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

  describe('when changing a NR task (with IP parent + no subtasks) to Done', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()

      showNotRequiredTasks()
      // cy.get('body').click()
    })

    it('should have 2 task cells in total', () => {
      cy.get('[data-test=structureItem]').should('have.length', 2)
    })

    describe('when changing the NR task to Done', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(1).click()
        taskCellMenu.done().click()
        cy.get('.reactour__close', { timeout: 30000 }).click()

        showDoneTasks()
        // cy.get('body').click()
      })
      // it('the two tasks should have In progress and Done status', () => {
      //   cy.get('[data-test=cell][parent=P1] [data-test=task-cell-test]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.inProgress)
      //   cy.get('[data-test=cell][parent=JUR1] [data-test=task-cell-test]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.done)
      // })
    })
  })

  describe('when changing a NR task (with Done parent + no subtasks) to NS', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap(1)
      cy.get('[data-test="status-tour-close-forever"]').click()
      showNotRequiredTasks()
      cy.get('[data-test=minimised-filters]').click({ force: true })
      showDoneTasks()
      // cy.get('body').click()
    })

    it('should have 2 task cells in total', () => {
      cy.get('[data-test=structureItem]').should('have.length', 2)
    })

    describe('When setting the NR task to Done', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(1).click()
        taskCellMenu.done().click()
        cy.get('[data-test=action-dialog-button]', { timeout: 30000 }).click()
        // cy.get('body').click()
      })

      snackbarHelper.checkShownAndHasExpectedText(
        "Updated parent task to 'In progress'"
      )

      // it('the two tasks should have In progress and Done status', () => {
      //   cy.get('[data-test=cell][parent=P2] [data-test=task-cell-test]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.inProgress)
      //   cy.get('[data-test=cell][parent=JUR3] [data-test=task-cell-test]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.done)
      // })
    })
  })

  describe('when changing a NR task (with NS parent + no subtasks) to NS', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap(2)
      showNotRequiredTasks()
      // cy.get('body').click()
    })

    it('should have 2 task cells in total', () => {
      cy.get('[data-test=structureItem]').should('have.length', 2)
    })

    describe('When setting the NR task to Done', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(1).click()
        taskCellMenu.done().click()
        cy.get('[data-test=action-dialog-button]', { timeout: 30000 }).click()
        showDoneTasks()
        // cy.get('body').click()
      })

      // it('the two tasks should have In progress and Done status', () => {
      //   cy.get('[data-test=cell][parent=P3] [data-test=task-cell-test]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.inProgress)
      //   cy.get('[data-test=cell][parent=JUR5] [data-test=task-cell-test]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.done)
      // })
    })
  })

  describe('when changing a NR task (with NS parent + subtasks) to NS', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap(3)
      showNotRequiredTasks()
      // cy.get('body').click()
    })

    it('should have 4 task cells in total', () => {
      cy.get('[data-test=structureItem]').should('have.length', 3)
    })

    describe('When setting the NR task to Done', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(1).click()
        taskCellMenu.done().click()
        cy.get('[data-test=action-dialog-button]', { timeout: 30000 }).click()
        showDoneTasks()
        // cy.get('body').click()
      })

      // it('the two tasks should have In progress, done and done statuses', () => {
      //   cy.get('[data-test=cell][parent=P4] [data-test=task-cell-test]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.inProgress)
      //   cy.get('[data-test=cell][parent=JUR7] [data-test=task-cell-test]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.done)
      //   cy.get('[data-test=cell][parent=JUR8] [data-test=task-cell-test]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.done)
      // })
    })
  })
})
