import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
    createOrganisation,
    sysadminAddUserToOrganisation
} from '../../../../helpers/organisation/organisation_api_helper'
import {
    createUser,
    updateFTUE
} from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('orgadmin_ftue_flow_finish.cy', () => {
  let testUser, organisation

  before(() => {
    createOrganisation('test', false)
      .then(_organisation => {
        organisation = _organisation.body
      })
      .then(() =>
        createUser(undefined, true, false, { roles: ['ROLE_ORG_ADMIN'] })
      )
      .then(createdUser => {
        testUser = createdUser
      })
      .then(() => sysadminAddUserToOrganisation(organisation, testUser))
      .then(() => {
        cy.login(testUser.username)
        updateFTUE(testUser, { hasSeenOrgAdmin: false })

        cy.login(testUser.username)
        visitHelpers.visitHome()
        visitHelpers.visitOrgUsers()
      })
  })
  it('should display the orgadmin FTUE', () => {
    cy.get('[data-test=OrgAdmin-ftue]').should('be.visible')
  })

  describe('on clicking the finish button', () => {
    before(() => {
      cy.login(testUser.username)
      cy.get('body').type('{esc}')
      cy.get('[data-test=ftueFinishButton]').click()
    })

    it('should no longer display the orgadmin FTUE', () => {
      cy.get('[data-test=OrgAdmin-ftue]').should('not.exist')
    })

    describe('reloading the page', () => {
      before(() => {
        cy.reload()
        cy.login(testUser.username)
        visitHelpers.visitOrgUsers()
      })

      it('should display the orgadmin FTUE', () => {
        cy.get('[data-test=OrgAdmin-ftue]').should('exist')
      })
    })
  })
})
