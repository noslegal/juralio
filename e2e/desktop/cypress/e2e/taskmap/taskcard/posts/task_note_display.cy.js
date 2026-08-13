import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../../page/taskdetail/taskdetail_page'

describe('task_note_display.cy', () => {
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
              name: 'Task Note Spec',
              tasks: [
                { name: 'Task Without Notes' },
                { name: 'Task With Notes' },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when opening a Task without any Notes', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Task Without Notes')
    })

    it('should display 0 task note list items', () => {
      taskdetail_page.get.taskNoteListItems().should('have.length', 0)
    })

    it('should display a label saying this task has no notes', () => {
      taskdetail_page.get.noNotesPrompt().should('have.text', 'No posts yet')
    })

    it('should display a label saying this task has no notes', () => {
      taskdetail_page.get
        .noNotesCaption()
        .should('have.text', 'To begin work, create your first post')
    })
  })

  describe('when opening a Task with Notes', () => {
    let expectedCreatorName
    before(() => {
      cy.login(user.username)
      expectedCreatorName = user.firstname + ' ' + user.lastname
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[1].id,
        { name: 'This is a note.' }
      )
      cy.wait(1500) // This is to ensure difference in creation time.
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[1].id,
        { name: 'This is another note.' }
      )
      appPage.visitTaskByName('Task With Notes')
    })

    it('should display 2 task note list items', () => {
      taskdetail_page.get.taskNoteListItems().should('have.length', 2)
    })

    it('should NOT display a label saying this task has no notes', () => {
      taskdetail_page.get.noNotesPrompt().should('have.length', 0)
    })

    it('should display the note created second at the top of the list', () => {
      taskdetail_page.get
        .taskNoteListItems()
        .eq(0)
        .should('have.text', 'This is another note.')
      taskdetail_page.get
        .taskNoteListItemsCreationDate()
        .eq(0)
        .should('contain.text', 'Today')
      taskdetail_page.get
        .taskNoteListItemsCreators()
        .eq(0)
        .should('have.text', expectedCreatorName + ' edited')
    })

    it('should display the note created first at the bottom of the list', () => {
      taskdetail_page.get
        .taskNoteListItems()
        .eq(1)
        .should('have.text', 'This is a note.')
      taskdetail_page.get
        .taskNoteListItemsCreationDate()
        .eq(1)
        .should('contain.text', 'Today')
      taskdetail_page.get
        .taskNoteListItemsCreators()
        .eq(1)
        .should('have.text', expectedCreatorName + ' edited')
    })
  })
})
