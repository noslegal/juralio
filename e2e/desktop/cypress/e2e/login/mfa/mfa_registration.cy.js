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

describe('mfa_registration.cy', () => {
  let testUser, generatedPasscode, invalidPasscode, organisation

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
        cy.wait(2000)
        cy.get('[data-test=settings]').click()
        cy.get('[data-test=mfa-panel-switch]').click()
        cy.get('[data-test=action-dialog-button]').click()
        cy.get('[data-test=accounts]').click()
        cy.get('[data-test=lock-switch-open]').click()
        cy.get('[data-test=action-dialog-button]').click()
        cy.clearUserSession()
        cy.visit('/#/login')
        cy.reload()
      })
  })

  before(() => {
    loginViaUI(testUser.username)

    return generateValidInvalidPasscodePairFromQRCode().then(passcodes => {
      generatedPasscode = passcodes[0]
      invalidPasscode = passcodes[1]
    })
  })

  describe('The mfa registration form', () => {
    it('should display the mfa form', () => {
      cy.get('[data-test="mfa-register-form"]').should('be.visible')
    })

    it('should display hint message to explain why the MFA form is displayed', () => {
      cy.get('[data-test="mfa-register-first-message"]').contains(
        'Your administrator has turned on multi-factor authentication. This helps protect your account.'
      )
    })

    it('should display another message to guide user how to register MFA', () => {
      cy.get('[data-test="mfa-register-second-message"]').contains(
        'Please scan this code using the authenticator app on your phone. A six digit code will display. Enter this code to continue.'
      )
    })

    it('should display the responsed QR code', () => {
      cy.get('[data-test="mfa-register-qr"]')
        .should('be.visible')
        .find('canvas')
        .should('be.visible')
    })

    it('should display the 6 digit input for inputting MFA code', () => {
      cy.get('[data-test="numeric-code-inputs"]')
        .should('be.visible')
        .find('input')
        .should('have.length', 6)
    })

    it('the first digit input should be focused', () => {
      cy.focused().should('have.attr', 'data-test', '0-digit-input')
    })

    it('should display the can not scan option ', () => {
      cy.get('[data-test="mfa-noScan"]').should('be.visible')
      cy.get('[data-test="mfa-secret"]').should('not.exist')
    })

    describe('when user clicks on cant scan', () => {
      before(() => {
        cy.get('[data-test="mfa-noScan"]').click()
      })

      it('should display the QR secret ', () => {
        cy.get('[data-test="mfa-secret"]').should('be.visible')
      })
    })

    describe('when user inputs correct MFA code', () => {
      before(() => {
        enterPasscode(generatedPasscode)
      })

      it('should direct user to home page', () => {
        cy.url().should('contain', '/#/home')
      })
    })
  })
})
