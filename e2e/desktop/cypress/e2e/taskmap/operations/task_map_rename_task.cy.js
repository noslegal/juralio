import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskmapPage from '../../../../../page/taskmap/taskmap_page'

const visitHelpers = new VisitHelpers()

describe('task_map_rename_task.cy', () => {
  let user, fixture
  let appPage
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
            {
              name: 'Renamers',
              tasks: [
                {
                  name: 'Bee',
                },
                {
                  name: 'Wasp',
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

  // describe('when the create note destination dialog is launched, the project selector', () => {
  //   before(() => {
  //     cy.login(user.username)
  //     appPage.visitTaskMap()
  //   })

  //   describe('and renaming a task', () => {
  //     before(() => {
  //       taskCellMenu.taskCellDropDownArrow().eq(0).click()
  //       cy.wait(1000)
  //       taskCellMenu.renameMenuText().click({ force: true })

  //       cy.backendRoute('/matter/*/projects/*').as('projectFetch')
  //       cy.wait(1000)
  //       cy.get('[data-test=edit-name-field]', { timeout: 30000 })
  //         // .find('input')
  //         .type('{end}troot{enter}', { delay: 200 })
  //       cy.wait(1000)
  //       // cy.wait('@projectFetch')
  //       cy.wait(2000)
  //     })

  //     checkTaskMapLevelAndDepthCounts([
  //       {
  //         depth: 1,
  //         expectedCount: 2,
  //         expectedText: ['Beetroot', 'Wasp'],
  //       },
  //     ])
  //   })
  // })
})
