import faker from 'faker'
import {
  visitGlobalUsers,
  visitOrganisationDetail,
} from '../../../../../helpers/admin/admin_visit_helpers'
import { getUserRowByUsername } from '../../../../../helpers/users/user-table-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { get as tempPwdDialogGet } from '../../../../../page/users/temporary-password-dialog-page'
import { get as detailsDialogGet } from '../../../../../page/users/user-details-dialog-page'

describe('temporary_password.cy', () => {
  describe('when choosing to reset the password of an existing user', () => {
    let user

    const logInAndNavigate = () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.backendRoute('GET', '/users').as('getUsers')
      visitGlobalUsers()
      cy.wait('@getUsers')
    }

    before(() => {
      createUser().then(response => (user = response))
      logInAndNavigate()
    })

    before(() => {
      getUserRowByUsername(user.username).click('left')
    })

    it('should be a link with the text "Reset password"', () => {
      detailsDialogGet
        .resetPasswordLink()
        .should('be.visible')
        .should('have.text', 'Reset password')
    })

    describe('When clicked', () => {
      let temporaryPasswordValue

      before(() => {
        detailsDialogGet.resetPasswordLink().click()
      })

      it('should close the dialog and display the temporary password dialog', () => {
        detailsDialogGet.dialog().should('not.exist')
        tempPwdDialogGet.dialog().should('be.visible')
      })

      it('should display a dialog title as "Password has been reset" (existing user context)', () => {
        tempPwdDialogGet.title().should('have.text', 'Password has been reset')
      })

      it('dialog message should contain the email sent message (existing user context)', () => {
        cy.get('[data-test=email-sent-image]').should('be.visible')
      })

      describe('clicking the Close button', () => {
        before(() => {
          cy.wait(1000)
          tempPwdDialogGet.closeButton().click()
          cy.wait(1000)
        })

        it('should close the dialog', () => {
          tempPwdDialogGet.dialog().should('not.exist')
        })
        it('should not be possible to log on with the old password', () => {
          cy.canLogin(user.username, 'Password2Password2$').should('eq', false)
        })
      })
    })
  })

  describe('when creating a new user', () => {
    let newUserInputs, temporaryPasswordValue

    const logInAndNavigate = () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.backendRoute('GET', '/organisations/*/users').as('getUsers')
      visitOrganisationDetail('Juralio')
      cy.wait('@getUsers')
    }

    before(() => {
      logInAndNavigate()
      newUserInputs = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.internet.email().toLowerCase(),
      }

      cy.get('[data-test=fab-button]').click()
      cy.wait(3000)
      cy.get('[data-test=create-user-flow-dialog-button]').click()
      cy.get('[data-test=email]').type(`${newUserInputs.username}{enter}`)
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(2000)
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(2000)
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(2000)
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(2000)
      // cy.get('[data-test=action-dialog-button]').click()
    })

    it('should display the temporary password dialog', () => {
      tempPwdDialogGet.dialog().should('be.visible')
    })

    it('dialog should contain the username of the user', () => {
      cy.get('[data-test=email-sent-image]').should('be.visible')
    })
  })
})
