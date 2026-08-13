import { visitOrganisationDetail } from '../../../../../../helpers/admin/admin_visit_helpers'
import { createOrganisation } from '../../../../../../helpers/organisation/organisation_api_helper'

describe('organisation_toggle_user_mfa.cy', () => {
  before(() => {
    createOrganisation().then(newOrg => {
      createdOrgName = newOrg.body.name
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      visitOrganisationDetail(createdOrgName)
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
})
