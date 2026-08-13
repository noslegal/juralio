import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { addSelectionOfPosts } from '../../../../../../helpers/notes/posts-helper'
import snackbarHelper from '../../../../../../helpers/snackbar/snackbar-helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../page/taskdetail/taskdetail_page'

describe('task_details_export.cy', () => {
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
                {
                  name: 'Transfer Documents',
                  tasks: [
                    {
                      name: 'Acquire evidence',
                      properties: { status: 'not-started' },
                    },
                    {
                      name: 'Process evidence 1',
                      properties: { status: 'done' },
                    },
                    {
                      name: 'Process evidence 2',
                      properties: { status: 'done' },
                    },
                    {
                      name: 'Process evidence 3',
                      properties: { status: 'done' },
                    },
                    {
                      name: 'Process evidence 4',
                      properties: { status: 'done' },
                    },
                    {
                      name: 'Process evidence',
                      properties: { status: 'in-progress' },
                    },
                  ],
                },
                { name: 'Print Documents' },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When opening a task', () => {
    before(() => {
      cy.login(user.username)

      addSelectionOfPosts(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id
      )

      appPage.visitTaskByName('Transfer Documents')
    })

    describe('the task card should', () => {
      it('displays the task name', () => {
        cy.get('[data-test=task-name]').should('contain', 'Transfer Documents')
      })

      describe('When downloading the task details as a Word document', () => {
        before(() => {
          taskDetailPage.get.optionMenuButton().click()
          cy.get('[data-test=task-card-option-menu-more]').click()
          taskDetailPage.optionMenu.get.downloadItem().click()
          cy.get('[data-test=action-dialog-button]').click()
        })

        snackbarHelper.checkShownAndHasExpectedText(
          'Preparing your download...'
        )
      })
    })
  })

  describe('When opening a task', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Print Documents')
    })

    describe('the task card should', () => {
      it('displays the task name', () => {
        cy.get('[data-test=task-name]').should('contain', 'Print Documents')
      })

      describe('When downloading the task details as a Word document', () => {
        before(() => {
          taskDetailPage.get.optionMenuButton().click()
          cy.get('[data-test=task-card-option-menu-more]').click()
          taskDetailPage.optionMenu.get.downloadItem().click()
          cy.get('[data-test=action-dialog-button]').click()
        })

        snackbarHelper.checkShownAndHasExpectedText(
          'Preparing your download...'
        )
      })
    })
  })
})
