import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import { openSelector } from '../../../../helpers/navigation/project-selector-helper'
import { createUser } from '../../../../helpers/users/user_api_helper'
import { get } from '../../../../page/project/project_selector_page'

const selectorSearch = term => {
  openSelector()
  cy.get('[data-test=matter-switcher-filter-input]').type(term)
}

describe('project_selector_user_filter.cy', () => {
  let fixture, user, appPage, user2

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      createUser().then(u2 => {
        user2 = u2
        const seed = {
          matter: {
            prefix: 'matter_user_filter.cy',
            teamMembers: [user, user2],
            matterAdmins: [user],
            projects: [
              {
                name: 'Test Project',
                tasks: [{ name: 'Only Task' }],
              },
              {
                name: 'Test Project B',
                tasks: [{ name: 'Test Task B' }],
              },
              {
                name: 'c',
                tasks: [{ name: 'Test Task B' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
    })
  })

  describe('when a user opens the project selector', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitHome()
      openSelector()
    })

    it('should render a project selector expanded view', () => {
      get.openSelector().should('exist')
    })

    it('should not have a closed chip', () => {
      cy.get('[data-test=closed-chip]').should('not.exist')
    })

    it('should have user filter at the top', () => {
      cy.get('[data-test=matter-switcher-filter]').should('be.visible')
    })

    describe('when a user wants to filter matters by user', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitHome()
        selectorSearch(user2.username)
      })

      it('should render the matching matters', () => {
        cy.get('[data-test=matter-switcher-matter-item]', {
          timeout: 30000,
        }).should('be.visible')
      })

      it('should populate 1 results', () => {
        cy.get('[data-test=matter-switcher-matter-item]').should(
          'have.length',
          1
        )
      })

      describe('when multiple items in the search string (client name)', () => {
        before(() => {
          cy.login(user.username)
          appPage.visitHome()
          selectorSearch(fixture.matter.clientName)
        })

        it('should populate 1 result', () => {
          cy.get('[data-test=matter-switcher-matter-item]')
            .should('be.visible')
            .should('have.length', 1)
        })
      })
    })
  })
})
