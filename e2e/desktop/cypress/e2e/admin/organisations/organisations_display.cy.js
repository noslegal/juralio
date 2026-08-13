import faker from 'faker'
import { visitOrganisations } from '../../../../../helpers/admin/admin_visit_helpers'
import { createPopulatedDummyOrg } from '../../../../../helpers/organisation/organisation_api_helper'
import { createOrganisation } from '../../../../../helpers/organisation/organisation_helper'
import { getOrgRowByOrgName } from '../../../../../helpers/organisation/organisation_table_helper'

const org_name_1 = '0' + faker.name.firstName()
const org_name_2 = 'Z' + faker.name.firstName()

describe('organisations_display.cy', () => {
  describe('when navigating to the organisations page', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      visitOrganisations()
      createPopulatedDummyOrg(org_name_2)
      createOrganisation(org_name_1, true)
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.reload()
      visitOrganisations()
    })

    describe('the Organisation list', () => {
      it('should display a "Organisation" "Active Users" and "Status" header', () => {
        cy.get('[data-test=organisation-name-header]').should(
          'have.text',
          'Organisation'
        )
        cy.get('[data-test=active-accounts-header]').should(
          'have.text',
          'Active accounts'
        )
        cy.get('[data-test=status-header]').should('have.text', 'Status')
      })

      it('should display at least the expected number of Organisations', () => {
        cy.get('[data-test=organisation-list-item]')
          .its('length')
          .should('be.gt', 2)
      })

      describe('the first organisation', () => {
        before(() => {
          getOrgRowByOrgName(org_name_1)
        })
        it('should have name org_name_1', () => {
          cy.get('[data-test=organisation-name]').contains(org_name_1)
        })

        it('should have 0 active users', () => {
          cy.get('[data-test=number-of-active-accounts]').should(
            'contain.text',
            '0'
          )
        })

        it('should have "Active" status', () => {
          cy.get('[data-test=organisation-status]').should(
            'contain.text',
            'Active'
          )
        })
      })

      describe('the second organisation', () => {
        before(() => {
          getOrgRowByOrgName(org_name_2)
        })

        it('should have a name starting with org_name_2', () => {
          cy.get('[data-test=organisation-name]').should(
            'contain.text',
            org_name_2
          )
        })

        it('should have 8 active users', () => {
          cy.get('[data-test=number-of-active-accounts]').should(
            'contain.text',
            '8'
          )
        })

        it('should have "Active" status', () => {
          cy.get('[data-test=organisation-status]').should(
            'contain.text',
            'Active'
          )
        })
      })
    })
  })
})