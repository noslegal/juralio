import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { getUserRowByUsername } from '../../../../../helpers/users/user-table-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('oa_organisation_users_delete.cy', () => {
  let fixture, orgAdmin, user

  const navigateToOrgDetail = () => {
    cy.login(orgAdmin.username)
    visitHelpers.visitOrgUsers()
  }

  before(() => {
    createUser(
      undefined,
      true,
      true,
      { roles: ['ROLE_ORG_ADMIN'] },
      false,
      false,
      false,
      false,
      true
    ).then(user => {
      orgAdmin = user
    })

    createUser('', false, true)
      .then(u => {
        user = u
      })
      .then(() => {
        const seed = {
          matter: {
            teamMembers: [orgAdmin, user],
            matterAdmins: [orgAdmin, user],
            projects: [
              {
                name: 'Project',
                tasks: [{ name: 'Task', teamMembers: [orgAdmin, user] }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when looking at a user who has logged in before', () => {
    before(() => {
      navigateToOrgDetail()
      getUserRowByUsername(orgAdmin.username)
    })

    it('should not show a delete button', () => {
      cy.get('[data-test=delete-user-button]').should('not.exist')
    })
  })

  describe('when looking at a user who has never logged in', () => {
    before(() => {
      getUserRowByUsername(user.username)
    })

    it('should show a delete button', () => {
      cy.get('[data-test=delete-user-button]').should('exist')
    })

    describe('when clicking the delete button', () => {
      before(() => {
        cy.get('[data-test=delete-user-button]').click()
      })

      it('should show a confirmation dialog with the correct text', () => {
        cy.get('[data-test=dialog-prompt-text]').should(
          'have.text',
          'This account has never been used to sign in to Juralio. Do you want to delete the account?'
        )
        cy.get('[data-test=dialog-header-title-text]').should(
          'have.text',
          `Delete ${user.username}`
        )
      })
    })

    describe('when confirming the deletion', () => {
      before(() => {
        cy.get('[data-test=action-dialog-button]').click()
      })

      it('should show a snackbar', () => {
        cy.get('[data-test=snackbar-message]')
          .should('be.visible')
          .should('contain', 'Account successfully deleted')
      })
      it('should remove the user from the list', () => {
        cy.get('[data-test=search-button]', { timeout: 30000 }).click()
        cy.get('[data-test=Search]')
          .clear()
          .type(user.username.substring(0, 10), { delay: 5 })
        cy.get('[data-test=table-user-column]').should('not.exist')
      })
    })
  })
})
