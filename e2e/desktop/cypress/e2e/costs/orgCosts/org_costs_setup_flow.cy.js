import { disableSSO } from '../../../../../helpers/admin/admin_api_helpers'
import { visitOrganisationDetail } from '../../../../../helpers/admin/admin_visit_helpers'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

/*
Purpose: Tests costs setup flow 

Test flow:  This logs in as sys admin, switches on costs and checks that on the individual org costs toggle is now available 
            sys-admin then toggles costs for the org a org admin then logs in to see if the costs area is now available to them. Runs
            through the basic flow to create a costs card 



Date created: 12/11/24
*/

describe('org_costs_setup_flow.cy', () => {
  let organisation, standardUser, orgAdmin

  const isChecked = dataTest =>
    cy.get(`[data-test=${dataTest}]`).find('input').should('be.checked')

  const isNotChecked = dataTest =>
    cy.get(`[data-test=${dataTest}]`).find('input').should('not.be.checked')

  const navigateToInstanceManagement = () => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    const url = `${Cypress.env(
      'serverRootBaseUrl'
    )}/api/admin/instance/settings`
    cy.apiSpecRequest({
      url,
      method: 'PATCH',
      body: {
        enablePaymentPlatformIntegration: false,
        costsEnabled: false,
      },
    })
    cy.visit('/#/')
    cy.get('[data-test=instance-management]').click()
  }

  before(() => {
    const createStandardUser = () =>
      createUser(undefined, true, false).then(user => (standardUser = user))

    const createOrgAdmin = () =>
      createUser(undefined, true, false, { roles: ['ROLE_ORG_ADMIN'] }).then(
        user => (orgAdmin = user)
      )
    const associateStandardUserWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, standardUser)

    const associateOrgAdminWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, orgAdmin)

    createOrganisation('test', false)
      .then(_organisation => {
        organisation = _organisation.body
      })
      .then(createStandardUser)
      .then(createOrgAdmin)
      .then(associateStandardUserWithOrg)
      .then(associateOrgAdminWithOrg)
      .then(disableSSO)
  })

  before(navigateToInstanceManagement)

  describe('when go to instance management tab', () => {
    it('should show the costs functionality as disabled', () => {
      isNotChecked('costs-toggle')
    })
  })

  describe('when click toggle costs on', () => {
    describe('when click toggle costs on', () => {
      before(() => {
        cy.get('[data-test=costs-toggle]').click()
      })
      it('should show the enabled costs toggle', () => {
        isChecked('costs-toggle')
      })
      it('should allow for costs to be enabled at org level', () => {
        //cy.get('[data-test=organisations]').click()
        cy.login('sysadmin@juralio.com', 'Password1Password1$')
        visitOrganisationDetail(organisation.name)
        cy.get('[data-test=org-settings-button]').click()
        isNotChecked('costs-toggle')
        cy.get('[data-test=costs-toggle]').click()
      })
      it('should have switched org costs to be enabled', () => {
        isChecked('costs-toggle')
      })
    })
  })

  describe('when log in as an org admin', () => {
    before(() => {
      cy.get('[data-test="action-dialog-button"]').click()
      cy.get('[data-test=logout-navigation]').click()
      cy.login(orgAdmin.username)
      cy.visit('/#/organisation/costs')
      cy.wait(3000)
    })
    it('should show the costs flow and appear in org header bar', () => {
      cy.get('[data-test=organisation-costs-container]').should('be.visible')
    })

    it('should allow the user to move through the flow', () => {
      cy.get('body').type('{esc}')
      cy.get('[data-test=ftueSkipButton]').click()
      cy.get('[data-test=welcome-screen]').should('exist')
      cy.get('[data-test=continue-flow]').click()
      cy.get('[data-test=explain-screen]').should('exist')
      cy.get('[data-test=continue-flow]').click()
      cy.get('[data-test=grade-table]').should('exist')
      cy.get('[data-test=continue-flow]').click()
      cy.get('[data-test=rate-type-table]').should('exist')
      cy.get('[data-test=continue-flow]').click()
      cy.get('[data-test=other-costs-table]').should('exist')
      cy.get('[data-test=continue-flow]').click()
    })

    it('should allow the user to fill out form ', () => {
      cy.get('[data-test=select-currency]').click()
      cy.get('[data-test="GBP - Pound Sterling"]').should('exist')
      cy.get('[data-test="GBP - Pound Sterling"]').click()
      cy.get('[data-test=select-location]').should('exist')
      cy.get('[data-test="any-location"]').click()
      cy.get('[data-test=select-worktype]').should('exist')
      cy.get('[data-test="any-worktype"]').click()
      cy.get('[data-test=continue-flow]').click()
      cy.wait(2000)
      cy.get('.dvn-scroller').click(900, 75, { force: true })
      for (let index = 0; index < 63; index++) {
        cy.get('body').type('5')
        cy.get('body').type('{enter}')
      }
      cy.get('[data-test=continue-flow]').click()
    })
    it('should have created a org card ', () => {
      cy.get('[data-test=rate-table-card]').should('exist')
    })
  })
})
