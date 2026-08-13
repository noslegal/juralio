import faker from 'faker'
import { enableSSO } from '../../../../../helpers/admin/admin_api_helpers'
import { visitHome } from '../../../../../helpers/admin/admin_visit_helpers'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createGoogleUser,
  createMicrosoftUser,
  createOktaUser,
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

  const createMicrosoftUserr = () =>
    createMicrosoftUser(faker.internet.email().toLowerCase()).then(res => {
      msuser = res
    })

  const createOktaUserr = () =>
    createOktaUser(faker.internet.email().toLowerCase()).then(res => {
      oktauser = res
    })

  const createGoogleUserr = () =>
    createGoogleUser(faker.internet.email().toLowerCase()).then(res => {
      googleUser = res
    })

  const associateMicrosoftUserWithOrg = () =>
    sysadminAddUserToOrganisation(organisation, msuser)

  const associateOktaUserWithOrg = () =>
    sysadminAddUserToOrganisation(organisation, oktauser)

  const associateGoogleUserWithOrg = () =>
    sysadminAddUserToOrganisation(organisation, googleUser)

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
    })

    describe('when toggle Microsoft SSO off', () => {
      before(() => {
        cy.get('[data-test=toggle-microsoft-sso]').click()
      })

      describe('when there are not existing Microsoft users', () => {
        it('should show a confirmation dialog', () => {
          cy.get('[data-test=dialog-prompt-text]').should(
            'have.text',
            'By turning off this authentication method users will no longer be able to use Microsoft to log into Juralio.'
          )
        })
      })

      describe('when cancel out', () => {
        before(() => {
          cy.get('[data-test=cancel-dialog-button]').click()
        })

        it('should still show the Microsoft SSO as toggled on', () => {
          isChecked('toggle-microsoft-sso')
        })
      })

      describe('when there is an existing Microsoft user', () => {
        before(() => {
          // Add a Microsoft user to the organisation
          cy.login(orgAdmin.username)
          createMicrosoftUserr().then(associateMicrosoftUserWithOrg)
          cy.wait(5000)

          cy.login(orgAdmin.username)
          visitHome()
          navigateToOrgDetail()
          cy.wait(3000)
          cy.get('[data-test=settings]').click()

          cy.get('[data-test=toggle-microsoft-sso]').click()
        })

        it('should show a confirmation dialog warning about existing users', () => {
          cy.get('[data-test=dialog-warning-text]').should(
            'have.text',
            'There is 1 user currently logging in with Microsoft'
          )
          cy.get('[data-test=dialog-prompt-text]').should(
            'have.text',
            'Disabling this will mean they cannot log in unless you convert their accounts to log in by another method.'
          )
        })

        describe('when cancel out', () => {
          before(() => {
            cy.get('[data-test=cancel-dialog-button]').click()
          })

          it('should still show the Microsoft SSO as toggled on', () => {
            isChecked('toggle-microsoft-sso')
          })
        })

        describe('when there is an existing Microsoft user', () => {
          before(() => {
            // Add a Microsoft user to the organisation
            cy.login(orgAdmin.username)
            createMicrosoftUserr().then(associateMicrosoftUserWithOrg)
            cy.wait(5000)

            cy.login(orgAdmin.username)
            visitHome()
            navigateToOrgDetail()
            cy.wait(3000)
            cy.get('[data-test=settings]').click()

            cy.get('[data-test=toggle-microsoft-sso]').click()
          })

          it('should show a confirmation dialog warning about existing users', () => {
            cy.get('[data-test=dialog-warning-text]').should(
              'have.text',
              'There are 2 users currently logging in with Microsoft'
            )
            cy.get('[data-test=dialog-prompt-text]').should(
              'have.text',
              'Disabling this will mean they cannot log in unless you convert their accounts to log in by another method.'
            )
          })

          describe('when confirm switching off Microsoft SSO', () => {
            before(() => {
              cy.backendRoute('/organisations/**').as('updateOrg')
              cy.get('[data-test=action-dialog-button]').click()
              cy.wait('@updateOrg')
            })

            it('should show the Microsoft SSO as toggled on', () => {
              isNotChecked('toggle-microsoft-sso')
            })
          })
        })
      })
    })

    describe('when toggle Okta SSO on', () => {
      before(() => {
        cy.get('[data-test=toggle-okta-sso]').click()
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

        it('should still show the Okta SSO as toggled off', () => {
          isNotChecked('toggle-okta-sso')
        })
      })

      describe('when confirm switching on Okta SSO', () => {
        before(() => {
          cy.get('[data-test=toggle-okta-sso]').click()

          cy.backendRoute('/organisations/**').as('updateOrg')
          cy.get('[data-test=action-dialog-button]').click()
          cy.wait('@updateOrg')
        })

        it('should show the Okta SSO as toggled on', () => {
          isChecked('toggle-okta-sso')
        })
      })
    })

    describe('when toggle Okta SSO off', () => {
      before(() => {
        cy.get('[data-test=toggle-okta-sso]').click()
      })

      describe('when there are not existing Okta users', () => {
        it('should show a confirmation dialog', () => {
          cy.get('[data-test=dialog-prompt-text]').should(
            'have.text',
            'By turning off this authentication method users will no longer be able to use Okta to log into Juralio.'
          )
        })
      })

      describe('when cancel out', () => {
        before(() => {
          cy.get('[data-test=cancel-dialog-button]').click()
        })

        it('should still show the Okta SSO as toggled on', () => {
          isChecked('toggle-okta-sso')
        })
      })

      describe('when there is an existing Okta user', () => {
        before(() => {
          // Add a Okta user to the organisation
          cy.login(orgAdmin.username)
          createOktaUserr().then(associateOktaUserWithOrg)
          cy.wait(5000)

          cy.login(orgAdmin.username)
          visitHome()
          navigateToOrgDetail()
          cy.wait(3000)
          cy.get('[data-test=settings]').click()

          cy.get('[data-test=toggle-okta-sso]').click()
        })

        it('should show a confirmation dialog warning about existing users', () => {
          cy.get('[data-test=dialog-warning-text]').should(
            'have.text',
            'There is 1 user currently logging in with Okta'
          )
          cy.get('[data-test=dialog-prompt-text]').should(
            'have.text',
            'Disabling this will mean they cannot log in unless you convert their accounts to log in by another method.'
          )
        })

        describe('when cancel out', () => {
          before(() => {
            cy.get('[data-test=cancel-dialog-button]').click()
          })

          it('should still show the Okta SSO as toggled on', () => {
            isChecked('toggle-okta-sso')
          })
        })

        describe('when there are existing Okta users', () => {
          before(() => {
            // Add a Okta user to the organisation
            cy.login(orgAdmin.username)
            createOktaUserr().then(associateOktaUserWithOrg)
            cy.wait(5000)

            cy.login(orgAdmin.username)
            visitHome()
            navigateToOrgDetail()
            cy.wait(3000)
            cy.get('[data-test=settings]').click()

            cy.get('[data-test=toggle-okta-sso]').click()
          })

          it('should show a confirmation dialog warning about existing users', () => {
            cy.get('[data-test=dialog-warning-text]').should(
              'have.text',
              'There are 2 users currently logging in with Okta'
            )
            cy.get('[data-test=dialog-prompt-text]').should(
              'have.text',
              'Disabling this will mean they cannot log in unless you convert their accounts to log in by another method.'
            )
          })

          describe('when confirm switching off Okta SSO', () => {
            before(() => {
              cy.backendRoute('/organisations/**').as('updateOrg')
              cy.get('[data-test=action-dialog-button]').click()
              cy.wait('@updateOrg')
            })

            it('should show the Okta SSO as toggled on', () => {
              isNotChecked('toggle-okta-sso')
            })
          })
        })
      })
    })

    describe('when toggling Google SSO on', () => {
      before(() => {
        cy.get('[data-test=toggle-google-sso]').click()
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

        it('should still show the Google SSO as toggled off', () => {
          isNotChecked('toggle-google-sso')
        })
      })

      describe('when confirm switching on Google SSO', () => {
        before(() => {
          cy.get('[data-test=toggle-google-sso]').click()

          cy.backendRoute('/organisations/**').as('updateOrg')
          cy.get('[data-test=action-dialog-button]').click()
          cy.wait('@updateOrg')
        })

        it('should show the Google SSO as toggled on', () => {
          isChecked('toggle-google-sso')
        })
      })
    })
    describe('when toggle Google SSO off', () => {
      before(() => {
        cy.get('[data-test=toggle-google-sso]').click()
      })

      describe('when there are not existing Google users', () => {
        it('should show a confirmation dialog', () => {
          cy.get('[data-test=dialog-prompt-text]').should(
            'have.text',
            'By turning off this authentication method users will no longer be able to use Google to log into Juralio.'
          )
        })
      })

      describe('when cancel out', () => {
        before(() => {
          cy.get('[data-test=cancel-dialog-button]').click()
        })

        it('should still show the Google SSO as toggled on', () => {
          isChecked('toggle-google-sso')
        })
      })

      describe('when there is an existing Google user', () => {
        before(() => {
          // Add a Google user to the organisation
          cy.login(orgAdmin.username)
          createGoogleUserr().then(associateGoogleUserWithOrg)
          cy.wait(5000)

          cy.login(orgAdmin.username)
          visitHome()
          navigateToOrgDetail()
          cy.wait(3000)
          cy.get('[data-test=settings]').click()

          cy.get('[data-test=toggle-google-sso]').click()
        })

        it('should show a confirmation dialog warning about existing users', () => {
          cy.get('[data-test=dialog-warning-text]').should(
            'have.text',
            'There is 1 user currently logging in with Google'
          )
          cy.get('[data-test=dialog-prompt-text]').should(
            'have.text',
            'Disabling this will mean they cannot log in unless you convert their accounts to log in by another method.'
          )
        })

        describe('when cancel out', () => {
          before(() => {
            cy.get('[data-test=cancel-dialog-button]').click()
          })

          it('should still show the Google SSO as toggled on', () => {
            isChecked('toggle-google-sso')
          })
        })

        describe('when there are existing Google users', () => {
          before(() => {
            // Add a Google user to the organisation
            cy.login(orgAdmin.username)
            createGoogleUserr().then(associateGoogleUserWithOrg)
            cy.wait(5000)

            cy.login(orgAdmin.username)
            visitHome()
            navigateToOrgDetail()
            cy.wait(3000)
            cy.get('[data-test=settings]').click()

            cy.get('[data-test=toggle-google-sso]').click()
          })

          it('should show a confirmation dialog warning about existing users', () => {
            cy.get('[data-test=dialog-warning-text]').should(
              'have.text',
              'There are 2 users currently logging in with Google'
            )
            cy.get('[data-test=dialog-prompt-text]').should(
              'have.text',
              'Disabling this will mean they cannot log in unless you convert their accounts to log in by another method.'
            )
          })

          describe('when confirm switching off Google SSO', () => {
            before(() => {
              cy.backendRoute('/organisations/**').as('updateOrg')
              cy.get('[data-test=action-dialog-button]').click()
              cy.wait('@updateOrg')
            })

            it('should show the Google SSO as toggled on', () => {
              isNotChecked('toggle-google-sso')
            })
          })
        })
      })
    })
  })
})
