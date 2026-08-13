import { visitOrganisationDetail } from '../../../../../helpers/admin/admin_visit_helpers'
import { createOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'

describe('organisations_mfa_configuration.cy', () => {
  let organisation, standardUser, orgAdmin

  before(() => {
    const MFA_ENABLED = true
    createOrganisation('test', MFA_ENABLED).then(_organisation => {
      organisation = _organisation.body
    })
  })

  describe('when navigating to the organisations details page', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      visitOrganisationDetail(organisation.name)
    })

    describe('when open the organisation settings dialog', () => {
      before(() => {
        cy.get('[data-test=org-settings-button]').click()
      })

      it('should have the MFA option enabled', () => {
        cy.get('[data-test=mfa-panel-switch]').should('exist')
        cy.get('[data-test=mfa-panel-switch]')
          .find('input')
          .should('be.checked')
      })

      describe('when disable the MFA option and click confirm', () => {
        before(() => {
          cy.get('[data-test=mfa-panel-switch]').click()
          cy.get('[data-test=action-dialog-button]').click()
        })

        it('should show the organisation as not having MFA on', () => {
          cy.get('[data-test=org-settings-button]').click()
          cy.get('[data-test=mfa-panel-switch]').should('exist')
          cy.get('[data-test=mfa-panel-switch]')
            .find('input')
            .should('not.be.checked')
        })
      })
    })
  })
})
