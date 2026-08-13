import {
  enableCosts,
  enableOrgCosts,
} from '../../../../../helpers/admin/admin_api_helpers'
import { setupOrgLevelCosts } from '../../../../../helpers/costs/costs_helper'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('add_new_grade.cy', () => {
  let orgAdminUser, matterCreatorUser
  let org, grades, rateTypes, rtd
  before(() => {
    createOrganisation('', false).then(o => {
      org = o.body
      createUser('', true, false, {
        roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
      }).then(u => {
        orgAdminUser = u
        sysadminAddUserToOrganisation(org, orgAdminUser)
        createUser('', true, false, {
          roles: ['ROLE_MATTER_CREATOR'],
        }).then(u => {
          matterCreatorUser = u
          sysadminAddUserToOrganisation(org, matterCreatorUser)
        })
        cy.login(orgAdminUser)
        enableCosts().then(res => {
          expect(res.status).to.eq(200)
          enableOrgCosts(org.id).then(res => {
            expect(res.status).to.eq(200)
            setupOrgLevelCosts(orgAdminUser, org, rtd, grades, rateTypes)
          })
        })
      })
    })
  })

  describe('When adding a new grade and using it in the advisor rate table', () => {
    before(() => {
      // Create a new grade "TEST" via the API. The advisor grade table is a
      // glide-data-grid canvas, and naming a new grade via synthetic
      // click-and-type is unreliable under Cypress, so we seed the grade
      // directly and then verify it is usable in the advisor rate table.
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
        method: 'GET',
      })
        .its('body')
        .then(positions => {
          const advisor = positions.find(p => p.name === 'Advisor')
          cy.request({
            url: `${Cypress.env('serverBaseUrl')}/gradecategory`,
            method: 'POST',
            body: { position: advisor.id },
          })
            .its('body')
            .then(categories => {
              cy.request({
                url: `${Cypress.env('serverBaseUrl')}/grade`,
                method: 'POST',
                body: {
                  name: 'TEST',
                  grade_idx: 99,
                  categoryId: categories[0].id,
                },
              }).then(res => {
                expect(res.status).to.eq(200)
                expect(res.body.name).to.eq('TEST')
              })
            })
        })
      // Open the advisor rate table and start adding the new grade to it
      cy.visit('/#/organisation/costs')
      cy.wait(3000)
      // The "Get started with organisation admin" FTUE walkthrough appears on
      // first visit and covers the page; close it (X → skip completely).
      cy.get('[data-test=close-icon]', { timeout: 15000 }).click()
      cy.get('[data-test=ftueSkipButton]').click()
      // Rate tables are the org's own cost building blocks, under the Advisor tab
      cy.contains('button[role=tab]', 'Advisor').click()
      cy.wait(1000)
      cy.get('[data-test="rate-tables"]').click()
      cy.get('[data-test="rate-table-card"]').eq(0).click()
      cy.get('[data-test="edit-rates-toggle"]').click()
      cy.get('[data-test="add-grade-button"]').click()
      cy.get('[data-test="grade-dropdown"]').click()
      cy.get('[data-test="TEST"]').click()
      cy.get('[data-test="Break-even"]').click()
      cy.get('[data-test="Standard"]').click()
      cy.get('[data-test="new-rate"]').click()
      cy.get('body').type('50')
    })
    it('should save the new grade against the advisor rate table', () => {
      cy.intercept('*/rates/bulk').as('saveRates')
      cy.get('[data-test="action-dialog-button"]').click()
      cy.wait('@saveRates').should(({ request, response }) => {
        expect(request.method).to.equal('POST')
        expect(response.statusCode).to.eq(200)
      })
    })
  })
})
