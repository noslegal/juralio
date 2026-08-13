import chaiColors from 'chai-colors'
import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { showDoneTasks } from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskmapPage from '../../../../../page/taskmap/taskmap_page'

chai.use(chaiColors)

describe(
  'task_map_menu_status.cy',
  { retries: { runMode: 3, openMode: 1 } },
  () => {
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
                    name: 'Task without Subtask',
                  },
                  {
                    name: 'Task with Subtask',
                    tasks: [
                      // Need subtask to validate flow when status change has knock-ons
                      { name: 'Subtask' },
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

    const getTaskCellForTask = name =>
      cy
        .get('[data-task-name]')
        .contains(new RegExp(`^${name}$`))
        .closest('[data-task-cell]')

    const openMenuForTask = name => {
      cy.wait(2000)

      getTaskCellForTask(name)
        .find('[data-test=options-dropdown]')
        .click({ timeout: 10000, force: true })
      getTaskCellForTask(name)
        .find('[data-test=options-dropdown]')
        .click({ timeout: 10000, force: true })
      taskCellMenu.menuItemsText().should('be.visible')
    }

    describe('when navigating to the task map', () => {
      before(() => {
        cy.login(user.username)

        appPage.visitTaskMap()
      })

      describe('and change task status WITHOUT consistency confirmation', () => {
        const taskName = 'Task without Subtask'

        describe(`and clicking the menu dropdown icon for ${taskName}`, () => {
          before(() => {
            openMenuForTask(taskName)
          })

          it('should show the status change options', () => {
            taskCellMenu.menuItemsText().should('have.length', 4)
            taskCellMenu.menuItemsText().eq(0).contains('Not started')
            taskCellMenu.menuItemsText().eq(1).contains('Set to in progress')
            taskCellMenu.menuItemsText().eq(2).contains('Set to done')
            taskCellMenu.menuItemsText().eq(3).contains('Set to not required')
          })

          describe('and changing the status of a task to in progress', () => {
            before(() => {
              taskCellMenu.menuItemsText().eq(1).click()
              cy.wait(5000)
              cy.login(user.username)
              cy.reload()

              openMenuForTask(taskName)
              cy.wait(2000)
            })

            it('should show the task is now in progress', () => {
              taskCellMenu.menuItemsText().eq(0).contains('Set to not started')
              taskCellMenu.menuItemsText().eq(1).contains('In progress')
              taskCellMenu.menuItemsText().eq(2).contains('Set to done')
            })

            it('is the correct colour for the status', () => {
              getTaskCellForTask(taskName)
                .should('have.css', 'background-color')
                .and('be.colored', '#f4e1ba')
            })
          })

          describe('and changing the status of a task to done', () => {
            before(() => {
              taskCellMenu.menuItemsText().eq(2).click()
              cy.wait(5000)
              cy.login(user.username)
              cy.reload()
              showDoneTasks()

              // cy.get('body').click()
              openMenuForTask(taskName)
            })

            it(
              'should show the task is now done',
              {
                retries: {
                  runMode: 2,
                  openMode: 2,
                },
              },
              () => {
                taskCellMenu
                  .menuItemsText()
                  .eq(0)
                  .contains('Set to not started')
                taskCellMenu
                  .menuItemsText()
                  .eq(1)
                  .contains('Set to in progress')
                taskCellMenu.menuItemsText().eq(2).contains('Done')
              }
            )

            it('is the correct colour for the status', () => {
              getTaskCellForTask(taskName)
                .should('have.css', 'background-color')
                .and('be.colored', '#d1e5e6')
            })
          })

          describe('and changing the status of a task to not started', () => {
            before(() => {
              taskCellMenu.menuItemsText().eq(0).click()
              cy.wait(5000)
              cy.login(user.username)
              cy.reload()
              openMenuForTask(taskName)
            })

            it('should show the task is now done', () => {
              taskCellMenu.menuItemsText().eq(0).contains('Not started')
              taskCellMenu.menuItemsText().eq(1).contains('Set to in progress')
              taskCellMenu.menuItemsText().eq(2).contains('Set to done')
            })

            it('is the correct colour for the status', () => {
              getTaskCellForTask(taskName)
                .should('have.css', 'background-color')
                .and('be.colored', '#fcfbe8')
              taskCellMenu.menuItemsText().eq(0).click()
            })
          })
        })
      })

      describe('and change task status WITH consistency confirmation', () => {
        const taskName = 'Task with Subtask'

        describe(`and clicking the menu dropdown icon for ${taskName}`, () => {
          before(() => {
            openMenuForTask(taskName)
          })

          it('should show the status change options', () => {
            taskCellMenu.menuItemsText().should('have.length', 4)
            taskCellMenu.menuItemsText().eq(0).contains('Not started')
            taskCellMenu.menuItemsText().eq(1).contains('Set to in progress')
            taskCellMenu.menuItemsText().eq(2).contains('Set to done')
            taskCellMenu.menuItemsText().eq(3).contains('Set to not required')
          })

          describe('and changing the status of a task to in progress', () => {
            before(() => {
              taskCellMenu.menuItemsText().eq(1).click()
              cy.wait(5000)
              cy.login(user.username)
              cy.reload()

              openMenuForTask(taskName)
            })

            it('should show the task is now in progress', () => {
              cy.wait(5000)
              taskCellMenu.menuItemsText().eq(0).contains('Set to not started')
              taskCellMenu.menuItemsText().eq(1).contains('In progress')
              taskCellMenu.menuItemsText().eq(2).contains('Set to done')
            })

            it('is the correct colour for the status', () => {
              getTaskCellForTask(taskName)
                .should('have.css', 'background-color')
                .and('be.colored', '#f4e1ba')
            })
          })

          describe('and changing the status of a task to done', () => {
            before(() => {
              taskCellMenu.menuItemsText().eq(2).click()
            })

            it('should display the consistency dialog', () => {
              cy.get('[data-test=dialog-header-title-text]').should(
                'have.text',
                `Status changes: ${taskName}`
              )
            })

            describe('and confirm the consistency change', () => {
              before(() => {
                cy.get('[data-test=action-dialog-button]').click()
                cy.wait(5000)
                cy.login(user.username)
                cy.reload()
                showDoneTasks()

                // cy.get('body').click()
                openMenuForTask(taskName)
              })

              it('should show the task is now done', () => {
                taskCellMenu
                  .menuItemsText()
                  .eq(0)
                  .contains('Set to not started')
                taskCellMenu
                  .menuItemsText()
                  .eq(1)
                  .contains('Set to in progress')
                taskCellMenu.menuItemsText().eq(2).contains('Done')
              })

              it('is the correct colour for the status', () => {
                getTaskCellForTask(taskName)
                  .should('have.css', 'background-color')
                  .and('be.colored', '#d1e5e6')
              })
            })
          })

          describe('and changing the status of a task to not started', () => {
            before(() => {
              taskCellMenu.menuItemsText().eq(0).click()
            })

            it('should display the consistency dialog', () => {
              cy.get('[data-test=dialog-header-title-text]').should(
                'have.text',
                `Status changes: ${taskName}`
              )
            })

            describe('and then confirm status consistency change', () => {
              before(() => {
                cy.get('[data-test=action-dialog-button]').click()
                cy.wait(5000)
                cy.login(user.username)
                cy.reload()
                openMenuForTask(taskName)
              })

              it('should show the task is now done', () => {
                taskCellMenu.menuItemsText().eq(0).contains('Not started')
                taskCellMenu
                  .menuItemsText()
                  .eq(1)
                  .contains('Set to in progress')
                taskCellMenu.menuItemsText().eq(2).contains('Set to done')
              })

              it('is the correct colour for the status', () => {
                getTaskCellForTask(taskName)
                  .should('have.css', 'background-color')
                  .and('be.colored', '#fcfbe8')
                taskCellMenu.menuItemsText().eq(0).click()
              })
            })
          })
        })
      })
    })
  }
)
