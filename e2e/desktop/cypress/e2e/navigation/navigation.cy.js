import { createUser } from '../../../../helpers/users/user_api_helper'
import navigationPage from '../../../../page/navigation/navigation_page'

describe('navigation.cy', () => {
  let user
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
    })
  })
  describe('the main application navigation', () => {
    describe('when logged in as a standard user', () => {
      before(() => {
        cy.login(user.username)
        cy.visit('/#/home')
      })

      describe('should have a Home option', () => {
        it('which exists as an icon', () => {
          navigationPage.get.homeOption().should('exist')
          navigationPage.get.organisationsOption().should('not.exist')
        })

        describe('when clicked', () => {
          before(() => {
            navigationPage.get.homeOption().click()
          })

          it('should navigate to the home page', () => {
            cy.url().should('contains', '/home')
          })
        })
      })

      describe('navigate to a page which does not exist', () => {
        before(() => {
          cy.login(user.username)
          cy.visit('/#/404')
        })
        it('show not found page', () => {
          cy.get('[data-test=not-found-page]').should('be.visible')
        })
      })
    })

    describe('when logged in as a sys admin', () => {
      before(() => {
        cy.visit('/#/logout')
        cy.login('sysadmin@juralio.com', 'Password1Password1$')
        cy.reload()
      })

      describe('should', () => {
        it('not render an option for "Home"', () => {
          navigationPage.get.homeOption().should('not.exist')
        })

        it('render an option for "Organisations"', () => {
          navigationPage.get.organisationsOption().should('exist')
        })

        it('render an option for "Users"', () => {
          navigationPage.get.globalUsersOption().should('exist')
        })

        it('not render an option for Templates', () => {
          navigationPage.get.templatesOption().should('not.exist')
        })
      })
    })
  })
})
