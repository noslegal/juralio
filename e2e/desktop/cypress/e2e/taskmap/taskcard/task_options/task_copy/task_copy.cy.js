import { generateFixture } from '../../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'

describe('task_copy.cy', () => {
  let user, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskCopyTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Tast Copy Spec',
              tasks: [{ name: 'original task' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('When the taskmap is loaded', () => {
    before(() => {
      cy.login(user.username)
      cy.visit(
        `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/taskmap`
      )
    })

    it('should have 1 task visible on the map', () => {
      cy.get('[data-test=depth-1]').should('have.length', 1)
    })

    describe('When trying to copy a task', () => {
      before(() => {
        cy.login(user.username)
        cy.visit(
          `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/task/${fixture.tasks[0].id}`
        )
        cy.get('[data-test="task-card-option-menu-button"]').click()
        cy.get('[data-test=task-card-option-menu-more]').click()
        cy.get('[data-test="task-card-option-menu-copy"]').click()
      })

      it('should display the copy task dialog', () => {
        cy.get('[data-test="dialog-header-title-text"]').should('be.visible')
      })

      describe('click the cancel button', () => {
        before(() => {
          cy.get('[data-test="cancel-dialog-button"]').click()
        })

        it('should NOT display the copy task dialog', () => {
          cy.get('[data-test="dialog-header-title-text"]').should('not.exist')
        })

        /**
         * BUGFIX:JUR-12405
         * Ensures that previously occuring bug where notes spinner became permanently displayed.
         */
        it('should display the task posts section correctly', () => {
          cy.get('[data-test="no-notes-prompt"]').should('be.visible')
        })
      })

      describe('enter new task name and click the copy button', () => {
        before(() => {
          cy.get('[data-test="task-card-option-menu-button"]').click()
          cy.get('[data-test=task-card-option-menu-more]').click()
          cy.get('[data-test="task-card-option-menu-copy"]').click()
          cy.get('[data-test="new-task-name-text-field"]')
            .find('input')
            .type('copied task')
            .type('{enter}')
        })

        it('should close the dialog', () => {
          cy.get('[data-test="dialog-header-title-text"]').should('not.exist')
        })

        describe('refresh to page and verify the data', () => {
          before(() => {
            cy.login(user.username)
            cy.visit(
              `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/taskmap`
            )
          })

          it('should have 2 level A task', () => {
            cy.get('[data-test=depth-1]').should('have.length', 2)
          })

          it('the second 1 should be the copied task', () => {
            cy.get('[data-test=depth-1]').eq(1).should('contain', 'copied task')
          })
        })
      })
    })
  })
})
