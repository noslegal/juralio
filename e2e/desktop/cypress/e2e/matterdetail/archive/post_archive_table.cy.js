import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../page/taskdetail/taskdetail_page'

describe('post_archive_table.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      updateFTUE(user, { hasSeenMatterAdmin: true })
      const seed = {
        matter: {
          prefix: 'POST',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Post_archive_table.cy',
              tasks: [{ name: 'Task For Creating Notes' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  const notesToArchive = 3

  describe('When user clicks on Archive the task note option menu', () => {
    before(() => {
      cy.login(user.username)

      for (let i = 0; i < notesToArchive; i++) {
        addNoteToTask(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id,
          {
            name: `This is a note ${i}.`,
          }
        )
        cy.wait(500)
      }
      appPage.visitTaskByName('Task For Creating Notes')
    })

    it('should show the task card content', () => {
      taskdetail_page.get.taskCardContent().should('be.visible')
    })

    describe('When user clicks on Archive the task note option menu', () => {
      before(() => {
        for (let i = 0; i < notesToArchive; i++) {
          cy.login(user.username)
          appPage.visitMatter()
          appPage.visitTaskByName('Task For Creating Notes')
          cy.wait(5000)

          taskdetail_page.get.taskNoteListItems().eq(0).click()
          taskdetail_page.noteDetails.get
            .noteContentMenu()
            .click({ timeout: 10000 })
          cy.get('[data-test=task-post-archive]', { timeout: 10000 }).click()
          cy.get('[data-test=action-dialog-button]').click()
        }
      })

      it('The posts no longer appear in the task post list', () => {
        cy.get('[data-test=note-list-item]').should('have.length', 0)
      })

      describe('When user visits the archived posts table', () => {
        before(() => {
          cy.login(user.username)
          appPage.visitMatter()
          cy.wait(2000)
          cy.get('[data-test=archive]').click()
          cy.get('[data-test=posts-tab]').click()
        })
        it('The posts appear in the archive table', () => {
          cy.get('[data-test=name-text]').should('have.length', notesToArchive)
        })
      })
    })
  })
})
