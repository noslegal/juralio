import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { openCreateNote } from '../../../../../helpers/notes/notes_create_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('create_note_destination_dialog_display.cy', () => {
  let user
  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'testmatter',
          teamMembers: [user],
        },
      }
      generateFixture(seed)
    })
  })

  describe('when the create note dialog button is clicked and a valid note title is entered', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitHome()
      cy.backendRoute('/matters*').as('fetchMatters')
      openCreateNote()
      cy.wait('@fetchMatters')
    })

    it('should be displayed', () => {
      cy.get('[data-test=juralio-dialog]').should('be.visible')
    })

    describe('note destination dialog', () => {
      it('should have the header text', () => {
        cy.get('[data-test=dialog-header-title-text]').should(
          'have.text',
          'Choose a destination for your new note'
        )
      })
      describe('should have a matter select component', () => {
        it('should be visible', () => {
          cy.get('[data-test=matter-select-container]').should('be.visible')
        })
        it('should automatically open the search results for matters', () => {
          cy.get('[data-test=search-results-list]').should('be.visible')
        })
        after(() => {
          cy.get('[data-test=dialog-header-title-text]').click()
        })
      })

      describe('should have a project select component', () => {
        it('should exist', () => {
          cy.get('[data-test=project-select-container]').should('exist')
        })
      })

      describe('should have a cancel button', () => {
        it('should be visible', () => {
          cy.get('[data-test=cancel-dialog-button]').should('be.visible')
        })

        it('should have label "Back"', () => {
          cy.get('[data-test=cancel-dialog-button]').should('have.text', 'Cancel')
        })
      })

      describe('should have an action button', () => {
        it('should exist', () => {
          cy.get('[data-test=action-dialog-button]').should('exist')
        })

        it('should be disabled', () => {
          cy.get('[data-test=action-dialog-button]').should(
            'have.attr',
            'disabled',
            'disabled'
          )
        })

        it('should have label "Create"', () => {
          cy.get('[data-test=action-dialog-button]').should(
            'have.text',
            'Create'
          )
        })

        describe('to cancel the dialog', () => {
          describe('when the cancel button is clicked', () => {
            before(() => {
              cy.get('[data-test=cancel-dialog-button]').click()
            })

            it('should close the dialog', () => {
              cy.get('[data-test=cancel-dialog-button]').should('not.exist')
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
              cy.get('[data-test=cancel-dialog-button]').should('not.exist')
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
