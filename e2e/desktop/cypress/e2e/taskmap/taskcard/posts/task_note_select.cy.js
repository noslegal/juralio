import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../../helpers/matterprojects/task_api_helper'
import noteDetailsHelper from '../../../../../../helpers/notes/notes-helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../../page/taskdetail/taskdetail_page'

describe('task_note_select.cy', () => {
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
              tasks: [{ name: 'Task With Notes' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when opening a Task with Notes', () => {
    before(() => {
      cy.login(user.username)

      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        {
          name: 'This is a note.',
          description: 'Trains are wonderful machines.',
        }
      )
      cy.wait(1500) // This is to ensure difference in creation time.
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        {
          name: 'This is another note.',
          description: 'Steam trains are most wonderful machines.',
        }
      )
      appPage.visitTaskByName('Task With Notes')
    })

    describe('when the oldest created note is selected', () => {
      before(() => {
        taskdetail_page.get.taskNoteListItems().eq(1).click()
      })

      noteDetailsHelper.checkNoteDetails(
        'This is a note.',
        'Created Today',
        'Trains are wonderful machines.'
      )
    })

    describe('when the latest created note is selected', () => {
      before(() => {
        taskdetail_page.get.taskNoteListItems().eq(0).click()
      })

      noteDetailsHelper.checkNoteDetails(
        'This is another note.',
        'Created Today',
        'Steam trains are most wonderful machines.'
      )
    })
  })
})
