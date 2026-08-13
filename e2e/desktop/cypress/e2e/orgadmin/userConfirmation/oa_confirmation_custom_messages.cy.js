import HttpStatus from 'http-status-codes'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('oa_confirmation_custom_mesages',()=>{
  
    let org, user1, user2, standardUser
    const visitHelpers = new VisitHelpers()
    before(() => {
      createUser('', true, false, {}, false, false, false, true).then(
        user => (user1 = user)
      )
      createUser('', true, false, {}, false, false, false, true).then(u2 => {
        user2 = u2
      })
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        url: `${Cypress.env('serverRootBaseUrl')}/api/admin/instance/settings`,
        method: 'PATCH',
        body: {
          enableUserConfirmation: false,
          enablePaymentPlatformIntegration: false,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        createOrganisation('', false).then(o => {
          org = o.body
          sysadminAddUserToOrganisation(o.body, user1)
          sysadminAddUserToOrganisation(o.body, user2)
        })
      })
    })
  describe('as an org admin',()=>{
    describe('When viewing users table without user confirmation enabled',()=>{
    before(()=>{
      cy.login(user1.username, 'Password2Password2$')
        visitHelpers.visitOrgUsers()
        cy.wait(5000)
        cy.get('[data-test=close-icon]', { timeout: 30000 }).click()
        cy.get('[data-test=ftueSkipButton]').click()
    })
    it('Should not show the edit custom messages button',()=>{
        cy.get('[data-test=edit-custom-messages-button]').should('not.exist')
    })
    })
    describe('when the confirmation function is enabled', () => {
      before(()=>{
        cy.login('sysadmin@juralio.com', 'Password1Password1$')
        cy.apiSpecRequest({
          url: `${Cypress.env(
            'serverRootBaseUrl'
          )}/api/admin/instance/settings`,
          method: 'PATCH',
          body: {
            enableUserConfirmation: true,
          },
        }).then(() => {
          cy.login(user1.username, 'Password2Password2$')
          visitHelpers.visitOrgUsers()
        })
      })
      it('should show the edit custom messages button',()=>{
        cy.get('[data-test=edit-custom-messages-button]').should('exist')
      })
    })
    describe('When editing both messages',()=>{
    before(()=>{
      cy.login(user1.username, 'Password2Password2$')
      visitHelpers.visitOrgUsers()
      cy.wait(3000)
      cy.get('[data-test=edit-custom-messages-button]').click()
    })
    it('should show the dialog an its fields zero state', ()=>{
      cy.get('[data-test=trial-card-text-box]').should('have.text','Admin to ContactMax 20 Characters')
      cy.get('[data-test=lapsed-login-text-box]').should('have.text','Lapsed User Login MessageMax 150 Characters')
    })
    describe('When saving new custom messages',()=>{
      before(()=>{
        cy.get('[data-test=lapsed-login-text-box]').type("Test lapsed login message for cypress")
        cy.wait(1000)
        cy.get('[data-test=trial-card-text-box]').type('test trial card')
        cy.wait(1000)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(1000)
        cy.login(user1.username, 'Password2Password2$')
        visitHelpers.visitOrgUsers()
        cy.wait(1000)
        cy.get('[data-test=edit-custom-messages-button]').click()
      })
      it('should have the saved messages in the text boxes', () =>{
        cy.get('[data-test=lapsed-login-text-box]').find("input").should('have.value','Test lapsed login message for cypress')
        cy.get('[data-test=trial-card-text-box]').find('input').should('have.value','test trial card')
      })
    })
    }) 
  })
})