import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../../helpers/matterprojects/task_api_helper'
import noteDetailsHelper from '../../../../../../helpers/notes/notes-helper'
import { openCreateNote } from '../../../../../../helpers/notes/notes_create_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskdetailPage from '../../../../../../page/taskdetail/taskdetail_page'

describe('context_create_archive_note_on_task.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'CreateTaskNoteSpec',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'CreateTaskNote',
              tasks: [{ name: 'Task For Creating Notes' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When user click the global fab button and choose create note in a task context', () => {
    before(() => {
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        {
          name: 'This is a note.',
        }
      )
      appPage.visitTaskByName('Task For Creating Notes')
      openCreateNote()
    })

    it('shows a snackbar "New note successfully created"', () => {
      cy.get('[data-test=snackbar-message]')
        .should('be.visible')
        .should('contain', 'Note successfully created')
    })

    it('should have two items in the content list', () => {
      cy.get('[data-test=note-listitem-name]').should('have.length', 2)
    })

    it('appears in the note list', () => {
      cy.wait(3000)
      taskdetailPage.get
        .taskNoteListItems()
        .eq(0)
        .should('contain', `${new Date().toLocaleDateString('en-CA')} Note`)
      taskdetailPage.get.taskNoteListItems().eq(0).click()
    })

    noteDetailsHelper.checkNoteDetails(
      `${new Date().toLocaleDateString('en-CA')} Note`,
      'Created Today'
    )

    describe('clicking away from the note edit component', () => {
      before(() => {
        taskdetailPage.get.taskNoteListItems().eq(1).click({ force: true })
        cy.wait(5000)
        taskdetailPage.get.taskNoteListItems().eq(0).click({ force: true })
      })

      it('should populate correct zero state', () => {
        cy.get('[data-test=note-editor-container]')
          .find('[data-test=notes-content-placeholder]')
          .should('have.text', 'Add note content')
      })
    })
  })

  describe('When user clicks on Archive the task note option menu', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Task For Creating Notes')
      taskdetailPage.get.taskNoteListItems().eq(0).click()
      taskdetailPage.noteDetails.get.noteContentMenu().click()
      cy.get('[data-test=task-post-archive]').click()
      cy.get('[data-test=action-dialog-button]').click()
    })

    it('should remove the note', () => {
      taskdetailPage.get.taskNoteListItems().should('have.length', 1)
    })

    it('should show the task card content', () => {
      taskdetailPage.get.taskCardContent().should('be.visible')
    })
  })
})
