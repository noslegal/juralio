import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTaskFromFabInContext } from '../../../../../helpers/tasks/task_create_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'


describe('create_task_no_snackbar.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'testdismisstaskbar',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'CreateTaskDismissSnackbar',
              tasks: [{ name: 'Task To have subtasks' }, { name: 'Here Goes' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When Task is created from task details screen as a subtask', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Task To have subtasks')

      createTaskFromFabInContext('This is a new Task')
    })

    it('The snack bar is NOT shown', () => {
      cy.get('[data-test=snackbar-message]').should('not.exist')
    })

    describe('When Sub task is created', () => {
      it('should show the existing sub task details', () => {
        cy.get('[data-test=task-name]').should(
          'contain',
          'Task To have subtasks'
        )
      })

      it('should display a task level of - "A"', () => {
        taskDetailPage.get.jurNumber().should('contain', 'A')
      })

      it('should have hidden the snackbar', () => {
        cy.get('[data-test=snackbar-message]').should('not.exist')
      })
    })
  })
})
