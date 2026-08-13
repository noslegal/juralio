import { setupClientCostsSnapshot } from '../../../../../helpers/costs/costs_helper'

/*
Purpose: Cover the new "download client costs" flow.

A snapshot projection renders a ClientProjectionCard with an options menu
(ProjectionHeaderOptionsMenu) whose "Download" action opens the
ClientCostsExportDialog. The dialog lets the user pick which sheets to include
(Projection Summary / Scope / Assumptions / Out-of-Scope Terms) and generates an
.xlsx entirely client-side (no backend endpoint).

Test flow:
  1. setupClientCostsSnapshot() builds (via API) a matter on the client costs
     view with a finalised snapshot — no UI clicks. (Creating a snapshot through
     the UI is covered separately by create_snapshot.cy.js.)
  2. Open the snapshot card's options menu and click Download.
  3. Assert the export dialog, default sheet selection, and that clearing all
     sheets disables the action.
  4. Confirm the download.

Routing note: the download card (ClientCostsDashboard -> ClientProjectionCard)
only renders inside ClientMatterCostsContainer. MatterCostsContainer routes
there only when the viewing user is a client in an internal group, OR an advisor
AND the matter has an internal client group. The helper's admin user is the
matter's advisor (internal users share the org default group, positioned as
Advisor on creation) and the helper attaches an internal client group, so the
read-only advisor view still renders the options menu for snapshots — making the
download reachable.


Date created: 10/06/26
*/

describe('download_client_costs.cy', () => {
  let adminUser, matter

  before(() => {
    // Defaults already seed a fixed fee (summary sheet), a deliverable and a few
    // assumptions; add out-of-scope terms so every export sheet has data.
    setupClientCostsSnapshot({
      outOfScope: { writtenApprovalNeeded: true, reason: 'agreed' },
    }).then(ctx => {
      adminUser = ctx.adminUser
      matter = ctx.matter
    })
  })

  describe('Downloading a client costs projection', () => {
    before(() => {
      cy.login(adminUser)
      cy.visit(`/#/matter/${matter.id}/costs`)
      cy.wait(2000)
    })

    it('should open the export dialog from the snapshot options menu', () => {
      // Three-dot menu on the snapshot projection card header
      cy.get('[data-test=options-button]').first().click()
      cy.get('[data-test=download-option]').click()

      cy.get('[data-test=juralio-dialog]').should('be.visible')
      cy.get('[data-test=juralio-dialog]').should(
        'contain.text',
        'Download projection data'
      )
    })

    it('should default all sheet checkboxes to selected', () => {
      cy.get('[data-test=summary-checkbox]').find('input').should('be.checked')
      cy.get('[data-test=scope-checkbox]').find('input').should('be.checked')
      cy.get('[data-test=assumptions-checkbox]')
        .find('input')
        .should('be.checked')
      cy.get('[data-test=out-of-scope-checkbox]')
        .find('input')
        .should('be.checked')
    })

    it('should disable the download action when no sheets are selected', () => {
      cy.get('[data-test=summary-checkbox]').click()
      cy.get('[data-test=scope-checkbox]').click()
      cy.get('[data-test=assumptions-checkbox]').click()
      cy.get('[data-test=out-of-scope-checkbox]').click()
      cy.get('[data-test=action-dialog-button]').should('be.disabled')
    })

    it('should download the selected sheets and close the dialog', () => {
      cy.get('[data-test=summary-checkbox]').click()
      cy.get('[data-test=action-dialog-button]')
        .should('not.be.disabled')
        .click()
      cy.get('[data-test=juralio-dialog]').should('not.exist')
    })
  })
})
