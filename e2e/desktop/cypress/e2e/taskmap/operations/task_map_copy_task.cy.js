import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { checkTaskMapLevelAndDepthCounts } from '../../../../../helpers/taskmap/task-map-helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import taskmapPage from '../../../../../page/taskmap/taskmap_page'

describe('task_map_copy_task.cy', () => {
  let user, fixture
  const taskCellMenu = taskmapPage.operationMenu

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskMapTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Copyists',
              tasks: [
                {
                  name: 'Cat',
                },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('when the create note destination dialog is launched, the project selector', () => {
    before(() => {
      cy.reload()
      cy.login(user.username)
      cy.backendRoute('/matter/*/workstreams/*').as('projectFetch')
      cy.visit(
        `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/taskmap`
      )
      cy.wait('@projectFetch')
    })

    describe('and copying a task', () => {
      before(() => {
        cy.wait(2000)
        taskCellMenu.taskCellDropDownArrow().eq(0).click()
        cy.get('[data-test=task-card-option-menu-more]').click()
        taskCellMenu.copyMenuText().click()
        cy.wait(2000)
      })

      it('without a name shows a validation message and "Copy" is unavailable', () => {
        cy.get('[data-test=new-task-name-text-field]')
          .find('input')
          .clear()
          .type('{enter}')

        cy.get('[data-test=action-dialog-button]').should('be.disabled')
      })

      after(() => {
        cy.get('[data-test=cancel-dialog-button]').click()
      })
    })

    describe('and copying a task', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(0).click()
        cy.get('[data-test=task-card-option-menu-more]').click()
        taskCellMenu.copyMenuText().click()

        cy.backendRoute('/matter/*/workstreams/*').as('projectFetch')
        cy.get('[data-test=new-task-name-text-field]')
          .find('input')
          .type('Tiger')
          .type('{enter}')

        cy.wait('@projectFetch')
        cy.wait(5000)
      })

      checkTaskMapLevelAndDepthCounts([
        {
          depth: 1,
          expectedCount: 2,
          expectedText: ['Cat', 'Tiger'],
        },
      ])
    })
  })
})
