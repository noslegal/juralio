import {
  setupClientCostsSnapshot,
  createClientProjectionSnapshot,
} from '../../../../../helpers/costs/costs_helper'

/*
Purpose: Cover retiring a projection from the client costs view, and how the
dashboard displays retired vs active projections.

A snapshot projection's options menu (ProjectionHeaderOptionsMenu) has a Retire
action, enabled when the snapshot is retirable and the view isn't read-only (the
full client view qualifies). Retiring confirms via the global confirmation
dialog, PATCHes the snapshot to is_retired, and refreshes the dashboard — retired
projections are then hidden unless "Show retired projections" is toggled on,
where they render with a "Retired" status chip.

Covers two scenarios:
  1. Retiring the only projection — it drops out of the default view entirely.
  2. Retiring one of two projections — the other stays, and toggling show-retired
     shows both with the correct Finalised / Retired statuses.


Date created: 10/06/26
*/

describe('retire_client_costs_projection.cy', () => {
  describe('Retiring the only projection', () => {
    let adminUser, matter

    before(() => {
      setupClientCostsSnapshot().then(ctx => {
        adminUser = ctx.adminUser
        matter = ctx.matter
      })
    })

    before(() => {
      cy.login(adminUser)
      cy.visit(`/#/matter/${matter.id}/costs`)
      cy.wait(2000)
    })

    it('should show a Finalised projection with a retire option', () => {
      cy.get('[data-test=projection-status-chip]').should(
        'contain.text',
        'Finalised'
      )
      cy.get('[data-test=options-button]').first().click()
      cy.get('[data-test=retire-option]').should('not.be.disabled')
    })

    it('should retire the projection after confirming the dialog', () => {
      cy.get('[data-test=retire-option]').click()
      cy.get('[data-test=juralio-dialog]').should(
        'contain.text',
        'Retire this projection?'
      )
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(1500)
      // Retired projections are hidden by default; the only one is now gone and
      // the show-retired toggle has appeared.
      cy.get('[data-test=options-button]').should('not.exist')
      cy.get('[data-test=show-retired-toggle]').should('exist')
    })

    it('should display the projection as Retired when show-retired is toggled', () => {
      cy.get('[data-test=show-retired-toggle]').click({ force: true })
      cy.get('[data-test=projection-status-chip]').should(
        'contain.text',
        'Retired'
      )
    })
  })

  describe('Retiring one of two projections', () => {
    let adminUser, matter, task

    before(() => {
      setupClientCostsSnapshot()
        .then(ctx => {
          adminUser = ctx.adminUser
          matter = ctx.matter
          task = ctx.task
        })
        .then(() =>
          // second snapshot on a non-overlapping period
          createClientProjectionSnapshot(adminUser, matter, task, {
            startDate: new Date(2021, 1, 1),
            endDate: new Date(2021, 11, 1),
          })
        )
    })

    before(() => {
      cy.login(adminUser)
      cy.visit(`/#/matter/${matter.id}/costs`)
      cy.wait(2000)
    })

    it('should display both projections as Finalised', () => {
      cy.get('[data-test=projection-status-chip]').should('have.length', 2)
      cy.get('[data-test=projection-status-chip]').each($chip =>
        cy.wrap($chip).should('contain.text', 'Finalised')
      )
    })

    it('should hide only the retired projection from the default view', () => {
      cy.get('[data-test=options-button]').first().click()
      cy.get('[data-test=retire-option]').click()
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(1500)
      // Only the remaining Finalised projection shows; the toggle has appeared.
      cy.get('[data-test=projection-status-chip]')
        .should('have.length', 1)
        .and('contain.text', 'Finalised')
      cy.get('[data-test=show-retired-toggle]').should('exist')
    })

    it('should show both statuses when show-retired is toggled on', () => {
      cy.get('[data-test=show-retired-toggle]').click({ force: true })
      cy.get('[data-test=projection-status-chip]').should('have.length', 2)
      cy.contains('[data-test=projection-status-chip]', 'Finalised').should(
        'exist'
      )
      cy.contains('[data-test=projection-status-chip]', 'Retired').should(
        'exist'
      )
    })
  })
})
