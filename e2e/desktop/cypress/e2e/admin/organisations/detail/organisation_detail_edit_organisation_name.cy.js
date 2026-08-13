import { visitOrganisationDetail } from '../../../../../../helpers/admin/admin_visit_helpers'
import { createOrganisation } from '../../../../../../helpers/organisation/organisation_api_helper'

describe('organisation_detail_edit_organisation_name.cy', () => {
  let dupOrgName = 'Juralio'
  let createdOrgName

  before(() => {
    createOrganisation().then(newOrg => {
      createdOrgName = newOrg.body.name
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      visitOrganisationDetail(dupOrgName)
    })
  })

  describe('when attempting to save a blank name', () => {
    before(() => {
      cy.get('[data-test=text-field-with-edit-icon]').click()
      cy.get('[data-test=text-field-with-edit-icon] input')
        .clear()
        .type('{Enter}')
    })

    it('should show a validation message', () => {
      cy.get('[data-test=edit-field]').find('p.Mui-error').should('be.visible')
    })
  })

  describe("when attempting to save the name 'Juralio'", () => {
    before(() => {
      cy.focused().type('{Esc}')
      cy.get('[data-test=text-field-with-edit-icon]').click()
      cy.get('[data-test=text-field-with-edit-icon] input')
        .clear()
        .type('Juralio{Enter}')
      cy.wait(100)
    })

    it('should not show a validation message', () => {
      cy.get('[data-test=read-field]').find('p.Mui-error').should('not.exist')
    })

    it('should show the new name', () => {
      cy.get('[data-test=text-field-with-edit-icon]')
        .contains('Juralio')
        .should('be.visible')
    })
  })

  describe('when attempting to save the duplicate name', () => {
    before(() => {
      cy.get('[data-test=text-field-with-edit-icon]').click()
      cy.get('[data-test=text-field-with-edit-icon] input')
        .clear()
        .type(`${createdOrgName}{Enter}`)
    })

    it('should show a validation message', () => {
      cy.get('[data-test=edit-field]').find('p.Mui-error').should('be.visible')
    })

    describe("when pressing ESC to revert to the name 'Juralio'", () => {
      before(() => {
        cy.focused().type('{Esc}')
      })

      it('should not show a validation message', () => {
        cy.get('[data-test=read-field]').find('p.Mui-error').should('not.exist')
      })

      it('should show the previously entered name', () => {
        cy.get('[data-test=text-field-with-edit-icon]')
          .contains('Juralio')
          .should('be.visible')
      })
    })
  })
})
