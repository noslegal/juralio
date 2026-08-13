import {
    generateFixture,
    getWrapper
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../../../page/taskdetail/taskdetail_page'

describe('task_note_mark_as_draft.cy', () => {
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

  describe('when opening a Task, selecting a Note and marking it as Final', () => {
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
      taskdetail_page.noteDetails.get.finaliseButton().click()
      cy.wait(5000)
      taskdetail_page.noteDetails.get.finaliseButton().click()
    })

    describe('should show the post in draft form', () => {
      it('should have the correct text in the button', () => {
        taskdetail_page.noteDetails.get
          .finaliseButton()
          .should('contain.text', 'Finalise')
      })

      it('should have the correct text in the button', () => {
        cy.get('[data-test=status-chip]').should('contain.text', 'Draft')
      })
    })
  })
})
