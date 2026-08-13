import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('create_task_name_dialog_display.cy', () => {
  let user
  const visitHelpers = new VisitHelpers()
  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'testmattertaskcreate',
          teamMembers: [user],
        },
      }
      generateFixture(seed)
    })
  })

  describe('when the Create Task FAB button is clicked', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitHome()
      openDialog()
    })

    describe('Create Task dialog', () => {
      it('should have the header text', () => {
        cy.get('[data-test="dialog-header-title-text"]').should(
          'have.text',
          'Name your new task'
        )
      })

      describe('should have a Text field', () => {
        it('should be visible', () => {
          cy.get('[data-test=text-prompt-text-field]').should('be.visible')
        })
        it('should have placeholder visible', () => {
          cy.get('[data-test=text-prompt-text-field]')
            .find('input')
            .should('have.attr', 'placeholder', 'New task name')
        })
      })

      describe('should have a cancel button', () => {
        it('should be visible', () => {
          cy.get('[data-test="cancel-dialog-button"]').should('be.visible')
        })

        it('should have label "Cancel"', () => {
          cy.get('[data-test="cancel-dialog-button"]').should(
            'have.text',
            'Cancel'
          )
        })
      })

      describe('should have an action button', () => {
        it('should exist', () => {
          cy.get('[data-test="action-dialog-button"]').should('exist')
        })

        it('should have label "Next"', () => {
          cy.get('[data-test="action-dialog-button"]').should(
            'have.text',
            'Next'
          )
        })

        it('should be disabled', () => {
          cy.get('[data-test="action-dialog-button"]').should(
            'have.attr',
            'disabled'
          )
        })
        describe('on entering whitespace only', () => {
          before(() => {
            cy.get('[data-test=text-prompt-text-field]')
              .find('input')
              .type('     ')
          })
          describe('the action button', () => {
            it('should be disabled', () => {
              cy.get('[data-test="action-dialog-button"]').should(
                'have.attr',
                'disabled'
              )
            })
          })
        })

        describe('on entering whitespace and text characters', () => {
          before(() => {
            cy.get('[data-test=text-prompt-text-field]')
              .find('input')
              .type('   test string  ')
          })
          describe('the action button ', () => {
            it('should be enabled', () => {
              cy.get('[data-test="action-dialog-button"]').should(
                'not.have.attr',
                'disabled'
              )
            })
          })
        })

        describe('to cancel the dialog', () => {
          describe('when the cancel button is clicked', () => {
            before(() => {
              cy.get('[data-test="cancel-dialog-button"]').click()
            })

            it('should close the dialog', () => {
              cy.get('[data-test="cancel-dialog-button"]').should('not.exist')
            })
          })

          describe('when the esc button is pressed', () => {
            before(() => {
              openDialog()
              cy.get('[data-test=text-prompt-text-field]')
                .find('input')
                .type('{esc}')
            })

            it('should close the dialog', () => {
              cy.get('[data-test="cancel-dialog-button"]').should('not.exist')
            })
          })
        })
      })
    })
  })
})

function openDialog() {
  cy.get('[data-test="fab-button"]').click()
  cy.get('[data-test="create-task-button"]').click()
}
