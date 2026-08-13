import { setupClientCostsSnapshot } from '../../../../../helpers/costs/costs_helper'
import { createOrganisationGroup } from '../../../../../helpers/organisation/organisation_api_helper'
import { createOrganisationUser } from '../../../../../helpers/users/user_api_helper'

/*
Purpose: Cover the client costs DASHBOARD (ClientCostsDashboard /
ClientProjectionCard) for the editable client view — the surface a Client-position
user in the internal group lands on once a fixed-fee projection has been
finalised.

Covers: the dashboard header, the finalised projection card (status chip,
currency, projected fees), the "set another fixed fee" action, the auto-expanded
scope / out-of-scope detail, the projection options menu (download + retire
entry points) and the live-mode toggle.

Out of scope here (covered by sibling specs): the full download dialog
(download_client_costs.cy.js), the retire confirm-and-show flow
(retire_client_costs_projection.cy.js) and read-only gating
(client_costs_readonly_advisor.cy.js).


Date created: 18/06/26
*/

describe('client_costs_dashboard.cy', () => {
  let adminUser, matter

  before(() => {
    setupClientCostsSnapshot({
      outOfScope: { writtenApprovalNeeded: true, reason: 'agreed' },
    }).then(ctx => {
      adminUser = ctx.adminUser
      matter = ctx.matter
    })
  })

  before(() => {
    cy.login(adminUser)
    cy.visit(`/#/matter/${matter.id}/costs`)
    cy.wait(3000)
  })

  it('renders the dashboard header and a finalised projection card', () => {
    cy.contains('Financial plans for this matter').should('be.visible')
    cy.get('[data-test=projection-status-chip]').should(
      'contain.text',
      'Finalised'
    )
    // Currency appears both on the card header and the projected-fees figure.
    cy.contains('GBP').should('be.visible')
  })

  it('offers the set-another-fixed-fee action when no draft is in progress', () => {
    cy.get('[data-test=add-fixed-fee]')
      .should('be.visible')
      .and('not.be.disabled')
  })

  it('auto-expands the single projection showing scope and out-of-scope detail', () => {
    cy.contains('Agreed scope').should('be.visible')
    cy.contains('Out-of-scope work').should('be.visible')
  })

  it('exposes the options menu with download and retire actions', () => {
    cy.get('[data-test=options-button]').first().click()
    cy.get('[data-test=download-option]').should('be.visible')
    cy.get('[data-test=retire-option]').should('exist')
    // Dismiss the popover before later assertions.
    cy.get('body').type('{esc}')
  })

  it('toggles live mode on the finalised snapshot', () => {
    cy.get('[data-test=live-mode-toggle]').should('exist')
    cy.get('[data-test=live-mode-toggle]').find('input').click({ force: true })
    cy.get('[data-test=projection-status-chip]').should('contain.text', 'Live')
  })

  it('edits the fixed fee in live mode and re-finalises with the updated amount', () => {
    // Live mode was switched on by the previous test (the page is shared with no
    // reload between `it`s), so the card shows the live chip and an "Edit
    // projection" pill. The snapshot was seeded with the default 50,000 fee.
    cy.get('[data-test=projection-status-chip]').should('contain.text', 'Live')
    cy.get('[data-test=projected-fees-amount]').should('contain.text', '50,000')

    // The edit pill opens the wizard in live-edit mode, which lands on the fee
    // step. Replace the amount and re-finalise.
    cy.get('[data-test=projection-expand-pill]').click()
    cy.get('[data-test=fixed-fee-amount]')
      .should('be.visible')
      .clear()
      .type('88000')
    cy.get('[data-test=wizard-confirm]').should('not.be.disabled').click()
    cy.wait(3000)

    // Back on the dashboard: the projection is finalised again and the projected
    // fees figure now reflects the updated amount.
    cy.get('[data-test=projection-status-chip]').should(
      'contain.text',
      'Finalised'
    )
    cy.get('[data-test=projected-fees-amount]').should('contain.text', '88,000')
  })
})

