import HttpStatus from 'http-status-codes'
import { visitGlobalUsers } from '../../../../../helpers/admin/admin_visit_helpers'
import { getUserRowByUsername } from '../../../../../helpers/users/user-table-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { changeUserActiveStatus } from '../../../../../helpers/users/user_helper'

describe('sysadmin_global_users_active_status_toggle.cy', () => {
  let testUser

  const navigateToPage = () => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    visitGlobalUsers()
  }

  const toggleUserActiveStatus = (state, confirm) =>
    changeUserActiveStatus(testUser, state, confirm)

  const nameCheck = testUser => {
    cy.get('[data-test=dialog-header-title-text]').contains(
      `${testUser.firstname} ${testUser.lastname}`
    )
  }

  before(() => {
    createUser().then(user => (testUser = user))

    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    cy.apiSpecRequest({
      url: `${Cypress.env('serverRootBaseUrl')}/api/admin/instance/settings`,
      method: 'PATCH',
      body: {
        enableUserConfirmation: false,
      },
    }).then(response => {
      expect(response.status).to.eq(HttpStatus.OK)
    })
    navigateToPage()
  })

  describe('When changing the Active status of a user to "Inactive"', () => {
    describe('When cancel is pressed', () => {
      before(() => {
        toggleUserActiveStatus('off', false)
        nameCheck(testUser)
        cy.get('[data-test=cancel-dialog-button]').click()
      })
      it('the Status column for that should be toggled on and display "Active"', () => {
        getUserRowByUsername(testUser.username)
          .find('[data-test=user-status]')
          .should('contain.text', 'Active')
      })

      it('should be possible for that user to log on', () => {
        cy.canLogin(testUser.username).should('eq', true)
      })
    })

    describe('When continue is pressed', () => {
      before(() => {
        toggleUserActiveStatus('off', false)
        nameCheck(testUser)
        cy.get('[data-test=action-dialog-button]').click()
      })
      it('the Status column for that should be toggled off and display "Inactive"', () => {
        getUserRowByUsername(testUser.username)
          .find('[data-test=user-status]')
          .should('contain.text', 'Inactive')
      })

      it('should NOT be possible for that user to log on', () => {
        cy.canLogin(testUser.username).should('eq', false)
      })

      describe('When changing the status of the same user back to "Active"', () => {
        before(() => {
          navigateToPage()
        })

        describe('When cancel is pressed', () => {
          before(() => {
            toggleUserActiveStatus('on', false)
            nameCheck(testUser)
            cy.get('[data-test=cancel-dialog-button]').click()
          })
          it('the Status column for that should be toggled off and display "Inactive"', () => {
            getUserRowByUsername(testUser.username)
              .find('[data-test=user-status]')
              .should('contain.text', 'Inactive')
          })

          it('should NOT be possible for that user to log on', () => {
            cy.canLogin(testUser.username).should('eq', false)
          })
        })

        describe('When continue is pressed', () => {
          before(() => {
            toggleUserActiveStatus('on', false)
            nameCheck(testUser)
            cy.get('[data-test=action-dialog-button]').click()
          })

          it('the Status column for that should be toggled on and display "Active"', () => {
            getUserRowByUsername(testUser.username)
              .find('[data-test=user-status]')
              .should('contain.text', 'Active')
          })

          it('should be possible for that user to log on', () => {
            cy.canLogin(testUser.username).should('eq', true)
          })
        })
      })
    })
  })
})
