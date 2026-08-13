import faker from 'faker'
import { visitOrganisations } from '../../../../../helpers/admin/admin_visit_helpers'
import { createOrganisation } from '../../../../../helpers/organisation/organisation_helper'
import { getOrgRowByOrgName } from '../../../../../helpers/organisation/organisation_table_helper'

const org_name_2 = 'Z' + faker.name.firstName()

describe('organisations_delete_restore.cy', () => {
  describe('when navigating to the organisations page', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      visitOrganisations()
      createOrganisation(org_name_2, true)
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.reload()
      visitOrganisations()
      getOrgRowByOrgName(org_name_2)
    })

    it('should display the org with a delete button', () => {
      cy.get('[data-test=organisation-name]').should('have.text', org_name_2)
      cy.get('[data-test=delete-org-button]').should('be.visible')
    })

    describe('when clicking the delete button', () => {
      before(() => {
        cy.get('[data-test=delete-org-button]').click()
      })
      it('should display a confirmation dialog', () => {
        cy.get('[data-test=dialog-header-title-text]').should(
          'contain',
          `Delete ${org_name_2}`
        )
      })
      describe('when clicking the confirm button', () => {
        before(() => {
          cy.get('[data-test=action-dialog-button]').click()
        })
        it('should show a snackbar', () => {
          cy.get('[data-test=snackbar-message]', { timeout: 10000 })
            .should('be.visible')
            .should('contain', 'Organisation has been marked for deletion')
        })
        it('should change the org status to deletion pending and show a restore button', () => {
          cy.get('[data-test=organisation-list-item]').should(
            'contain',
            'Deletion Pending'
          )
          cy.get('[data-test=restore-deleted-org-button]').should('be.visible')
        })
      })
    })

    describe('when clicking the restore button', () => {
      before(() => {
        cy.get('[data-test=restore-deleted-org-button]').click()
      })
      it('should display a confirmation dialog', () => {
        cy.get('[data-test=dialog-header-title-text]').should(
          'contain',
          `Restore ${org_name_2}`
        )
      })
      describe('when clicking the confirm button', () => {
        before(() => {
          cy.get('[data-test=action-dialog-button]').click()
        })
        it('should show a snackbar', () => {
          cy.get('[data-test=snackbar-message]', { timeout: 10000 })
            .should('be.visible')
            .should('contain', 'Organisation has been successfully restored')
        })
        it('should change the org status to active and show a delete button', () => {
          cy.get('[data-test=organisation-list-item]').should(
            'contain',
            'Active'
          )
          cy.get('[data-test=delete-org-button]').should('be.visible')
        })
      })
    })
  })
})
