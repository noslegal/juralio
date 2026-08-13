import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { checkTaskMapLevelAndDepthCounts } from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'
import taskmapPage from '../../../../../page/taskmap/taskmap_page'

describe('task_map_move_task.cy', () => {
  const taskCellMenu = taskmapPage.operationMenu
  let user, fixture
  let { moveDialog } = taskDetailPage
  let appPage

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
              name: 'Movers',
              tasks: [
                {
                  name: 'Cow',
                  tasks: [
                    {
                      name: 'Bison',
                    },
                  ],
                },
                {
                  name: 'Yak',
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

  describe('when the create note destination dialog is launched, the project selector', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()
    })

    describe('and archiving a task', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(1).click()
        cy.get('[data-test=task-card-option-menu-more]').click()
        taskCellMenu.moveMenuText().click()

        moveDialog.get.destinationSelectionDropdown().click()
        moveDialog.get.destinationOption.levelA().click()

        cy.backendRoute('/matter/*/workstreams/*').as('projectFetch')
        cy.wait(2000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait('@projectFetch')
        cy.wait(2000)
      })

      checkTaskMapLevelAndDepthCounts([
        {
          depth: 1,
          expectedCount: 3,
          expectedText: ['Cow', 'Bison', 'Yak'],
        },
      ])
    })
  })
})
