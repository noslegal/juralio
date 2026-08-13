import {
  generateFixture,
  getWrapper,
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import snackbarHelper from '../../../../../../../helpers/snackbar/snackbar-helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'

describe('subtask_copy_to_limit_validation.cy', () => {
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
                {
                  name: 'Print Documents',
                  tasks: [
                    { name: 'Shred' },
                    { name: 'Rip' },
                    { name: 'Tear' },
                    { name: 'Burn' },
                    { name: 'Mark' },
                    { name: 'Scrunch' },
                    { name: 'Score' },
                  ],
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

  describe('When opening a task with 8 subtasks', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Print Documents')

      cy.get('[data-test=options-dropdown]').eq(0).click()
      cy.get('[data-test=task-card-option-menu-more]').click()
    })

    it('should show the copy option', () => {
      cy.get('[data-test=menu-text-copy]').should('be.visible')
    })

    describe('When clicking on the copy operation', () => {
      before(() => {
        cy.get('[data-test=menu-text-copy]').click()
        cy.get('[data-test=new-task-name-text-field]')
          .find('input')
          .type('Duplicate')
          .type('{enter}')
      })

      it('should display a snackbar', () => {
        cy.get('[data-test=snackbar-message]').should('be.visible')
      })

      it('should hide the snackbar', () => {
        cy.wait(5000)
        cy.get('[data-test=snackbar-message]').should('not.exist')
      })

      it('there should now be 8 subtasks', () => {
        cy.get('[data-test=task-cell-test]').should('have.length', 8)
      })

      describe('When clicking on the copy operation', () => {
        before(() => {
          cy.get('[data-test=options-dropdown]').eq(0).click()
          cy.get('[data-test=task-card-option-menu-more]').click()
          cy.get('[data-test=menu-text-copy]').click()
        })

        it('there should now be 8 subtasks', () => {
          cy.get('[data-test=task-cell-test]').should('have.length', 8)
        })

        snackbarHelper.checkShownAndHasExpectedText(
          'This task cannot be copied because its parent already has 8 subtasks'
        )
      })
    })
  })
})
