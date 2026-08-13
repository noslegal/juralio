import VisitHelpers from '../matterprojects/visit_helpers'
import { getOrgRowByOrgName } from './organisation_table_helper'

const visitHelpers = new VisitHelpers()

export const createOrganisation = (name, commit) => {
  cy.wait(1000)
  cy.get('[data-test=fab-button]').click()
  cy.wait(1000)
  cy.get('[data-test=create-organisation-button]').click()
  cy.wait(1000)
  cy.get('[data-test=dialog-header-title-text]')

  cy.backendRoute('POST', '/organisations').as('createOrganisation')

  if (commit) {
    cy.focused().type(name).type('{ENTER}')
  } else {
    cy.focused().type(name)
    cy.get('[data-test=cancel-dialog-button]').click()
  }

  if (commit) {
    cy.wait('@createOrganisation')
  }
}

export const checkAdminsAndUsersCountInTable = params => {
  it(`should have ${params.expectedAdminCount} admins`, () => {
    getOrgRowByOrgName(params.org).within(() =>
      cy
        .get('[data-test=number-of-orgadmins]')
        .should('have.text', params.expectedAdminCount.toString())
    )
  })
  it(`should have ${params.expectedUserCount} member users`, () => {
    getOrgRowByOrgName(params.org).within(() =>
      cy
        .get('[data-test=number-of-members]')
        .should('have.text', params.expectedUserCount.toString())
    )
  })
}

export const turnOnSSO = () => {
  visitHelpers.visitOrgUsers()
  cy.wait(3000)
  cy.get('[data-test=settings]').click()
  cy.get('[data-test=toggle-microsoft-sso]').click()
  cy.get('[data-test=action-dialog-button]').click()
  cy.get('[data-test=toggle-okta-sso]').click()
  cy.get('[data-test=action-dialog-button]').click()
  cy.get('[data-test=toggle-google-sso]').click()
  cy.get('[data-test=action-dialog-button]').click()
  cy.get('[data-test=accounts]').click()
}
