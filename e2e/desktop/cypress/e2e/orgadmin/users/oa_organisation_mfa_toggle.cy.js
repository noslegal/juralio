import { enableSSO } from '../../../../../helpers/admin/admin_api_helpers'
import { visitHome } from '../../../../../helpers/admin/admin_visit_helpers'
import { loginViaUI } from '../../../../../helpers/login/mfa_helpers'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  getUniqueEmailAddress,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { turnOnSSO } from '../../../../../helpers/organisation/organisation_helper'
import { getUserRowByUsername } from '../../../../../helpers/users/user-table-helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('oa_organisation_mfa_toggle.cy', () => {
  let organisation, standardUser, orgAdmin

  const visitOrgUsers = orgAdmin => {
    cy.login(orgAdmin.username)
    updateFTUE(orgAdmin, { hasSeenOrgAdmin: true })
    cy.login(orgAdmin.username)
    visitHelpers.visitOrgUsers()
  }

  const toggleMFAForUser = targetUser => {
    cy.backendRoute('PATCH', '/users/*').as('updateUser')
    getUserRowByUsername(targetUser.username)
      .find('[data-test=user-mfa] [data-test=lock-switch]')
      .click()
    cy.get('[data-test=action-dialog-button]').click()
    cy.wait('@updateUser')
  }

  const toggleMFAForOrg = () => {
    cy.wait(3000) // DOM Detach
    cy.get('[data-test=settings]').click()
    cy.get('[data-test=mfa-panel-switch]').click()
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

  describe('when the organisation has MFA enabled', () => {
    before(() => {
      visitOrgUsers(orgAdmin)
      turnOnSSO()
      toggleMFAForOrg()
      cy.get('[data-test=action-dialog-button]').click()
    })

    it('should display the expected content in the MFA panel', () => {
      cy.get('[data-test=mfa-panel-title]')
        .should('be.visible')
        .should('have.text', 'Security')
      cy.get('[data-test=mfa-panel-explanatory-text]')
        .should('be.visible')
        .should(
          'have.text',
          'We recommend that you keep MFA enabled for your organisation. This requires people to type a code from an authenticator app on their phone as well as entering a password. When enabled it can still be turned off for individual accounts.'
        )
      cy.get('[data-test=mfa-panel-switch-status]')
        .should('be.visible')
        .should('have.text', 'MFA is enabled for this organisation')
      cy.get('[data-test=mfa-panel-switch] input').should('be.checked')
    })

    describe('when a new user is created', () => {
      let userShouldBeCreatedWithMFAEnabled

      before(() => {
        userShouldBeCreatedWithMFAEnabled = getUniqueEmailAddress()

        cy.get('[data-test=accounts]').click()
        cy.get('[data-test=add-people-button]').click()
        cy.get('[data-test=email]').type(
          `${userShouldBeCreatedWithMFAEnabled}{enter}`
        )
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
      })

      it('should appear with MFA enabled', () => {
        getUserRowByUsername(userShouldBeCreatedWithMFAEnabled)
          .find('[data-test=user-mfa] [data-test=lock-switch-closed]')
          .should('be.visible')
      })
    })

    describe('when MFA is disabled for a user', () => {
      describe('when that user logs in', () => {
        before(() => {
          cy.clearUserSession()
          loginViaUI(standardUser.username)
          visitHelpers.visitHome()
        })

        it('should re-direct the user to the home page', () => {
          cy.url().should('contain', '/#/home')
        })
      })
    })

    describe('when MFA is enabled for a user', () => {
      before(() => {
        visitOrgUsers(orgAdmin)
        toggleMFAForUser(standardUser)
        cy.clearUserSession()
        cy.reload()
      })

      describe('when that user logs in', () => {
        before(() => {
          loginViaUI(standardUser.username)
        })

        it('should display the mfa form', () => {
          cy.get('[data-test="mfa-register-form"]').should('be.visible')
        })
      })
    })

    describe('when the organisation-level MFA is toggled', () => {
      before(() => {
        visitOrgUsers(orgAdmin)
        toggleMFAForOrg()
      })

      it('should display the expected content in the confirmation dialog', () => {
        cy.get('[data-test=dialog-header-title-text]')
          .should('be.visible')
          .should('have.text', 'Disable multi-factor authentication')
        cy.get('[data-test=dialog-prompt-text]')
          .should('be.visible')
          .should(
            'have.text',
            'Are you sure you would like to disable MFA for this organisation? We recommend keeping MFA enabled. With MFA enabled, you can still turn MFA off for specific users if required.'
          )
      })

      describe('when the change is canceled', () => {
        before(() => {
          cy.get('[data-test=cancel-dialog-button]').click()
        })

        it('should display the expected content in the MFA panel', () => {
          cy.get('[data-test=mfa-panel-switch-status]')
            .should('be.visible')
            .should('have.text', 'MFA is enabled for this organisation')
          cy.get('[data-test=mfa-panel-switch] input').should('be.checked')
        })

        describe('when MFA is enabled for a user and their org', () => {
          describe('when that user logs in', () => {
            before(() => {
              cy.clearUserSession()
              loginViaUI(standardUser.username)
            })

            it('should display the mfa form', () => {
              cy.get('[data-test="mfa-register-form"]').should('be.visible')
            })
          })
        })
      })
    })

    describe('when the organisation-level MFA is toggled', () => {
      before(() => {
        visitOrgUsers(orgAdmin)
        toggleMFAForOrg()
      })

      describe('when the change is confirmed', () => {
        before(() => {
          cy.get('[data-test=action-dialog-button]').click()
        })

        it('should display the expected content in the MFA panel', () => {
          cy.get('[data-test=mfa-panel-switch-status]')
            .should('be.visible')
            .should('have.text', 'MFA is disabled for this organisation')
          cy.get('[data-test=mfa-panel-switch] input').should('not.be.checked')
        })

        it('should not display the MFA column', () => {
          cy.get('[data-test=accounts]').click()
          cy.get('[data-test=user-mfa-label]').should('not.exist')
        })

        describe('when a new user is created', () => {
          let userShouldBeCreatedWithMFADisabled

          before(() => {
            userShouldBeCreatedWithMFADisabled = getUniqueEmailAddress()

            cy.get('[data-test=accounts]').click()
            cy.get('[data-test=add-people-button]').click()
            cy.get('[data-test=email]').type(
              `${userShouldBeCreatedWithMFADisabled}{enter}`
            )
            cy.get('[data-test=action-dialog-button]').click()
            cy.wait(2000)
            cy.get('[data-test=action-dialog-button]').click()
            cy.wait(2000)
            cy.get('[data-test=action-dialog-button]').click()
            cy.wait(2000)
            cy.get('[data-test=action-dialog-button]').click()
            cy.wait(2000)

            cy.get('[data-test=action-dialog-button]').click()
            toggleMFAForOrg()
            cy.get('[data-test=action-dialog-button]').click()
            cy.get('[data-test=accounts]').click()
          })

          it('should appear with MFA disabled', () => {
            getUserRowByUsername(userShouldBeCreatedWithMFADisabled)
              .find('[data-test=user-mfa] [data-test=lock-switch-open]')
              .should('be.visible')
          })
        })

        describe('when MFA disabled for an org and enabled for a user', () => {
          describe('when that user logs in', () => {
            before(() => {
              toggleMFAForOrg()
              cy.backendRoute('PATCH', '/organisations/*').as('patchOrg')
              cy.get('[data-test=action-dialog-button]').click()
              cy.wait('@patchOrg')
              cy.clearUserSession()
              loginViaUI(standardUser.username)
              visitHelpers.visitHome()
            })

            it('should re-direct the user to the home page', () => {
              cy.url().should('contain', '/#/home')
            })
          })

          describe('when MFA is disabled for the org and the user', () => {
            describe('when that user logs in', () => {
              before(() => {
                visitOrgUsers(orgAdmin)
                toggleMFAForOrg()
                cy.get('[data-test=action-dialog-button]').click()
                cy.get('[data-test=accounts]').click()
                toggleMFAForUser(standardUser)
                toggleMFAForOrg()
                cy.get('[data-test=action-dialog-button]').click()
                cy.wait(1000)
                visitHome()
                cy.wait(1000)
                cy.clearUserSession()
                cy.reload()
                loginViaUI(standardUser.username)
              })

              it('should re-direct the user to the home page', () => {
                cy.url().should('contain', '/#/home')
              })
            })
          })
        })
      })
    })
  })
})
