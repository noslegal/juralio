import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('logout.cy', () => {
  let user
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
    })
  })
  describe('when logging out as a user', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitHome()
      cy.get('[data-test=user-header-navigation-button]').click()
      cy.get('[data-test=user-header-logout-menu-button]').click()
    })

    it('the user should be re-directed to the login page', () => {
      cy.url().should('contain', '/#/login')
    })

    it('should render the login page', () => {
      cy.get('[data-test=copyright-info]').should('be.visible')
    })
  })
})
