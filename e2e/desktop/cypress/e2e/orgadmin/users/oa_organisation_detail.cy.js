import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  assertNumberOfUserRowsCorrect,
  assertRowContentsCorrect,
  assertUserCountTitleCorrect,
  constructAvatarText,
} from '../../../../../helpers/users/user-table-helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'
import HttpStatus from 'http-status-codes'

const visitHelpers = new VisitHelpers()

describe('oa_organisation_detail.cy', () => {
  let organisation, standardUser, orgAdmin

  const navigateToOrgDetail = () => {
    cy.login(orgAdmin.username)
    updateFTUE(orgAdmin, { hasSeenOrgAdmin: true })
    cy.login(orgAdmin.username)
    visitHelpers.visitOrgUsers()
  }

  before(() => {
    const createStandardUser = () =>
      createUser(undefined, true, false).then(user => (standardUser = user))
    const createOrgAdmin = () =>
      createUser(undefined, true, false, {
        roles: ['ROLE_ORG_ADMIN', 'ROLE_ORG_OWNER'],
      }).then(user => (orgAdmin = user))
    const associateStandardUserWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, standardUser)
    const associateOrgAdminWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, orgAdmin)

    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    cy.apiSpecRequest({
      url: `${Cypress.env('serverRootBaseUrl')}/api/admin/instance/settings`,
      method: 'PATCH',
      body: {
        enableUserConfirmation: false,
        enablePaymentPlatformIntegration: false,
      },
    }).then(response => {
      expect(response.status).to.eq(HttpStatus.OK)
      createOrganisation('', false)
        .then(_organisation => {
          organisation = _organisation.body
        })
        .then(createStandardUser)
        .then(createOrgAdmin)
        .then(associateStandardUserWithOrg)
        .then(associateOrgAdminWithOrg)
    })
  })

  describe('when load page', () => {
    before(() => {
      navigateToOrgDetail()
    })

    it('should display side panel with expected options', () => {
      cy.get('[data-test=accounts]').should('contain.text', 'Accounts')
      cy.get('[data-test=settings]').should('contain.text', 'Settings')
    })
  })

  describe('when navigating to the detail page of the current Organisation admins Organisation', () => {
    before(() => {
      navigateToOrgDetail()
      cy.wait(3000)
      cy.get('[data-test=settings]').click()
      cy.get('[data-test=mfa-panel-switch]').click()
      cy.get('[data-test=action-dialog-button]').click()
      cy.get('[data-test=accounts]').click()
    })

    it('should navigate to the organisation detail page for the selected org', () => {
      cy.get('[data-test=scrolling-content-frame]').should(
        'contain.text',
        'Accounts'
      )
    })

    describe('the table of users', () => {
      before(navigateToOrgDetail)

      it('should have a header displaying the number of users in the Organisation', () => {
        assertUserCountTitleCorrect(
          'This organisation has 2 active individual accounts.'
        )
      })

      it('should display the expected number of user rows', () => {
        assertNumberOfUserRowsCorrect(2)
      })

      it('should have a Last login column header', () => {
        cy.get('[data-test=user-last-logged-in-label]')
          .should('be.visible')
          .should('have.text', 'Last logged in')
      })

      it('should have the expected cell data for the standard user', () => {
        assertRowContentsCorrect({
          avatar: constructAvatarText(standardUser),
          name: `${standardUser.firstname} ${standardUser.lastname}`,
          email: standardUser.username,
          roles: '',
          type: 'Internal',
          mfa: true,
          mfaEnabled: false,
          status: 'Active',
          statusEnabled: true,
          lastLoginDate: '',
        })
      })

      it('should have the expected cell data for the org admin', () => {
        assertRowContentsCorrect({
          avatar: constructAvatarText(orgAdmin),
          name: 'You',
          email: orgAdmin.username,
          roles: 'Org admin',
          type: 'Internal',
          mfaEnabled: false,
          mfa: true,
          status: 'Active',
          statusEnabled: false,
          lastLoginDate: 'Online now',
        })
      })

      describe('when the other user has logged in', () => {
        before(() => {
          cy.login(standardUser.username)
          navigateToOrgDetail()
        })
        it('should have the expected cell data for the standard user', () => {
          assertRowContentsCorrect({
            avatar: constructAvatarText(standardUser),
            name: `${standardUser.firstname} ${standardUser.lastname}`,
            email: standardUser.username,
            roles: '',
            type: 'Internal',
            mfa: true,
            mfaEnabled: false,
            status: 'Active',
            statusEnabled: true,
            lastLoginDate: 'Online now',
          })
        })
      })
    })
  })
})
