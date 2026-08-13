import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('task_map_create_child.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'task_map_create_child',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {
                  name: 'task1A',
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

  describe('when navigating to the task map', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()
    })

    it('should display the expected number of task cells', () => {
      cy.get('[data-test=task-cell-test]').should('have.length', 1)
    })

    describe('when the mouse enters a task with no children and no siblings', () => {
      before(() => {
        cy.wait(500)
        cy.get('div').contains('task1A').trigger('mouseover', { force: true })
      })

      describe('and the create child button is clicked', () => {
        before(() => {
          cy.wait(500)
          cy.get('[data-test=hover-button-right]').click()
        })

        it('should display a new task cell containing an input field', () => {
          cy.get('[data-test=hover-button-right]').should('not.exist')
          cy.get('[data-test=task-cell-test]').should('have.length', 2)
          cy.get('[data-test=edit-name-field]').should('be.visible')
        })

        describe('and escape is pressed', () => {
          before(() => {
            cy.get('[data-test=edit-name-field] input').type('{ESC}')
          })

          it('should hide the new task cell containing an input field', () => {
            cy.get('[data-test=task-cell-test]').should('have.length', 1)
            cy.get('[data-test=edit-name-field]').should('not.exist')
          })
        })
      })

      after(() => {
        cy.get('div').contains('task1A').trigger('mouseout', { force: true })
      })
    })

    describe('when the mouse enters a task with no children and no siblings again', () => {
      before(() => {
        cy.clock()
        cy.get('div').contains('task1A').trigger('mouseover', { force: true })
        cy.tick(500)
      })

      describe('and the create child button is clicked, a task name is typed and enter is pressed', () => {
        before(() => {
          cy.clock()

          cy.get('[data-test=hover-button-right]').click({ force: true })
          cy.tick(500)
          cy.get('[data-test=edit-name-field]').type('My New Task{Enter}')
          cy.tick(500)
          cy.wait(3000)
          cy.get('body').click()
        })

        it('should hide the input field and display the name in the new task cell', () => {
          cy.get('[data-test=edit-name-field]').should('not.exist')
          cy.get('[data-test=task-cell-test] [data-task-name]')
            .eq(1)
            .should('have.text', 'My New Task')
        })
      })
    })
  })
})
