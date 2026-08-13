import {
  enterPasscode,
  generateValidInvalidPasscodePairFromQRCode,
  loginViaUI,
} from '../../../../../helpers/login/mfa_helpers'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

describe(
  'register_mfa_validation.cy',
  {
    retries: {
      runMode: 3,
      openMode: 0,
    },
  },
  () => {
    let testUser, invalidPasscode, organisation

    before(() => {
      createOrganisation('test', false)
        .then(_organisation => {
          organisation = _organisation.body
        })
        .then(() =>
          createUser(undefined, true, false, { roles: ['ROLE_ORG_ADMIN'] })
        )
        .then(createdUser => {
          testUser = createdUser
        })
        .then(() => sysadminAddUserToOrganisation(organisation, testUser))
        .then(() => {
          const visitHelpers = new VisitHelpers()
          cy.login(testUser.username)
          updateFTUE(testUser, { hasSeenOrgAdmin: true })
          cy.login(testUser.username)
          visitHelpers.visitHome()
          visitHelpers.visitOrgUsers()
          cy.wait(1250)
          cy.get('[data-test=settings]').click({ timeout: 10000, force: true })
          cy.get('[data-test=mfa-panel-switch]').click()
          cy.get('[data-test=action-dialog-button]').click()
          cy.get('[data-test=accounts]').click()
          cy.get('[data-test=lock-switch-open]').click()
          cy.get('[data-test=action-dialog-button]').click()
          cy.clearUserSession()
          visitHelpers.visitLogin()
          cy.reload()
        })
    })

    before(() => {
      // perform first login to set up
      loginViaUI(testUser.username)

      return generateValidInvalidPasscodePairFromQRCode().then(passcodes => {
        invalidPasscode = passcodes[1]
      })
    })

    it('visit login page', () => {
      cy.clearUserSession()
      cy.reload()
      loginViaUI(testUser.username)
    })

    describe('when user input incorrect MFA code and click AUTHENTICATE', () => {
      it('setup - input MFA code', () => {
        enterPasscode(invalidPasscode)
      })

      it('should render a validation message stating the authentication code is incorrect', () => {
        cy.get('[data-test="validation-message"]').contains(
          'Incorrect authentication code'
        )
      })

      it('should clear all of the code input boxes', () => {
        cy.get('[data-test=0-digit-input]').should('have.value', '')
        cy.get('[data-test=1-digit-input]').should('have.value', '')
        cy.get('[data-test=2-digit-input]').should('have.value', '')
        cy.get('[data-test=3-digit-input]').should('have.value', '')
        cy.get('[data-test=4-digit-input]').should('have.value', '')
        cy.get('[data-test=5-digit-input]').should('have.value', '')
      })

      it('should focus on the first code input box', () => {
        cy.focused().should('have.attr', 'data-test', '0-digit-input')
      })

      describe('and when the user types a value into a code input box', () => {
        before(() => {
          cy.get('[data-test=0-digit-input]').type('1')
        })

        it('the validation message should no longer be shown', () => {
          cy.get('[data-test="validation-box"]').should('not.be', 'visible')
        })
      })
    })
  }
)
