import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../page/taskdetail/taskdetail_page'

const { moveDialog } = taskDetailPage

describe('subtask_create_then_move.cy', () => {
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
              name: 'Test Project',
              tasks: [
                { name: 'Transfer Documents' },
                {
                  name: 'Print Documents',
                  tasks: [{ name: 'Shred' }],
                },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When opening a task with no subtasks', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Transfer Documents')
    })

    it('the subtask add button should be displayed', () => {
      taskDetailPage.get.subtaskAddButton().should('be.visible')
    })

    describe('When creating the first task', () => {
      before(() => {
        taskDetailPage.get.subtaskAddButton().click()
        cy.get('[data-test=edit-name-field]')
          .find('input')
          .type('Festive{enter}')
        cy.wait(1000)

        cy.get('[data-test=edit-name-field]').find('input').type('{esc}')
      })

      it('the subtask should be displayed', () => {
        cy.get('[data-test=task-cell-test]').should('have.length', 1)
      })

      describe('When clicking on the move operation', () => {
        before(() => {
          cy.get('[data-test=options-dropdown]').eq(0).click()
          cy.get('[data-test=task-card-option-menu-more]').click()
          cy.get('[data-test=menu-text-move]').click()
        })

        it('Should open the move dialog', () => {
          cy.get('[data-test=dialog-header-title-text]').should(
            'contain',
            'Move task:'
          )
          cy.get('[data-test=dialog-header-title-text]').should(
            'contain',
            'Festive'
          )
        })

        describe('When clicking on the move operation', () => {
          before(() => {
            moveDialog.get.destinationSelectionDropdown().click()
            moveDialog.get.destinationOption.newTask().click()
          })

          it('has a destination subtask field', () => {
            moveDialog.get
              .destinationTextField()
              .should('have.attr', 'placeholder', 'Enter name of task')
          })
        })
      })
    })
  })
})
