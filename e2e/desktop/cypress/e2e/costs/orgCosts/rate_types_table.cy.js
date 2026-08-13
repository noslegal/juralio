/*
Purpose: rate types table functions

Test flow:  This test create an org and sets up a basic org cost structure then logging in with a user with access to
the rate types table 



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

describe('rate_types_table.cy', () => {
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
        createUser('', true, false, {
          roles: ['ROLE_MATTER_CREATOR'],
        }).then(u => {
          matterCreatorUser = u
          sysadminAddUserToOrganisation(org, matterCreatorUser)
        })
      })
    })
  })

  describe('when access org costs after setting up the data and going to the rate types table', () => {
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
      cy.get('[data-test=ftueSkipButton]').click()
      cy.get('.MuiTabs-list > [tabindex="-1"]').click()
      cy.get('[data-test=rate-types]').should('exist')
      cy.get('[data-test=rate-types]').click()
      cy.get('[data-test=rate-type-table]').should('exist')
    })
  })
})
