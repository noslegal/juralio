import { createUser } from '../../../../helpers/users/user_api_helper'

describe('home.cy', () => {
  let user

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
    })
  })

  describe('when a user navigates to "/home"', () => {
    before(() => {
      cy.login(user.username)
      cy.visit('/#/home')
    })

    it('should update url to correct route', () => {
      cy.url().should('contains', '/home')
    })

    it('should render the home component', () => {
      cy.get('[data-test="home"]')
    })

    it('should set the correct document title', () => {
      cy.title().should('eq', 'Home | Juralio')
    })
  })
})
