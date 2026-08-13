import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { showNotRequiredTasks } from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskmapPage from '../../../../../page/taskmap/taskmap_page'

describe('not_required_unmark_with_child_nr_only.cy', () => {
  let user
  const taskCellMenu = taskmapPage.operationMenu

  before(() => {
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
                      tasks: [
                        {
                          name: 'task3',
                          properties: { status: 'task-not-required' },
                          tasks: [
                            {
                              name: 'task4',
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

    it('should have 4 task cells in total', () => {
      cy.get('[data-test=structureItem]').should('have.length', 4)
    })

    describe('When setting the NR task to Not Started', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(1).click()
        taskCellMenu.notStarted().click()
        cy.get('[data-test=action-dialog-button]').click()
      })
      // it('the two tasks should have Not Started status', () => {
      //   cy.get('[data-test="cell"][parent="P1"] [data-test="task-cell-test"]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.notStarted)
      //   cy.get('[data-test="cell"][parent="JUR1"] [data-test="task-cell-test"]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.notStarted)
      //   cy.get('[data-test="cell"][parent="JUR2"] [data-test="task-cell-test"]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.notStarted)
      //   cy.get('[data-test="cell"][parent="JUR3"] [data-test="task-cell-test"]')
      //     .should('have.css', 'background-color')
      //     .and('be.colored', taskStatusColors.notStarted)
      // })
    })
  })
})
