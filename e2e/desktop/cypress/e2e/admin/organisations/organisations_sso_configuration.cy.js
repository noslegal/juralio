import faker from 'faker'
import {
  visitInstanceManagement,
  visitOrganisations,
} from '../../../../../helpers/admin/admin_visit_helpers'

const org_name_1 = '0' + faker.name.firstName()
let msEnabled = false
let oktaEnabled = false
let googleEnabled = false
describe('organisations_sso_configuration.cy', () => {
  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() => {
      cy.request({
        url: 'http://localhost:8080/instance/settings',
        method: 'GET',
      }).then(res => {
        msEnabled = res.body.microsoftSsoEnabled
        oktaEnabled = res.body.oktaSsoEnabled
        googleEnabled = res.body.googleSsoEnabled
        cy.request({
          url: 'http://localhost:8080/api/admin/instance/settings',
          method: 'PATCH',
          body: {
            microsoftSsoEnabled: true,
            oktaSsoEnabled: true,
            googleSsoEnabled: true,
          },
        })
      })
    })
    visitOrganisations()
  })
  describe('when creating an org', () => {
    before(() => {
      cy.get('[data-test=fab-button]').click()
      cy.get('[data-test=create-organisation-button]').click({ force: true })
    })
    it('should allow sso options', () => {
      cy.get('[data-test=toggle-microsoft-sso]').should('exist')
      cy.get('[data-test=toggle-okta-sso]').should('exist')
      cy.get('[data-test=toggle-google-sso]').should('exist')
    })
  })
  describe('when editing an org', () => {
    before(() => {
      cy.get('[data-test=toggle-microsoft-sso]').click()
      cy.get('[data-test=text-prompt-text-field]')
        .find('input')
        .type(org_name_1)
      cy.backendRoute('POST', 'organisations').as('createOrg')
      cy.get('[data-test=action-dialog-button]').click()
      cy.get('[data-test="search-button"]').click()
      cy.get('[data-test="Search"]').click().type(org_name_1)
      cy.get('[data-test="organisation-name"]').eq(0).click()
      cy.get('[data-test=org-settings-button]').click()
    })
    it('should have one sso option enabled', () => {
      cy.get('[data-test=toggle-microsoft-sso]').should('exist')
      cy.get('[data-test=toggle-microsoft-sso]')
        .find('input')
        .should('be.checked')
      cy.get('[data-test=toggle-okta-sso]').should('exist')
      cy.get('[data-test=toggle-google-sso]').should('exist')
    })
  })
  describe('when editing an org back to the inital state', () => {
    before(() => {
      cy.get('[data-test=toggle-microsoft-sso]').click()

      cy.get('[data-test=action-dialog-button]').click()
      cy.get('[data-test=org-settings-button]').click()
    })
    it('should have one sso option enabled', () => {
      cy.get('[data-test=toggle-microsoft-sso]').should('exist')
      cy.get('[data-test=toggle-microsoft-sso]')
        .find('input')
        .should('not.be.checked')
      cy.get('[data-test=toggle-okta-sso]').should('exist')
      cy.get('[data-test=toggle-okta-sso]')
        .find('input')
        .should('not.be.checked')
      cy.get('[data-test=toggle-google-sso]').should('exist')
      cy.get('[data-test=toggle-google-sso]')
        .find('input')
        .should('not.be.checked')
    })
    after(() => {
      //restore original sso state
      cy.get('[data-test=cancel-dialog-button]').click()
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      visitInstanceManagement()
      if (!msEnabled) {
        cy.get('[data-test=toggle-microsoft-sso]').click()
        cy.get('[data-test=action-dialog-button]').click()
      }
      if (!oktaEnabled) {
        cy.get('[data-test=toggle-okta-sso]').click()
        cy.get('[data-test=action-dialog-button]').click()
      }
      if (!googleEnabled) {
        cy.get('[data-test=toggle-google-sso]').click()
        cy.get('[data-test=action-dialog-button]').click()
      }
    })
  })
})
