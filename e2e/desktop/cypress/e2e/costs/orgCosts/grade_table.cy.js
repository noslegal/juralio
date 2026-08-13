/*
Purpose: Grade table functions

Test flow:  This test create an org and sets up a basic org cost structure then logging in with a user with access and
addding a new grade to the table editing it changing its group then deleting it 



Date created: 12/11/24
*/

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

describe('grade_table.cy', () => {
  let orgAdminUser, matterCreatorUser
  let org, projectionPeriod, grades, rateTypes, rtd, matter, task, snapshot
  //set up
  before(() => {
    createOrganisation('', false).then(o => {
      org = o.body
      createUser('', true, false, {
        roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
      }).then(u => {
        orgAdminUser = u
        sysadminAddUserToOrganisation(org, orgAdminUser)
        const url = `${Cypress.env(
          'serverRootBaseUrl'
        )}/api/admin/instance/settings`
        cy.apiSpecRequest({
          url,
          method: 'PATCH',
          body: {
            enablePaymentPlatformIntegration: false,
          },
        })
        createUser('', true, false, {
          roles: ['ROLE_MATTER_CREATOR'],
        }).then(u => {
          matterCreatorUser = u
          sysadminAddUserToOrganisation(org, matterCreatorUser)
        })
      })
    })
  })

  describe('when access org costs after setting up the data and navigating to grade table', () => {
    before(() => {
      cy.login(orgAdminUser)
      enableCosts().then(res => {
        expect(res.status).to.eq(200)
        enableOrgCosts(org.id).then(res => {
          expect(res.status).to.eq(200)
          setupOrgLevelCosts(orgAdminUser, org, rtd, grades, rateTypes)
        })
      })
    })
    it('should display the table', () => {
      cy.login(orgAdminUser)
      cy.visit('/#/organisation/costs')
      cy.wait(3000)
      cy.get('body').type('{esc}')
      cy.get('body').then($body => {
        if ($body.find('[data-test=ftueSkipButton]').length) {
          cy.get('[data-test=ftueSkipButton]').click()
        }
      })
      // Org's own cost building blocks (grades) live under the Advisor tab
      cy.contains('button[role=tab]', 'Advisor').click()
      cy.wait(1000)
      cy.get('[data-test=grades]').should('exist')
      cy.get('[data-test=grades]').click()
      cy.get('[data-test=grade-table]').should('exist')
      cy.get('[data-test=grade-table]')
        .invoke('outerHeight')
        .should('be.lt', 910)
    })

    it('should be able to add a new grade', () => {
      cy.get('[data-test=add-new-grade]').click()
      cy.get('.dvn-scroller').click(750, 750, { force: true })
      cy.get('body').type('5')
      cy.get('body').type('{enter}')
      cy.get('[data-test=grade-table]')
        .invoke('outerHeight')
        .should('be.gt', 910)
    })

    it('should be able to edit and select a grade category', () => {
      cy.get('.dvn-scroller').click(300, 750, { force: true })
      cy.get('[data-test=grade-category-menu]').should('exist')
    })
  })
})
