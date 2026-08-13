import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../page/taskdetail/taskdetail_page'

describe('subtask_panel_create_a_task.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskCardTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Test Project',
              tasks: [
                { name: 'Transfer Documents' },
                {
                  name: 'Print Documents',
                  tasks: [
                    { name: 'Shred' },
                    { name: 'Rip' },
                    { name: 'Tear' },
                    { name: 'Burn' },
                    { name: 'Mark' },
                    { name: 'Scrunch' },
                    { name: 'Score' },
                    { name: 'Soak' },
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

  describe('When opening a task with no subtasks', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Transfer Documents')
    })

    it('the subtask add button should be displayed', () => {
      taskDetailPage.get.subtaskAddButton().should('be.visible')
    })

    describe('When creating the first task', () => {
      before(() => {
        taskDetailPage.get.subtaskAddButton().click()
      })

      it('the subtask add button should be displayed', () => {
        taskDetailPage.get.subtaskAddButton().should('be.visible')
      })
    })
  })
  describe('When opening a task with 8 subtasks', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Print Documents')
    })

    it('the subtask add button should not be displayed', () => {
      taskDetailPage.get.subtaskAddButton().should('not.exist')
    })
  })
  describe('When using the keyboard to create a subtask', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Transfer Documents')

      taskDetailPage.get.subtaskAddButton().click()
    })
    it('the subtask menu should be closed after submission', () => {
      taskDetailPage.moveDialog.get.dialogTitle().should('not.exist')
    })
  })
  describe('When using the mouse  to create a subtask', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Transfer Documents')

      taskDetailPage.get.subtaskAddButton().click()
    })
    it('the subtask menu should be closed after submission', () => {
      taskDetailPage.moveDialog.get.dialogTitle().should('not.exist')
    })
  })
})
