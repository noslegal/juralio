import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('task_card.cy', () => {
  let user, fixture

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
                { name: 'Print Documents' },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('When opening a task', () => {
    before(() => {
      cy.login(user.username)
      cy.visit(
        `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/task/${fixture.tasks[0].id}`
      )
    })

    describe('the task card should', () => {
      it('displays the task name', () => {
        cy.get('[data-test="task-name"]', { timeout: 30000 }).should(
          'contain',
          'Transfer Documents'
        )
      })

      it('displays the option menu button', () => {
        cy.get('[data-test="task-card-option-menu-button"').should('be.visible')
      })

      describe('clicking the option menu', () => {
        before(() => {
          cy.get('[data-test="task-card-option-menu-button"]').click()
          cy.get('[data-test=task-card-option-menu-more]').click()
        })

        it('opens the menu', () => {
          cy.get('[data-test="task-card-option-menu"]').should('be.visible')
        })

        it('displays the move menu option', () => {
          cy.get('[data-test="task-card-option-menu-move"]').should(
            'be.visible'
          )
        })

        it('displays the copy menu option', () => {
          cy.get('[data-test="task-card-option-menu-copy"]').should(
            'be.visible'
          )
        })

        it('displays the archive menu option', () => {
          cy.get('[data-test="task-card-option-menu-archive"]').should(
            'be.visible'
          )
        })
      })
    })

    describe('and opening the second task', () => {
      before(() => {
        cy.login(user.username)
        cy.visit(
          `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/task/${fixture.tasks[1].id}`
        )
      })

      describe('select the second task', () => {
        it('displays the task name', () => {
          cy.get('[data-test="task-name"]', { timeout: 30000 }).should(
            'contain',
            'Print Documents'
          )
        })
      })
    })
  })

  describe('Archive task and navigate back to the archived task', () => {
    before(() => {
      cy.login(user.username)
      cy.visit(
        `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/task/${fixture.tasks[0].id}`
      )
      cy.get('[data-test="task-card-option-menu-button"]').click()
      cy.get('[data-test=task-card-option-menu-more]').click()
      cy.get('[data-test="task-card-option-menu-archive"]').click()
      cy.get('[data-test="action-dialog-button"]').click()
      cy.visit('/#/home/this-does-not-exist')
      cy.wait(1000)
      cy.visit(
        `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/task/${fixture.tasks[0].id}`
      )
    })

    it('show not found page', () => {
      cy.get('[data-test=not-found-page]').should('be.visible')
    })
  })
})
