import faker from 'faker'
import {
  visitGlobalUsers,
  visitOrganisations,
} from '../../../../../helpers/admin/admin_visit_helpers'

describe('sysadmin_global_users_create_user_with_and_without_org.cy', () => {
  let juralioUserWithOrgInContext = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email().toLowerCase(),
  }

  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    visitGlobalUsers()
  })

  describe('when creating a user in context', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      visitOrganisations()
      cy.backendRoute('/organisations/**').as('orgFetch')
      cy.get('[data-test=organisation-name]').eq(0).click()
      cy.wait(5000)
      cy.get('[data-test=fab-button]').click()
      cy.get('[data-test=create-user-flow-dialog-button]', {
        timeout: 30000,
      }).click({ timeout: 30000 })
      cy.wait(5000)
    })
    it('should populate the org', () => {
      cy.get('[data-test=organisation]').should('not.contain', 'None')
      cy.get('[data-test=no-org-warning]').should('not.exist')
    })
    describe('when creating the user', () => {
      before(() => {
        cy.get('[data-test=email]').type(
          `${juralioUserWithOrgInContext.email}{enter}`
        )
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
        // cy.get('[data-test=action-dialog-button]').click()
        // cy.wait(2000)

        cy.get('[data-test=search-button]').click({ timeout: 30000 })
        cy.get('[data-test=Search]')
          .type(juralioUserWithOrgInContext.email)
      })
      it('should exist in the org', () => {
        cy.get('[data-rowindex=0] [data-colindex=0]').should(
          'contain.text',
          juralioUserWithOrgInContext.email
        )
      })
    })
  })
})
