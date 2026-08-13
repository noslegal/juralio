import { setupClientCostsMatter } from '../../../../../helpers/costs/costs_helper'

/*
Purpose: Drive the client fixed-fee SETUP FORM (FixedFeeSetup wizard) end to end,
covering its inputs — in particular the two rate sources: basing rates on an
existing org rate table vs entering a manual rate table.

Client costs only support fixed-fee pricing (other pricing types are advisor
side), so both scenarios use a fixed fee and differ only in the rate source.

Wizard steps: 0 period+currency → 1 fee + out-of-scope + rate source → 2 scope
review → 3 final review/confirm. Step 0 dates are pre-filled in the fresh flow,
so only currency is set there; continue is gated on currency (step 0) and a fee
amount (step 1). Answering out-of-scope reveals the rate-source picker.


Date created: 10/06/26
*/

describe('client_costs_setup_form.cy', () => {
  describe('Fixed fee based on an existing org rate table', () => {
    let adminUser, matter

    before(() => {
      setupClientCostsMatter().then(ctx => {
        adminUser = ctx.adminUser
        matter = ctx.matter
      })
    })

    before(() => {
      cy.login(adminUser)
      cy.visit(`/#/matter/${matter.id}/costs`)
      cy.wait(2000)
    })

    it('should create a projection using an existing rate card', () => {
      cy.get('[data-test=client-costs-get-started]').click()

      // Step 0 — period dates are pre-filled; set the currency and advance.
      cy.get('[data-test=fixed-fee-currency]').click()
      cy.contains('[role=option]', 'GBP').click()
      cy.get('[data-test=wizard-continue]').should('not.be.disabled').click()

      // Step 1 — a fee amount is required before continuing.
      cy.get('[data-test=wizard-continue]').should('be.disabled')
      cy.get('[data-test=fixed-fee-amount]').type('50000')
      // Answering out-of-scope reveals the rate-source picker.
      cy.get('[data-test=oos-approval-no]').click()
      cy.get('[data-test=rate-source-card]').click()
      cy.get('[data-test=rate-card-select]').click()
      cy.contains('[role=option]', 'Example').click()
      cy.get('[data-test=wizard-continue]').should('not.be.disabled').click()

      // Step 2 — scope review (no required input).
      cy.get('[data-test=wizard-continue]').click()

      // Step 3 — confirm.
      cy.get('[data-test=wizard-confirm]').click()
      cy.wait(3000)
      cy.get('[data-test=projection-status-chip]').should(
        'contain.text',
        'Finalised'
      )
    })
  })

  describe('Fixed fee using a manual rate table', () => {
    let adminUser, matter

    before(() => {
      setupClientCostsMatter().then(ctx => {
        adminUser = ctx.adminUser
        matter = ctx.matter
      })
    })

    before(() => {
      cy.login(adminUser)
      cy.visit(`/#/matter/${matter.id}/costs`)
      cy.wait(2000)
    })

    it('should create a projection entering manual rates', () => {
      cy.get('[data-test=client-costs-get-started]').click()

      // Step 0 — currency.
      cy.get('[data-test=fixed-fee-currency]').click()
      cy.contains('[role=option]', 'GBP').click()
      cy.get('[data-test=wizard-continue]').should('not.be.disabled').click()

      // Step 1 — fee + manual rates.
      cy.get('[data-test=fixed-fee-amount]').type('75000')
      cy.get('[data-test=oos-approval-no]').click()
      cy.get('[data-test=rate-source-manual]').click()
      // Manual rate rows seed from the org grades; set the first one.
      cy.get('[data-test=manual-rate-input]').first().type('250')
      cy.get('[data-test=wizard-continue]').should('not.be.disabled').click()

      // Step 2 — scope review.
      cy.get('[data-test=wizard-continue]').click()

      // Step 3 — confirm.
      cy.get('[data-test=wizard-confirm]').click()
      cy.wait(3000)
      cy.get('[data-test=projection-status-chip]').should(
        'contain.text',
        'Finalised'
      )
    })
  })

  // Step gating, conditional UI and field validation across the wizard. The
  // `it`s run in order against a single open wizard (no reload between them),
  // so each builds on the previous step's state.
  describe('Validation and interactions across the wizard', () => {
    let adminUser, matter

    before(() => {
      setupClientCostsMatter().then(ctx => {
        adminUser = ctx.adminUser
        matter = ctx.matter
      })
    })

    before(() => {
      cy.login(adminUser)
      cy.visit(`/#/matter/${matter.id}/costs`)
      cy.wait(2000)
      cy.get('[data-test=client-costs-get-started]').click()
    })

    it('step 0 gates continue until a currency is chosen', () => {
      cy.get('[data-test=wizard-continue]').should('be.disabled')
      cy.contains('Select a currency to continue').should('be.visible')
      cy.get('[data-test=fixed-fee-currency]').click()
      cy.contains('[role=option]', 'GBP').click()
      cy.contains('Select a currency to continue').should('not.exist')
      cy.get('[data-test=wizard-continue]').should('not.be.disabled').click()
    })

    it('step 1 gates continue until a valid fee amount is entered', () => {
      // The previous test only queues the step-0 continue click; saveStep0
      // advances to step 1 asynchronously after its network calls. Wait for the
      // step-1 fee field (empty) to mount before asserting the gate — the
      // continue button is disabled both here AND on step 0 while saving, so it
      // can't be used to detect arrival on step 1, which races the hint check.
      cy.get('[data-test=fixed-fee-amount]')
        .should('be.visible')
        .and('have.value', '')
      cy.get('[data-test=wizard-continue]').should('be.disabled')
      // Non-numeric input is stripped, so it cannot satisfy the gate.
      cy.get('[data-test=fixed-fee-amount]').type('abc')
      cy.get('[data-test=wizard-continue]').should('be.disabled')
      cy.get('[data-test=fixed-fee-amount]').type('50000')
      cy.contains('Enter an amount to continue').should('not.exist')
      cy.get('[data-test=wizard-continue]').should('not.be.disabled')
    })

    it('reveals post-approval pricing only when written approval is required', () => {

      // "Yes" surfaces the post-approval pricing options.
      cy.get('[data-test=oos-approval-yes]').click()
      cy.contains('Post-approval pricing of extra work').should('be.visible')
      cy.contains('Fee must be expressly agreed').should('be.visible')
      cy.contains('Default to hourly rates').should('be.visible')
      cy.contains('Custom').should('be.visible')
    })

    it('shows a 300-char limited notes field for custom post-approval pricing', () => {
      cy.contains('Custom').click()
      cy.get('textarea')
        .filter('[maxlength="300"]')
        .should('exist')
        .type('Extra work billed at the agreed hourly rates.')
    })

    it('hides post-approval pricing when written approval is not required', () => {
      cy.get('[data-test=oos-approval-no]').click()
      cy.contains('Post-approval pricing of extra work').should('not.exist')
      // The hourly-rates / rate-source section stays visible for either answer.
      cy.contains('Hourly rates for out-of-scope work').should('be.visible')
    })

    it('toggles the rate source between an existing card and a manual table', () => {
      cy.get('[data-test=rate-source-card]').click()
      cy.get('[data-test=rate-card-select]').should('be.visible')
      cy.get('[data-test=manual-rate-input]').should('not.exist')

      cy.get('[data-test=rate-source-manual]').click()
      cy.get('[data-test=manual-rate-input]').should('exist')
      cy.get('[data-test=rate-card-select]').should('not.exist')
    })

    it('advances through scope to a review step where confirm is enabled', () => {
      cy.get('[data-test=manual-rate-input]').first().type('250')
      cy.get('[data-test=wizard-continue]').should('not.be.disabled').click()

      // Step 2 — scope review (no required input).
      cy.get('[data-test=wizard-continue]').click()

      // Step 3 — final review: confirm is available and back navigation works.
      cy.get('[data-test=wizard-confirm]').should('not.be.disabled')
      cy.get('[data-test=wizard-back]').should('be.visible')
    })
  })
})
