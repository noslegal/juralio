import { visitOrganisations } from '../../../../../../helpers/admin/admin_visit_helpers'
import {
  checkAdminsAndUsersCountInTable,
  createOrganisation,
} from '../../../../../../helpers/organisation/organisation_helper'
import snackbarHelper from '../../../../../../helpers/snackbar/snackbar-helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

const timestamp = new Date().toISOString()

describe('organisations_create_update.cy', () => {
  describe('the organisations page', () => {
    before(() => {
      createUser('', true, false).then(() => {
        cy.login('sysadmin@juralio.com', 'Password1Password1$')
        visitOrganisations()
      })
      createUser('', true, false)
      createOrganisation('Org1A' + timestamp, true)
    })

    it('should display an organisation with the provided name and no admin or users', () => {
      cy.get('[data-test=organisation-name]').contains('Org1A' + timestamp)
      checkAdminsAndUsersCountInTable({
        org: 'Org1A' + timestamp,
        expectedAdminCount: 0,
        expectedUserCount: 0,
      })
    })

    describe('when creation of an organisation is cancelled', () => {
      before(() => {
        createOrganisation('NEVER_CREATED', false)
      })

      it('should not display the item whose creation was cancelled in the list', () => {
        cy.get('[data-test=organisation-list-item]')
          .contains('NEVER_CREATED')
          .should('not.exist')
      })
    })

    describe('when creating an organisation which already exists', () => {
      before(() => {
        cy.get('[data-test=fab-button]').click()
        cy.get('[data-test=create-organisation-button]').click()
        cy.get('[data-test=dialog-header-title-text]')
        cy.focused()
          .type('Org1A' + timestamp)
          .type('{ENTER}')
      })

      it('should display the duplicate org error message', () => {
        snackbarHelper.checkShownAndHasExpectedText('An error has occurred')
      })
    })
  })
})
