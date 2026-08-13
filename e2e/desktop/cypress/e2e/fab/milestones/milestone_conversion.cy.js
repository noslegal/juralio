import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('milestone_conversion.cy', () => {
  let user, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'rick and morty',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'belch',
              tasks: [{ name: 'task', tasks: [{ name: 'level B' }] }],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
  })
  describe('when trying to convert a task to a milestone', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTaskDetails(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id
      )
      cy.get('[data-test="task-cell-test"]').click()
      cy.get('[data-test=task-card-option-menu-button]').click()
      cy.get('[data-test=task-card-option-menu-more]').click()
      cy.get('[data-test=task-card-option-menu] [role=menuitem]').eq(9).click()
      cy.wait(5000)
    })
    it('should convert the task to a milestone', () => {
      cy.get('[data-test=milestone-icon]').should('exist')
    })
    describe('when converting a milestone to  a task', () => {
      before(() => {
        cy.get('[data-test=task-card-option-menu-button]').click()
        cy.get('[data-test=task-card-option-menu] [role=menuitem]')
          .eq(7)
          .click()
        cy.wait(5000)
      })
      it('should convert the milestone to a task', () => {
        cy.get('[data-test=milestone-icon]').should('not.exist')
      })
      describe('when a task has children', () => {
        before(() => {
          cy.get('body').type('{esc}')
          cy.get('[data-test=create-subtask-button]').click()
          cy.get('[data-test=edit-name-field]')
            .find('input')
            .type('subtask{enter}')
          cy.get('[data-test=task-card-option-menu-button]').click()
        })
        it('should not be able to convert', () => {
          cy.get('[data-test=task-card-option-menu] [role=menuitem]')
            .eq(9)
            .should('have.class', 'Mui-disabled')
        })
      })
    })
  })
})
