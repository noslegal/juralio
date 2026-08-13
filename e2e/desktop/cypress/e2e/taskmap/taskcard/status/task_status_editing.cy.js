import { generateFixture } from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskmapPage from '../../../../../../page/taskmap/taskmap_page'

describe('task_status_editing.cy', () => {
  const taskOptionsMenu = taskmapPage.operationMenu
  let user, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskMapStatusTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {
                  properties: {
                    name: 'task1',
                  },
                },
                {
                  properties: {
                    name: 'task2',
                  },
                },
                {
                  properties: {
                    name: 'task3',
                  },
                },
              ],
            },
            {},
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('when loading tasks', () => {
    testStatusChange(1, 1, 'In progress')
    testStatusChange(2, 2, 'Done')
    testStatusChange(0, 0, 'Not started')
    testStatusChange(2, 0, 'Not started')

    function testStatusChange(taskIndex, statusIndex, statusText) {
      describe(
        'When navigating onto a task to change taskstatus to "' +
          statusText +
          '"',
        () => {
          before(() => {
            cy.login(user.username)
            cy.visit(
              `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/task/${fixture.tasks[taskIndex].id}`
            )
          })

          describe('clicking the dropdown and clicking the required item', () => {
            before(() => {
              taskOptionsMenu.menuButton().click()
              taskOptionsMenu.menuItem(statusIndex).click()
            })

            it('displays the updated task status', () => {
              cy.get('[data-test="task-header-status-text"]').should(
                'have.text',
                statusText
              )
            })
          })

          describe('when task is re-selected after a page refresh', () => {
            before(() => {
              cy.reload()
              cy.login(user.username)
              cy.visit(
                `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/task/${fixture.tasks[taskIndex].id}`
              )
            })

            it('Continues to display the updated task status', () => {
              cy.get('[data-test="task-header-status-text"]').should(
                'have.text',
                statusText
              )
            })
          })
        }
      )
    }
  })
})
