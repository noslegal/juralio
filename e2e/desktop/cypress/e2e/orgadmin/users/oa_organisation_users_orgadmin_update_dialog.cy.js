import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
    createOrganisation,
    sysadminAddUserToOrganisation
} from '../../../../../helpers/organisation/organisation_api_helper'
import { getUserRowByUsername } from '../../../../../helpers/users/user-table-helper'
import {
    createUser,
    updateFTUE
} from '../../../../../helpers/users/user_api_helper'
import { get } from '../../../../../page/users/user-details-dialog-page'


const visitHelpers = new VisitHelpers()

describe('oa_organisation_users_orgadmin_update_dialog.cy', () => {
  let organisation, orgAdmin

  const navigateToOrgDetail = () => {
    cy.login(orgAdmin.username)
    updateFTUE(orgAdmin, { hasSeenOrgAdmin: true })
    cy.login(orgAdmin.username)
    visitHelpers.visitOrgUsers()
  }

  before(() => {
    const createOrgAdmin = () =>
      createUser(undefined, true, false, { roles: ['ROLE_ORG_ADMIN'] }).then(
        user => (orgAdmin = user)
      )
    const associateOrgAdminWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, orgAdmin)

    createOrganisation('', false)
      .then(_organisation => {
        organisation = _organisation.body
      })
      .then(createOrgAdmin)
      .then(associateOrgAdminWithOrg)
  })

  describe('when opening the user update dialog', () => {
    before(() => {
      navigateToOrgDetail()
      getUserRowByUsername(orgAdmin.username).click()
    })

    it('the org admin role checkbox is disabled', () => {
      get.orgAdminCheckbox().should('be.disabled')
    })

    it('the other role checkboxs are enabled', () => {
      get.knowledgeManagerCheckbox().should('not.be.disabled')
      get.matterCreatorCheckbox().should('not.be.disabled')
    })

    it('should be an internal user', () => {
      get.internalRadioButton().should('be.checked')
      get.externalRadioButton().should('not.be.checked')
    })

    it('the association radio buttons are not shown', () => {
      get.internalRadioButton().should('be.disabled')
      get.externalRadioButton().should('be.disabled')
    })
  })
})
