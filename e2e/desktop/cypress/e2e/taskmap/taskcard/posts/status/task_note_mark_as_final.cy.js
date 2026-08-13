import {
    generateFixture,
    getWrapper
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../../../helpers/matterprojects/task_api_helper'
import noteDetailsHelper from '../../../../../../../helpers/notes/notes-helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../../../page/taskdetail/taskdetail_page'

describe('task_note_mark_as_final.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskNoteFinalStatusTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Task Note Status',
              tasks: [{ name: 'Task' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when opening a Task and selecting a Note', () => {
    before(() => {
      cy.login(user.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'This is a note.' }
      )
      appPage.visitTaskByName('Task')
      taskdetail_page.get.taskNoteListItems().eq(0).click()
    })

    it('The menu icon button is shown', () => {
      taskdetail_page.noteDetails.get.noteContentMenu().should('be.visible')
    })

    describe('when menu icon button is clicked', () => {
      before(() => {
        taskdetail_page.noteDetails.get.finaliseButton().click()
      })

      it('The menu is shown', () => {
        taskdetail_page.noteDetails.get.noteContentMenu().should('be.visible')
      })

      describe('when menu item is clicked', () => {
        before(() => {
          taskdetail_page.noteDetails.get.finaliseButton().click()
        })

        describe('when "Mark as draft" menu item is clicked', () => {
          noteDetailsHelper.checkNoteDetails(
            'This is a note.',
            'Last updated: Today'
          )
        })
      })

      describe('when in a mobile view', () => {
        before(() => {
          cy.viewport('iphone-6')
        })

        it('The menu is NOT shown in the note detail', () => {
          taskdetail_page.noteDetails.get.noteContentMenu().should('not.exist')
        })
      })
      describe('finalising without saving', () => {
        before(() => {
          cy.viewport('macbook-13')

          cy.login(user.username)
          addNoteToTask(
            fixture.matter.id,
            fixture.projects[0].id,
            fixture.tasks[0].id,
            { name: 'This is a note.' }
          )
          appPage.visitTaskByName('Task')
          taskdetail_page.get.taskNoteListItems().eq(0).click()
          taskdetail_page.noteDetails.get.content().click()
          taskdetail_page.noteDetails.get
            .noteEditor()
            .type('{selectall}{backspace}')
            .type('This text was finalised')
          taskdetail_page.noteDetails.get.finaliseButton().click()
        })
        it('should save the content', () => {
          noteDetailsHelper.checkNoteDetails(
            'This is a note.',
            'Created Today',
            'This text was finalised'
          )
        })
      })
    })
  })
})
