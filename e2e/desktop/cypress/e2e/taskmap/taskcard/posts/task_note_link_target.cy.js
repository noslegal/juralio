import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../../page/taskdetail/taskdetail_page'

describe('task_note_link_target.cy', () => {
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
              tasks: [{name: 'Task With Notes'}],
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
          description: 'Rectangle is the best shape.<a target="_blank" href="https://www.google.com">Hello</a>',
        }
      )

      appPage.visitTaskByName('Task With Notes')
    })

    describe('when link in note is clicked', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('Task With Notes')
        taskdetail_page.get
          .taskNoteListItems()
          .eq(0)
          .click()
      })

      it('should open the link in a new tab', () => {
        taskdetail_page.noteDetails
          .get
          .content()
          .get('a[href*="google"]')
          .should('have.attr', 'target', '_blank')
      })
    })
  })
})
