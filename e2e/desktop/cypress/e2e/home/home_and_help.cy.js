import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('home_and_help.cy', () => {
  let user
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
    })
  })
  describe('when in the app', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitHome()
    })

    it('should update url to correct route', () => {
      cy.url().should('contains', '/home')
    })

    it('should render the home component', () => {
      cy.get('[data-test=home]')
    })

    it('should set the correct document title', () => {
      cy.title().should('eq', 'Home | Juralio')
    })
  })
})
