import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('matter_creator_role.cy', () => {
  describe('when navigating to the matter create page via the URL', () => {
    let user
    const visitHelpers = new VisitHelpers()
    
    before(() => {
      createUser().then(createdUser => {
        user = createdUser
      })
    })

    describe('and logged in as a matter creator', () => {
      before(() => {
        cy.login('matter.creator@juralio.com')
        visitHelpers.visitHome()
        cy.get('[data-test=fab-button]').click()
      })

      it('should display the Matter Create Fab item', () => {
        cy.get('[data-test=create-matter-button]').should('be.visible')
      })
    })

    describe('and NOT logged in as a matter creator', () => {
      before(() => {
        cy.login(user.username)
        cy.reload()
      })

      it('should NOT display the Matter Create Fab item', () => {
        cy.get('[data-test=create-matter-button]').should('not.exist')
      })
    })
  })
})
