import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../page/taskdetail/taskdetail_page'

describe('check_correct_notes_on_task.cy', () => {
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
              tasks: [{ name: 'Task 1' }, { name: 'Task 2' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when opening Task 1', () => {
    let expectedCreatorName
    before(() => {
      cy.login(user.username)
      expectedCreatorName = user.firstname + ' ' + user.lastname
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'This is a note.' }
      )
      cy.wait(1500) // This is to ensure difference in creation time.
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'This is another note.' }
      )
      appPage.visitTaskByName('Task 1')
    })

    it('should display the note "This is another note" at the top of the list', () => {
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

    it('should display the note "This is a note" at the bottom of the list', () => {
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

  describe('when opening Task 2', () => {
    let expectedCreatorName
    before(() => {
      cy.login(user.username)
      expectedCreatorName = user.firstname + ' ' + user.lastname
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[1].id,
        { name: 'This is task 2 note.' }
      )
      cy.wait(1500) // This is to ensure difference in creation time.
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[1].id,
        { name: 'This is another task 2 note.' }
      )

      appPage.visitTaskByName('Task 2')
    })

    it('should display the note "This is another task 2 note" at the top of the list', () => {
      taskdetail_page.get
        .taskNoteListItems()
        .eq(0)
        .should('have.text', 'This is another task 2 note.')
      taskdetail_page.get
        .taskNoteListItemsCreationDate()
        .eq(0)
        .should('contain.text', 'Today')
      taskdetail_page.get
        .taskNoteListItemsCreators()
        .eq(0)
        .should('have.text', expectedCreatorName + ' edited')
    })

    it('should display the note "This is a task 2 note" at the bottom of the list', () => {
      taskdetail_page.get
        .taskNoteListItems()
        .eq(1)
        .should('have.text', 'This is task 2 note.')
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
