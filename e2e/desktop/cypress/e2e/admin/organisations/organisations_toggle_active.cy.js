import { visitOrganisations } from '../../../../../helpers/admin/admin_visit_helpers'
import { loginViaUI } from '../../../../../helpers/login/mfa_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { getOrgRowByOrgName } from '../../../../../helpers/organisation/organisation_table_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const changeOrgActiveStatus = (orgName, option = 'off', confirm = true) => {
  getOrgRowByOrgName(orgName)
  if (confirm) {
    cy.backendRoute('PATCH', '/organisations/*').as('patchOrg')
  }
  cy.get('[data-test=status-select-selection-dropdown]').eq(0).click()
  cy.get(`[data-test=status-select-${option}-option]`).click()
  if (confirm) {
    cy.get('[data-test=action-dialog-button]').click()
    cy.wait('@patchOrg')
  }
}

describe('organisations_toggle_active.cy', () => {
  let organisation, standardUser, orgAdmin

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
  })

  describe('when navigating to the organisations page', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      visitOrganisations()
    })

    describe('click active switch of organisation', () => {
      before(() => {
        changeOrgActiveStatus(organisation.name)
      })

      it('should display status as inactive', () => {
        cy.get('[data-test=organisation-status]').should(
          'contain.text',
          'Inactive'
        )
      })

      describe('when a user of the inactive organisation logs in', () => {
        before(() => {
          cy.clearUserSession()
          loginViaUI(standardUser.username)
        })

        it('should re-direct the user to the home page', () => {
          cy.url().should('contain', '/#/login')
        })
      })
    })

    describe('click active switch off organisation', () => {
      before(() => {
        cy.login('sysadmin@juralio.com', 'Password1Password1$')
        visitOrganisations()
        changeOrgActiveStatus(organisation.name, 'on')
      })

      it('should display status as active', () => {
        cy.get('[data-test=organisation-status]').should(
          'contain.text',
          'Active'
        )
      })

      describe('when a user of the active organisation logs in', () => {
        before(() => {
          cy.clearUserSession()
          loginViaUI(standardUser.username)
        })

        it('should re-direct the user to the home page', () => {
          cy.url().should('contain', '/#/home')
        })
      })
    })
  })
})
