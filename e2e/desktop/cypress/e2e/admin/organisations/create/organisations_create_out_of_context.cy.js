import {
  visitGlobalUsers,
  visitOrganisationDetail,
  visitOrganisations,
} from '../../../../../../helpers/admin/admin_visit_helpers'
import { createOrganisation } from '../../../../../../helpers/organisation/organisation_helper'
import HttpStatus from 'http-status-codes'

const org_name_1 = 'A' + new Date().toISOString()

describe('organisations_create_out_of_context.cy', () => {
  describe('the organisations page', () => {
    before(() => {
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
        cy.login('sysadmin@juralio.com', 'Password1Password1$')

        visitOrganisations()
      })
    })

    describe('when an organisation is created out of context', () => {
      before(() => {
        createOrganisation(org_name_1, true)
        visitGlobalUsers()
        visitOrganisationDetail(org_name_1)
      })

      it('should navigate to the organisations page and display the new item', () => {
        cy.get('[data-test=read-field]').contains(org_name_1)
      })

      it('should have 0 admin by default', () => {
        cy.get('[data-test=user-count-summary]').should(
          'contains.text',
          'no active individual accounts'
        )
      })
    })

    describe('when creation of an organisation is cancelled', () => {
      before(() => {
        cy.login('sysadmin@juralio.com', 'Password1Password1$')
        visitGlobalUsers()
        createOrganisation('NEVER_CREATED', false)
      })

      it('should not display organisations page', () => {
        cy.url().should('not.contain', 'organisations')
      })
    })
  })
})
