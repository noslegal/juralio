import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../../page/taskdetail/taskdetail_page'

describe('task_note_name_validation.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskNoteNameValidation',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Task Note Name Spec Validation',
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
          name: 'Earthquakes',
          description: 'Not my fault!',
        }
      )
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        {
          name: 'Volcano',
          description: 'Lava lava lava.',
        }
      )

      appPage.visitTaskByName('Task With Notes')
    })

    describe('when the note name is edited to blank', () => {
      before(() => {
        taskdetail_page.get.taskNoteListItems().eq(0).click()

        taskdetail_page.noteDetails.get.name().click()

        taskdetail_page.noteDetails.get
          .nameEditor()
          .type('{selectall}')
          .type(' {backspace}')
          .type('{enter}')
      })

      it('should show validation message "This field is required."', () => {
        cy.get('[data-test=edit-field]').contains('This field is required')
      })

      describe('when the note is deselected and then reselected', () => {
        before(() => {
          taskdetail_page.get.taskNoteListItems().eq(0).click()

          taskdetail_page.get.taskNoteListItems().eq(1).click({ force: true })

          taskdetail_page.get.taskNoteListItems().eq(0).click()

          taskdetail_page.noteDetails.get.name().click()
        })

        it('should not show validation message "This field is required."', () => {
          cy.get('[data-test=note-detail-panel]').should(
            'not.contain',
            'This field is required'
          )
        })
      })
    })
  })
})
