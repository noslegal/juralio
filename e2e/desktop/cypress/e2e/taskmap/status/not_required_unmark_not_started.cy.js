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

describe('not_required_unmark_not_started.cy', () => {
  let user
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
            // P1
            {
              tasks: [
                {
                  name: 'task1',
                  properties: { status: 'task-not-required' },
                  tasks: [
                    {
                      name: 'task2',
                      properties: { status: 'task-not-required' },
                      tasks: [],
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
                  properties: { status: 'task-not-required' },
                  tasks: [
                    {
                      name: 'task2',
                      properties: { status: 'task-not-required' },
                      tasks: [
                        {
                          name: 'task3',
                          properties: { status: 'task-not-required' },
                          tasks: [
                            {
                              name: 'task4',
                              properties: { status: 'task-not-required' },
                              tasks: [],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            // P3
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
            // P4
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
            // P5
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
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when changing a NR task (with NS parent + no subtasks) to NS', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()
      showNotRequiredTasks()
      // cy.get('body').click()
    })

    it('should have 2 task cells in total', () => {
      cy.get('[data-test=structureItem]').should('have.length', 2)
    })

    describe('When setting the NR task to Not Started', () => {
      before(() => {
        cy.backendRoute('/matter/*/workstreams/*?includeTaskTeam=true').as(
          'checkConsistency'
        )
        taskCellMenu.taskCellDropDownArrow().eq(1).click()
        taskCellMenu.notStarted().click()
        cy.wait('@checkConsistency')
      })
      // it('the two tasks should have Not Started status', () => {
      //   cy.get('[data-test="cell"][parent="P1"] [data-test="task-cell-test"]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.notStarted)
      //   cy.get('[data-test="cell"][parent="JUR1"] [data-test="task-cell-test"]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.notStarted)
      // })
    })
  })

  describe('when changing a NR task (with NR parent) to NS', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap(1)
      cy.wait(5000)
      showNotRequiredTasks()
      // cy.get('body').click()
    })

    it('should have 2 task cells in total', () => {
      cy.get('[data-test=structureItem]').should('have.length', 2)
    })

    describe('When setting the NR task to Not Started', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(1).click()
        taskCellMenu.notStarted().click()
        cy.get('[data-test=action-dialog-button]', { timeout: 30000 }).click()
      })
      // it('the two tasks should have Not Started status', () => {
      //   cy.get('[data-test="cell"][parent="P2"] [data-test="task-cell-test"]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.notStarted)
      //   cy.get('[data-test="cell"][parent="JUR3"] [data-test="task-cell-test"]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.notStarted)
      // })
    })
  })

  describe('when changing a NR task (with NR parent and NR subtask) to NS', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap(2)
      showNotRequiredTasks()
      // cy.get('body').click()
    })

    it('should have 4 task cells in total', () => {
      cy.get('[data-test=structureItem]').should('have.length', 4)
    })

    describe('When setting the NR task to Not Started', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(1).click()
        taskCellMenu.notStarted().click()
        cy.get('[data-test=action-dialog-button]', { timeout: 30000 }).click()
      })
      // it('the four tasks should have Not Started status', () => {
      //   cy.get('[data-test="cell"][parent="P3"] [data-test="task-cell-test"]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.notStarted)
      //   cy.get('[data-test="cell"][parent="JUR5"] [data-test="task-cell-test"]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.notStarted)
      //   cy.get('[data-test="cell"][parent="JUR6"] [data-test="task-cell-test"]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.notStarted)
      //   cy.get('[data-test="cell"][parent="JUR7"] [data-test="task-cell-test"]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.notStarted)
      // })
    })
  })

  describe('when changing a NR task (with IP parent + no subtasks) to NS', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap(3)
      showNotRequiredTasks()
      // cy.get('body').click()
    })

    it('should have 2 task cells in total', () => {
      cy.get('[data-test=structureItem]').should('have.length', 2)
    })

    describe('When setting the NR task to Not Started', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(1).click()
        taskCellMenu.notStarted().click()
      })
      // it('the two tasks should have In Progress and a Not Started status', () => {
      //   cy.get('[data-test="cell"][parent="P4"] [data-test="task-cell-test"]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.inProgress)
      //   cy.get('[data-test="cell"][parent="JUR9"] [data-test="task-cell-test"]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.notStarted)
      // })
    })
  })

  describe('when changing a NR task (with Done parent + no subtasks) to NS', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap(4)
      cy.get('.reactour__close').click()

      showNotRequiredTasks()
      cy.get('[data-test=minimised-filters]').click({ force: true })
      showDoneTasks()
      // cy.get('body').click()
    })

    it('should have 2 task cells in total', () => {
      cy.get('[data-test=structureItem]').should('have.length', 2)
    })

    describe('When setting the NR task to Not Started', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(1).click()
        taskCellMenu.notStarted().click()
        cy.get('[data-test=action-dialog-button]', { timeout: 30000 }).click()
      })

      snackbarHelper.checkShownAndHasExpectedText(
        "Updated parent task to 'In progress'"
      )

      // it('the two tasks should have In Progress and a Not Started status', () => {
      //   cy.get('[data-test="cell"][parent="P5"] [data-test="task-cell-test"]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.inProgress)
      //   cy.get(
      //     '[data-test="cell"][parent="JUR11"] [data-test="task-cell-test"]'
      //   )
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.notStarted)
      // })
    })
  })

  describe('when changing a NR task (with in progress parent + no subtasks) to NS', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap(5)
      showNotRequiredTasks()
      // cy.get('body').click()
    })

    it('should have 2 task cells in total', () => {
      cy.get('[data-test=structureItem]').should('have.length', 2)
    })

    describe('When setting the NR task to Not Started', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(1).click()
        taskCellMenu.notStarted().click()
        // cy.get('body').click()
      })
      // it('the two tasks should have In Progress and a Not Started status', () => {
      //   cy.get('[data-test="cell"][parent="P6"] [data-test="task-cell-test"]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.inProgress)
      //   cy.get(
      //     '[data-test="cell"][parent="JUR13"] [data-test="task-cell-test"]'
      //   )
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.notStarted)
      // })
    })
  })
})