/*
Read-only advisor view of the SAME dashboard. An external advisor (a user in a
non-internal org group holding the Advisor position on a matter that has an
internal Client group) is routed to the read-only ClientCostsDashboard
(MatterCostsContainer rule 2). The finalised projection still renders, but every
editing affordance is gated: no set-another-fixed-fee action, no live-mode
toggle, and the options menu's retire action is disabled while download stays
available.

Setup follows the manual steps required for this scenario:
  1. Create a new EXTERNAL org group whose default position is Advisor.
  2. Create a new user and assign them to that external group.
  3. Add that user to this test's matter (team member + matter admin + costs
     access). Adding the team member auto-assigns their group the Advisor
     position (the opposite of the creator's Client group) — we do NOT patch the
     matter group position, as that flips positions and deletes the matter's
     costs data, wiping the finalised snapshot.
  4. Log in as that user and enter the costs dashboard to verify read-only mode.
setupClientCostsSnapshot provides the base: a client matter with a finalised
projection and an internal Client group (the creator is Client-positioned).
*/
describe('client_costs_dashboard.cy read-only advisor', () => {
  let org, adminUser, matter, externalGroup, advisorUser

  before(() => {
    setupClientCostsSnapshot({
      outOfScope: { writtenApprovalNeeded: true, reason: 'agreed' },
    }).then(ctx => {
      org = ctx.org
      adminUser = ctx.adminUser
      matter = ctx.matter
    })
  })

  // Step 1: create a new external group with a default position of Advisor.
  before(() => {
    cy.login(adminUser)
    cy.request({
      url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
      method: 'GET',
    })
      .its('body')
      .then(positions => {
        // The save endpoint reads positionId as an index into these positions.
        const advisorIndex = positions.findIndex(p => p.name === 'Advisor')
        return createOrganisationGroup(
          org.id,
          'External Advisors',
          false,
          advisorIndex
        )
      })
      .then(group => {
        externalGroup = group
      })
  })

  // Step 2: create a new user assigned to that external group. Runs as the org
  // admin so createOrganisationUser can POST into this org.
  before(() => {
    cy.login(adminUser)
    createOrganisationUser({
      firstname: 'External',
      lastname: 'Advisor',
      username: `external.advisor${new Date()
        .getTime()
        .toString()
        .slice(8)}@juralio.com`,
      group: externalGroup.id,
    }).then(user => {
      advisorUser = user
    })
  })

  // Step 3: add the user to the matter (team + matter admin + costs access).
  // Adding the team member auto-creates the external group's matter position as
  // the OPPOSITE of the existing group (MatterGroupPositionService.create) — the
  // creator's internal group holds Client, so the external group lands on
  // Advisor. We deliberately DON'T PATCH /matterGroupPosition: that endpoint
  // flips every group's position AND deletes all costs data for the matter,
  // which would wipe the finalised snapshot built above.
  before(() => {
    cy.login(adminUser)
    // Use the `users` (array) form: only this branch of the controller calls
    // matterGroupPositionService.create() to add the user's group to the matter
    // (and assign it the Advisor position). The singular `user` form skips it.
    cy.request({
      url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
        matter.id
      }/teammembers`,
      method: 'POST',
      body: { matter: matter.id, users: [advisorUser.id] },
    })
    cy.request({
      url: `${Cypress.env('serverBaseUrl')}/admin/matter/${matter.id}/matters`,
      method: 'POST',
      body: { matter: matter.id, user: advisorUser.id },
    })
    cy.request({
      url: `${Cypress.env('serverBaseUrl')}/admin/matter/${matter.id}/costs`,
      method: 'POST',
      body: { matter: matter.id, id: advisorUser.id },
    })
  })

  // Step 4: log in as the advisor and enter the costs dashboard.
  before(() => {
    cy.login(advisorUser)
    cy.visit(`/#/matter/${matter.id}/costs`)
    cy.wait(3000)
  })

  it('renders the dashboard header and the finalised projection card', () => {
    cy.contains('Financial plans for this matter').should('be.visible')
    cy.get('[data-test=projection-status-chip]').should(
      'contain.text',
      'Finalised'
    )
    cy.contains('GBP').should('be.visible')
  })

  it('hides the set-another-fixed-fee action', () => {
    cy.get('[data-test=add-fixed-fee]').should('not.exist')
  })

  it('hides the live-mode toggle on the finalised snapshot', () => {
    cy.get('[data-test=live-mode-toggle]').should('not.exist')
  })

  it('still auto-expands the projection showing scope and out-of-scope detail', () => {
    cy.contains('Agreed scope').should('be.visible')
    cy.contains('Out-of-scope work').should('be.visible')
  })

  it('keeps download available but disables retire in the options menu', () => {
    cy.get('[data-test=options-button]').first().click()
    cy.get('[data-test=download-option]')
      .should('be.visible')
      .and('not.be.disabled')
    cy.get('[data-test=retire-option]').should('be.disabled')
    // Dismiss the popover before later assertions.
    cy.get('body').type('{esc}')
  })
})
