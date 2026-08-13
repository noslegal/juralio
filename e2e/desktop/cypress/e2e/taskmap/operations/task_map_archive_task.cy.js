import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { checkTaskMapLevelAndDepthCounts } from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskmapPage from '../../../../../page/taskmap/taskmap_page'

const visitHelpers = new VisitHelpers()

describe('task_map_archive_task.cy', () => {
  let user, fixture
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
              name: 'Archivists',
              tasks: [
                {
                  name: 'Zip',
                },
                {
                  name: 'Rar',
                },
                {
                  name: 'Tar.gz',
                },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('when on the Taskmap screen', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
    })

    describe('and archiving a task', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(2).click()
        cy.get('[data-test=task-card-option-menu-more]').click()
        taskCellMenu.archiveMenuText().click()

        cy.backendRoute('/matter/*/workstreams/*').as('projectFetch')

        cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/archive').as(
          'archiveFetch'
        )
        cy.get('[data-test=action-dialog-button]').click('right')
        cy.wait('@archiveFetch')
        cy.wait('@projectFetch')
        cy.wait(1000)
      })

      checkTaskMapLevelAndDepthCounts([
        {
          depth: 1,
          expectedCount: 2,
          expectedText: ['Zip', 'Rar'],
        },
      ])
    })
  })
})
