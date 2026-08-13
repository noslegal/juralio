import { createMatter } from '../../../../../helpers/matterprojects/matter_api_helper'
import {
  createUser,
  getUsers,
  updateFTUE,
  updateUser,
} from '../../../../../helpers/users/user_api_helper'

describe('team_search.cy', () => {
  before(() => {
    function _createMatter() {
      updateFTUE(
        { username: 'matter.creator@juralio.com' },
        { hasSeenMatterAdmin: true }
      )
      return createMatter().then(matter => {
        return cy.visit(`/#/matteradmin/${matter.id}`)
      })
    }
    createUser().then(_createMatter)
    cy.log(getUsers(0))
    cy.get('[data-test=matter-people]').click()
  })

  const searchResultsList = () =>
    cy.get('[data-test=add-user-flow-autocomplete-username]')

  const getField = fieldName => (elementName = 'input') => {
    return cy
      .get('[data-test=add-user-flow-autocomplete]')
      .find(elementName)
      .clear()
  }

  describe('when performing a search', () => {
    const searchInput = getField('team-search')

    describe('by typing part of the firstname', () => {
      before(() => {
        cy.get('[data-test=add-user-matter-button]').click()
      })

      it('should yield a search result, displaying "firstname lastname (username)"', () => {
        cy.log(getUsers(0))
        let { firstname, lastname, username } = getUsers(0)
        searchInput().type(firstname.substring(0, 3))

        cy.get('[data-test=add-user-flow-autocomplete-username]').contains(
          `${username}`
        )
      })
    })

    describe('by typing part of the last name', () => {
      it('should yield a search result, displaying "firstname lastname (username)"', () => {
        let { firstname, lastname, username } = getUsers(0)
        searchInput().type(lastname.substring(0, 3))
        searchResultsList().contains(`${username}`)
      })
    })

    describe('by typing the user name', () => {
      it('should yield a search result, displaying "firstname lastname (username)"', () => {
        let { firstname, lastname, username } = getUsers(0)
        searchInput().type(username)
        searchResultsList().contains(`${username}`)
      })
    })

    describe('for a system administrator', () => {
      describe('by the username', () => {
        it('should yield no results', () => {
          searchInput().type('sysadmin')
          cy.get('[data-test=add-user-flow-autocomplete-no-options]').should(
            'be.visible'
          )
        })
      })
    })

    describe('for an inactive user', () => {
      let user
      before(() => {
        createUser()
          .then(newUser => {
            return updateUser({ id: newUser.id, enabled: false })
          })
          .then(disabledUser => {
            user = disabledUser
          })
      })

      describe('by the username', () => {
        it('should yield no results', () => {
          searchInput().type(user.username)
          cy.wait(1000)
          cy.get('[data-test=add-user-flow-autocomplete-no-options]').should(
            'be.visible'
          )
        })
      })
    })
  })
})
