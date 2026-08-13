import { enableSSO } from '../../../../../helpers/admin/admin_api_helpers'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('oa_organisation_sso_toggle.cy', () => {
  let organisation, standardUser, orgAdmin, msuser, oktauser, googleUser

  const navigateToOrgDetail = () => {
    cy.login(orgAdmin.username)
    updateFTUE(orgAdmin, { hasSeenOrgAdmin: true })
    cy.login(orgAdmin.username)
    visitHelpers.visitOrgUsers()
  }

  const isChecked = dataTest =>
    cy.get(`[data-test=${dataTest}]`).find('input').should('be.checked')

  const isNotChecked = dataTest =>
    cy.get(`[data-test=${dataTest}]`).find('input').should('not.be.checked')

  before(() => {
    const createStandardUser = () =>
      createUser(undefined, true, false).then(user => (standardUser = user))

    const createOrgAdmin = () =>
      createUser(undefined, true, false, { roles: ['ROLE_ORG_ADMIN'] }).then(
        user => (orgAdmin = user)
      )
    const associateStandardUserWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, standardUser)

    const associateOrgAdminWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, orgAdmin)

    createOrganisation('test', false)
      .then(_organisation => {
        organisation = _organisation.body
      })
      .then(createStandardUser)
      .then(createOrgAdmin)
      .then(associateStandardUserWithOrg)
      .then(associateOrgAdminWithOrg)
      .then(enableSSO)
  })

  describe('when go to the settings page', () => {
    before(() => {
      navigateToOrgDetail()
      cy.wait(3000)
      cy.get('[data-test=settings]').click()
    })

    it('should have 2 sections, one for MFA, one for SSO', () => {
      cy.get('[data-test=mfa-panel-explanatory-text]').should(
        'have.text',
        'We recommend that you keep MFA enabled for your organisation. This requires people to type a code from an authenticator app on their phone as well as entering a password. When enabled it can still be turned off for individual accounts.'
      )
      cy.get('[data-test=sso-panel-explanatory-text]').should(
        'have.text',
        'Enable or disable the use of third party authentication services to sign on to Juralio.'
      )
    })

    it('should have the SSO toggled off by default', () => {
      isNotChecked('toggle-microsoft-sso')
      isNotChecked('toggle-okta-sso')
    })

    describe('when toggle Microsoft SSO on', () => {
      before(() => {
        cy.get('[data-test=toggle-microsoft-sso]').click()
      })

      it('should show a confirmation dialog', () => {
        cy.get('[data-test=dialog-prompt-text]').should(
          'have.text',
          'This will allow users to log into this organisation with this provider.'
        )
      })

      describe('when cancel out', () => {
        before(() => {
          cy.get('[data-test=cancel-dialog-button]').click()
        })

        it('should still show the Microsoft SSO as toggled off', () => {
          isNotChecked('toggle-microsoft-sso')
        })
      })

      describe('when confirm switching on Microsoft SSO', () => {
        before(() => {
          cy.get('[data-test=toggle-microsoft-sso]').click()

          cy.backendRoute('/organisations/**').as('updateOrg')
          cy.get('[data-test=action-dialog-button]').click()
          cy.wait('@updateOrg')
        })

        it('should show the Microsoft SSO as toggled on', () => {
          isChecked('toggle-microsoft-sso')
        })
      })

      describe('when switching a user to use microsoft sso', () => {
        before(() => {
          cy.get('[data-test="accounts"]').click()
          cy.get('[data-test=search-button]').click({ timeout: 30000 })
          cy.get('[data-test=Search]')
            .type(standardUser.username)
          cy.get('[data-rowindex="0"] [data-colindex="0"]').click()
          cy.get('[data-test=convert-to-ms]').click()
        })

        it('should show the email confirmation dialog', () => {
          cy.get('[data-test="sso-email-input"]').should(
            'contain',
            'Please check the email associated with this account is correct before confirming new authentication method - they will be signed out after confirming.'
          )
          cy.get('[data-test=email-field]')
            .find('input')
            .type('{backspace}{backspace}{backspace}')
            .type('net')
          cy.get('[data-test=action-dialog-button]').click()
        })
      })

      describe('should show the user with ms and new email', () => {
        before(() => {
          cy.get('[data-test="action-dialog-button"]').click()
          cy.wait(5000)
          cy.get('[data-test=search-button]').click({ timeout: 30000 })
          cy.get('[data-test=Search]')
            .type('{selectall}{backspace}.net')
        })

        it('should show the email confirmation dialog', () => {
          cy.get('[data-rowindex="0"] [data-colindex="0"]').should('exist')
          cy.get('[data-test="user-auth-method-mfa"]').should(
            'contain.text',
            'Microsoft'
          )
        })
      })

      describe('when switching self to use microsoft sso', () => {
        before(() => {
          cy.get('[data-test="accounts"]').click()
          cy.get('[data-test=search-button]').click({ timeout: 30000 })
          cy.get('[data-test=Search]')
            .clear()
            .type(orgAdmin.username)
          cy.get('[data-rowindex="0"] [data-colindex="0"]').click()
          cy.get('[data-test=convert-to-ms]').click()
        })

        it('should show the email confirmation dialog', () => {
          cy.get('[data-test="sso-email-input"]').should(
            'contain',
            'Please check the email associated with this account is correct before confirming new authentication method - you will be signed out after confirming.'
          )
        })
      })
    })
  })
})
