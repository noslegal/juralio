import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskmapPage from '../../../../../page/taskmap/taskmap_page'

describe('task_map_menu_operation_display.cy', () => {
  const getDialogTitle = () => cy.get('[data-test=dialog-header-title-text]')
  const cancelDialog = () => cy.get('[data-test=cancel-dialog-button]').click()
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
          projects: [{ tasks: [{ name: 'Atlas' }, { name: 'Beta' }] }],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when navigating to the task map', () => {
    before(() => {
      cy.login(user.username)
      cy.backendRoute('/matter/*/workstreams/*').as('projectFetch')
      cy.visit(
        `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/taskmap`
      )
      cy.wait('@projectFetch')
      cy.wait(3000) // DOM Detach issue
      taskCellMenu.taskCellDropDownArrow().eq(0).click()
      cy.get('[data-test=task-card-option-menu-more]').click()
    })

    it('should show the operations options', () => {
      taskCellMenu.renameMenuText().contains('Rename')
      taskCellMenu.moveMenuText().contains('Move')
      taskCellMenu.copyMenuText().contains('Copy')
      //taskCellMenu.linkMenuText().contains('Add task link')
      taskCellMenu.archiveMenuText().contains('Archive')
    })

    describe('and clicking the archive operation', () => {
      before(() => {
        //cy.get('body').click()
        //taskCellMenu.taskCellDropDownArrow().eq(0).click()
        //cy.get('[data-test=task-card-option-menu-more]').click()
        taskCellMenu.archiveMenuText().click()
      })

      it('should pop up with the archive dialog', () => {
        getDialogTitle().contains('Archive task')
      })
    })

    // describe('and clicking the rename operation', () => {
    //   before(() => {
    //     cy.login(user.username)
    //     appPage.visitTaskMap()
    //     taskCellMenu.taskCellDropDownArrow().eq(0).click()
    //     cy.wait(5000)
    //     taskCellMenu.renameMenuText().click()
    //     cy.wait(1000)
    //   })

    //   it('should change the name to the edit state text field', () => {
    //     cy.get('[data-test=edit-name-field]', { timeout: 30000 }).should(
    //       'exist'
    //     )
    //   })
    // })
  })
})
