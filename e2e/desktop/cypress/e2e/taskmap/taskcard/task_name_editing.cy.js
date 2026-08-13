import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'

describe('task_name_editing.cy', () => {
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
              name: 'Task Name Editing Spec',
              tasks: [{ name: 'Inital Task Name' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when opening a task', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName(fixture.tasks[0].name)
    })

    describe('the task name', () => {
      it('should display in read mode', () => {
        getReadField().should('have.text', 'Inital Task Name')
      })

      describe('when trying to edit task name and press ESC', () => {
        before(() => {
          taskDetailPage.get.optionMenuButton().click()
          taskDetailPage.optionMenu.get.renameItem().click()
        })

        it('should toggle the task name into edit state', () => {
          getEditField().should('have.value', 'Inital Task Name')
        })

        describe('edit task name and press ESC', () => {
          before(() => {
            getEditField().type('exexex').type('{esc}')
          })

          it('should NOT persist the change and toggle back to read state', () => {
            getReadField().should('have.text', 'Inital Task Name')
          })
        })
      })

      describe('when trying to edit task name and press Enter', () => {
        describe('edit task name and press Enter', () => {
          before(() => {
            cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/**').as(
              'patchTask'
            )
            taskDetailPage.get.optionMenuButton().click()
            taskDetailPage.optionMenu.get.renameItem().click()
            getEditField()
              .type('{selectAll}')
              .type('{del}')
              .type('exexex')
              .type('{enter}')
            cy.wait('@patchTask')
          })

          it('should persist the change and back to read mode', () => {
            getReadField().should('have.text', 'exexex')
          })

          describe('when refresh the page and select the task again', () => {
            before(() => {
              cy.login(user.username)
              cy.visit(
                `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/task/${fixture.tasks[0].id}`
              )
            })

            it('the name should be updated', () => {
              getReadField().should('have.text', 'exexex')
            })
          })
        })
      })

      describe('when trying to save a task name which is more than 70 characters', () => {
        before(() => {
          taskDetailPage.get.optionMenuButton().click()
          taskDetailPage.optionMenu.get.renameItem().click()
        })

        describe('enter 71 characters task name and press Enter', () => {
          before(() => {
            getEditField()
              .type('{selectAll}')
              .type('{del}')
              .type(
                'acbdefghij-----acbdefghij-----09876543210987654321098765432109876543210987654321a'
              )
              .type('{enter}')
          })

          it('should persist the change which is capped the first 70 characters', () => {
            getReadField().should(
              'have.text',
              'acbdefghij-----acbdefghij-----0987654321098765432109876543210987654321'
            )
          })
        })
      })
    })
  })
})

function getReadField() {
  return cy.get('[data-test=task-name]').find('[data-test="read-field"]')
}

function getEditField() {
  return cy
    .get('[data-test=task-name]')
    .find('[data-test="edit-field"]')
    .find('textarea')
    .not('[aria-hidden="true"]')
    .last()
}
