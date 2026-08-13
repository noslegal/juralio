import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  assertRowContentsCorrect,
  constructAvatarText,
  getUserRowByUsername,
} from '../../../../../helpers/users/user-table-helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('oa_organisation_users_mfa_toggle.cy', () => {
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
      createUser(undefined, true, false, { roles: ['ROLE_ORG_ADMIN'] }).then(
        user => (orgAdmin = user)
      )
    const associateStandardUserWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, standardUser)
    const associateOrgAdminWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, orgAdmin)

    createOrganisation('', false)
      .then(_organisation => {
        organisation = _organisation.body
      })
      .then(createStandardUser)
      .then(createOrgAdmin)
      .then(associateStandardUserWithOrg)
      .then(associateOrgAdminWithOrg)
  })

  describe("when navigating to the detail page of the current Organisation Admin's organisation", () => {
    before(() => {
      navigateToOrgDetail()
      cy.wait(3000)
      cy.get('[data-test=settings]').click()
      cy.get('[data-test=mfa-panel-switch]').click()
      cy.get('[data-test=action-dialog-button]').click()
      cy.get('[data-test=accounts]').click()
    })

    it('should display both users without MFA', () => {
      assertRowContentsCorrect({
        avatar: constructAvatarText(standardUser),
        name: `${standardUser.firstname} ${standardUser.lastname}`,
        email: standardUser.username,
        mfa: true,
        roles: '',
        type: 'Internal',
        mfaEnabled: false,
        status: 'Active',
      })
      assertRowContentsCorrect({
        avatar: constructAvatarText(orgAdmin),
        name: 'You',
        email: orgAdmin.username,
        mfa: true,
        roles: 'Org admin',
        type: 'Internal',
        mfaEnabled: false,
        status: 'Active',
      })
    })

    describe('when toggling MFA for the standard user and selecting cancel', () => {
      before(() => {
        getUserRowByUsername(standardUser.username)
          .find('[data-test=user-mfa]')
          .click()

        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(5000)
      })

      it('should display MFA as enabled for that user', () => {
        assertRowContentsCorrect({
          avatar: constructAvatarText(standardUser),
          name: `${standardUser.firstname} ${standardUser.lastname}`,
          email: standardUser.username,
          mfa: true,
          roles: '',
          type: 'Internal',
          mfaEnabled: true,
          status: 'Active',
        })
      })
    })

    describe('when toggling MFA for the org admin and selecting continue', () => {
      before(() => {
        getUserRowByUsername(orgAdmin.username)
          .find('[data-test=user-mfa]')
          .click()

        cy.get('[data-test=cancel-dialog-button]').click()
      })

      it('should continue to display MFA as disabled for that user', () => {
        assertRowContentsCorrect({
          avatar: constructAvatarText(orgAdmin),
          name: 'You',
          email: orgAdmin.username,
          roles: 'Org admin',
          type: 'Internal',
          mfa: true,
          mfaEnabled: false,
          status: 'Active',
        })
      })

      describe('when refreshing the page', () => {
        before(() => {
          navigateToOrgDetail()
        })

        it('should have persisted the changes', () => {
          assertRowContentsCorrect({
            avatar: constructAvatarText(standardUser),
            name: `${standardUser.firstname} ${standardUser.lastname}`,
            email: standardUser.username,
            roles: '',
            type: 'Internal',
            mfa: true,
            mfaEnabled: true,
            status: 'Active',
          })
          assertRowContentsCorrect({
            avatar: constructAvatarText(orgAdmin),
            name: 'You',
            email: orgAdmin.username,
            roles: 'Org admin',
            type: 'Internal',
            mfa: true,
            mfaEnabled: false,
            status: 'Active',
          })
        })
      })
    })
  })
})
