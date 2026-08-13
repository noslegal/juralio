import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('global_search_navigation.cy', () => {
  let user, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'globalSearchNavigation',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {
                  properties: {
                    name: 'task1',
                  },
                },
                {
                  properties: {
                    name: 'task2',
                  },
                },
                {
                  properties: {
                    name: 'task3',
                  },
                },
              ],
            },
            {
              tasks: [
                {
                  properties: {
                    name: 'Lobster',
                  },
                },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  searchFromHomepage('Lobster', 1, 3)
  searchFromHomepage('task1', 0, 0)

  function getReadField() {
    return cy.get('[data-test="task-name"]').find('[data-test="read-field"]')
  }

  function searchFromHomepage(searchTerm, projectIndex, taskIndex) {
    describe('when on the home page', () => {
      before(() => {
        cy.login(user.username)
        cy.visit('/#/home')
      })

      describe(`And a search is performed for ${searchTerm} in the global search box`, () => {
        before(() => {
          cy.get('[data-test=search-icon]').click()
          cy.get('[data-test=global-searchbar]').find('input').type(searchTerm)
          cy.wait(5000)
        })

        it('should render the search results container', () => {
          cy.get('[data-test=search-results-list]').should('be.visible')
        })
      })
    })
  }
})
