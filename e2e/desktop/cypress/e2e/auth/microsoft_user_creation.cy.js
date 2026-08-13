import faker from 'faker'
import { enableSSO } from '../../../../helpers/admin/admin_api_helpers'
import { visitHome } from '../../../../helpers/admin/admin_visit_helpers'
import { turnOnSSO } from '../../../../helpers/organisation/organisation_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('microsoft_user_creation.cy', () => {
  const email = faker.internet.email().toLowerCase()
  let user
  before(() => {
    createUser().then(res => {
      user = res
      enableSSO()
    })
  })

  describe('as an org admin', () => {
    before(() => {
      cy.login(user)

      turnOnSSO()
      visitHome()
      cy.get('[data-test=header-org-menu-button]').click()
      cy.get('[data-test=header-org-accounts-button]').click()
      cy.get('[data-test=add-people-button]', { timeout: 30000 }).click()
      cy.get('[data-test=email]').find('input').type(`${email}{enter}`)
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(5000)
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(5000)
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(5000)
    })
    it('should show the microsoft user options', () => {
      cy.get('[data-test=radio-option-title]')
        .eq(1)
        .should('have.text', 'Microsoft SSO')
    })
    describe('when viewing a user', () => {
      before(() => {
        cy.get('[data-test=radio-option-title]').eq(1).click({ force: true })
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(5000)
        cy.get('[data-test=action-dialog-button]').click()

        cy.get('[data-test=settings]').click()
        cy.get('[data-test=accounts]').click()
        cy.wait(5000)
        cy.get('[data-test=search-button]').click({ timeout: 10000 })
        cy.get('[data-test=Search]').type(`${email}{enter}`)
        cy.get('[data-test=user-list-item]').eq(0).click(0, 0)
      })
      it('should have a convert to juralio option', () => {
        cy.get('[data-test=convert-to-juralio]').should('be.visible')
      })
    })
  })
})
