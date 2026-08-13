import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../../helpers/matterprojects/task_api_helper'
import noteDetailsHelper from '../../../../../../helpers/notes/notes-helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskdetailPage from '../../../../../../page/taskdetail/taskdetail_page'

describe('task_note_name.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskNoteName',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Task Note Name Spec',
              tasks: [{ name: 'Task With Notes' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when opening a Task with notes', () => {
    before(() => {
      cy.login(user.username)

      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        {
          name: 'This is a note',
          description: 'Rectangle is the best shape.',
        }
      )

      appPage.visitTaskByName('Task With Notes')
    })

    describe('when the note name is edited', () => {
      before(() => {
        taskdetailPage.get.taskNoteListItems().eq(0).click()

        taskdetailPage.noteDetails.get.name().click()

        taskdetailPage.noteDetails.get
          .nameEditor()
          .type('{selectall}')
          .type('New note name')

        taskdetailPage.get.taskNoteListItems().eq(0).click()
      })

      noteDetailsHelper.checkNoteDetails(
        'New note name',
        'Last updated: Today',
        'Rectangle is the best shape.'
      )

      it('should update the note name in the list', () => {
        taskdetailPage.get
          .taskNoteListItems()
          .eq(0)
          .should('have.text', 'New note name')
      })
    })

    describe('when task is opened again and the note is reselected', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('Task With Notes')
        taskdetailPage.get.taskNoteListItems().eq(0).click()
      })

      noteDetailsHelper.checkNoteDetails(
        'New note name',
        'Last updated: Today',
        'Rectangle is the best shape.'
      )

      it('should update the note name in the list', () => {
        taskdetailPage.get
          .taskNoteListItems()
          .eq(0)
          .should('have.text', 'New note name')
      })
    })
  })
})
