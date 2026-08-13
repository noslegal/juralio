import faker from 'faker'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('user_update_with_no_name.cy', () => {
  let user, user2, appPage, fixture, org
  const newEmail = faker.internet.email().toLowerCase()
  const visitHelper = new VisitHelpers()
  before(() => {
    createUser('', true, false, { roles: ['ROLE_ORG_ADMIN'] })
      .then(u => (user = u))
      .then(() => createOrganisation('', false))
      .then(o => {
        org = o.body
        createUser('', true, false, {}, false, false, true, true).then(u2 => {
          user2 = u2
          sysadminAddUserToOrganisation(org, user)
          sysadminAddUserToOrganisation(org, u2)
        })
      })
  })
  describe('when updating a user with no name', () => {
    before(() => {
      cy.login(user)
      visitHelper.visitOrgUsers()
      cy.get('[data-test=close-icon]').click({ force: true })
      cy.get('[data-test=ftueSkipButton]').click()
      cy.wait(1000)
      cy.get(`[title="${user2.username}"]`).click()
      cy.get('[data-test=org-admin-checkbox]').click()
    })
    it('should allow the user to be updated', () => {
      cy.get('[data-test=action-dialog-button]').should('not.be.disabled')
    })
    describe('when the no name user is an org admin', () => {
      before(() => {
        cy.get('[data-test=action-dialog-button]').click()
        cy.reload()
        cy.login(user2)
        visitHelper.visitOrgUsers()
        cy.get('[data-test=close-icon]').click()
        cy.get('[data-test=ftueSkipButton]').click()
        cy.wait(1000)
        cy.get(`[title="${user2.username}"]`).click()
        cy.get('[data-test=knowledge-manager-checkbox]').click()
      })
      it('should allow the user to be updated', () => {
        cy.get('[data-test=action-dialog-button]').should('not.be.disabled')
      })
      describe('when no name is set', () => {
        before(() => {
          //personal settings
          cy.reload()
          cy.login(user2)
          visitHelper.visitPersonalSettings()
          cy.get('[data-test=email-field]')
            .find('input')
            .type(`{selectAll}{backspace}${newEmail}`)
        })
        it('should allow the user to update their own email', () => {
          cy.get('[data-test=save-button]').should('not.be.disabled')
        })
      })
      describe('after setting the user name', () => {
        before(() => {
          cy.reload()
          cy.login(user)
          visitHelper.visitOrgUsers()

          cy.wait(1000)
          cy.get(`[title="${user2.username}"]`).click()
          cy.get('[data-test=first-name-field]').find('input').type('first')
          cy.get('[data-test=last-name-field]').find('input').type('last')
          cy.get('[data-test=action-dialog-button]').click()
          cy.wait(5000)
          cy.get(`[title="${user2.username}"]`).click()
          cy.get('[data-test=first-name-field]').find('input').clear()
          cy.get('[data-test=last-name-field]').find('input').clear()
        })
        it('should not let the name be cleared', () => {
          cy.get('[data-test=action-dialog-button]').should('be.disabled')
        })
        describe('when a name is set', () => {
          before(() => {
            //personal settings
            cy.reload()
            cy.login(user2)
            visitHelper.visitPersonalSettings()
            cy.get('[data-test=first-name-field]').find('input').clear()
            cy.get('[data-test=last-name-field]').find('input').clear()
          })
          it('should now allow the user to clear their name', () => {
            cy.get('[data-test=save-button]').should('be.disabled')
          })
        })
      })
    })
  })
})
