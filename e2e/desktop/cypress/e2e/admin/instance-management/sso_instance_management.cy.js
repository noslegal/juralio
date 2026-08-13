import { disableSSO } from '../../../../../helpers/admin/admin_api_helpers'
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

/*
Purpose: Tests toggling SSO log in at a system wide level.

Test flow:  This logs in as sys admin, switches on Microsoft SSO and checks the log in button appears on the 
            log in page and that the org admin can see the Microsoft SSO option on their org settings.

            The org admin then enables Microsoft SSO, then the sys admin disables and then re-enables Microsoft
            SSO, org admin checks the settings and the Microsoft SSO is disabled.


Date created: 05/11/21
*/

describe('sso_instance_management.cy', () => {
  let organisation, standardUser, orgAdmin

  const isChecked = dataTest =>
    cy.get(`[data-test=${dataTest}]`).find('input').should('be.checked')

  const isNotChecked = dataTest =>
    cy.get(`[data-test=${dataTest}]`).find('input').should('not.be.checked')

  const navigateToInstanceManagement = () => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    cy.visit('/#/')
    cy.get('[data-test=instance-management]').click()
  }

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

    createOrganisation('test', false)
      .then(_organisation => {
        organisation = _organisation.body
      })
      .then(createStandardUser)
      .then(createOrgAdmin)
      .then(associateStandardUserWithOrg)
      .then(associateOrgAdminWithOrg)
      .then(disableSSO)
  })

  before(navigateToInstanceManagement)

  describe('when go to instance management tab', () => {
    it('should show the SSO settings are disabled', () => {
      isNotChecked('toggle-microsoft-sso')
      isNotChecked('toggle-okta-sso')
      isNotChecked('toggle-google-sso')
    })
  })

  describe('when click toggle an SSO on', () => {
    before(() => {
      cy.get('[data-test=toggle-microsoft-sso]').click()
    })
    it('should show a confirmation dialog', () => {
      cy.get('[data-test=dialog-prompt-text]').should(
        'have.text',
        'The Microsoft SSO button will appear on the log in page. But people will not be able to sign on using Microsoft SSO unless the org admin for their organisation has turned it on for that organisation.'
      )
    })

    describe('when click cancel', () => {
      before(() => {
        cy.get('[data-test=cancel-dialog-button]').click()
      })
      it('should still show the SSO settings are disabled', () => {
        isNotChecked('toggle-microsoft-sso')
        isNotChecked('toggle-okta-sso')
        isNotChecked('toggle-google-sso')
      })
    })

    describe('when click toggle an SSO on', () => {
      before(() => {
        cy.get('[data-test=toggle-microsoft-sso]').click()
        cy.get('[data-test=action-dialog-button]').click()
      })
      it('should show the enabled SSO setting as enabled and the other as disabled', () => {
        isChecked('toggle-microsoft-sso')
        isNotChecked('toggle-okta-sso')
        isNotChecked('toggle-google-sso')
      })

      describe('when log out', () => {
        before(() => {
          cy.get('[data-test=logout-navigation]').click()
        })
        it('should have an option to log in with Microsoft SSO', () => {
          cy.get('[data-test=microsoft-login-button]', {
            timeout: 30000,
          }).should('be.visible')
          cy.get('[data-test=okta-login-button]').should('not.exist')
          cy.get('[data-test=google-login-button]').should('not.exist')
        })
      })
      describe('when log in as an org admin', () => {
        before(() => {
          navigateToOrgDetail()
          cy.wait(3000)
          cy.get('[data-test=settings]').click()
        })
        it('should have an option to toggle Microsoft SSO', () => {
          isNotChecked('toggle-microsoft-sso')
          cy.get('[data-test=toggle-okta-sso]').should('not.exist')
          cy.get('[data-test=toggle-google-sso]').should('not.exist')
        })
        describe('when enable Microsoft SSO', () => {
          before(() => {
            cy.get('[data-test=toggle-microsoft-sso]').click()
            cy.get('[data-test=action-dialog-button]').click()
          })
          it('should have Microsoft SSO enabled', () => {
            isChecked('toggle-microsoft-sso')
          })

          describe('when sys admin disables and then re-enables Microsoft SSO', () => {
            before(() => {
              navigateToInstanceManagement()
              isChecked('toggle-microsoft-sso')

              cy.get('[data-test=toggle-microsoft-sso]').click()
              cy.backendRoute('PATCH', '/admin/instance/settings').as(
                'toggle-sso'
              )
              cy.get('[data-test=action-dialog-button]').click()
              cy.wait('@toggle-sso')
              isNotChecked('toggle-microsoft-sso')

              cy.get('[data-test=toggle-microsoft-sso]').click()
              cy.backendRoute('PATCH', '/admin/instance/settings').as(
                'toggle-sso'
              )
              cy.get('[data-test=action-dialog-button]').click()
              cy.wait('@toggle-sso')
              isChecked('toggle-microsoft-sso')
            })
            it('should have Microsoft SSO enabled', () => {
              isChecked('toggle-microsoft-sso')
            })

            describe('when log in as an org admin', () => {
              before(() => {
                navigateToOrgDetail()
                cy.wait(3000)
                cy.get('[data-test=settings]').click()
              })
              it('should have an option to toggle Microsoft SSO', () => {
                isNotChecked('toggle-microsoft-sso')
                cy.get('[data-test=toggle-okta-sso]').should('not.exist')
                cy.get('[data-test=toggle-google-sso]').should('not.exist')
              })
            })
          })
        })
      })
    })
  })
})
