import VisitHelpers from "../../../../helpers/matterprojects/visit_helpers"
import { createUser, updateFTUE } from "../../../../helpers/users/user_api_helper"
import {createOrganisation, 
  sysadminAddUserToOrganisation} from '../../../../helpers/organisation/organisation_api_helper'

const visitHelpers = new VisitHelpers()

describe('oa_no_fab_actions.cy',()=>{
  let organisation, orgAdmin
  const navigateToOrgDetail = () => {
    cy.login(orgAdmin.username)
    updateFTUE(orgAdmin, { hasSeenOrgAdmin: true })
    cy.login(orgAdmin.username)
    visitHelpers.visitOrgUsers()
  }
  before(()=>{
    const createOrgAdmin = () =>
      createUser(undefined, true, false, {
        roles: ['ROLE_ORG_ADMIN', 'ROLE_ORG_OWNER'],
      }).then(user => (orgAdmin = user))
    
      const associateOrgAdminWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, orgAdmin)

    createOrganisation('', false)
      .then(_organisation => {
        organisation = _organisation.body
      })
      .then(createOrgAdmin)
      .then(associateOrgAdminWithOrg)
  })
  describe('when navigating to orgaisation area',()=>{
    before(()=>{
      navigateToOrgDetail()
      cy.wait(3000)
      cy.get('[data-test=fab-button]').trigger('mouseover')
    })
    it('should show tooltip',()=>{
      cy.get('[role=tooltip]').should(
        'have.text',
        'No available actions for your current roles'
      )
    })

  })
})