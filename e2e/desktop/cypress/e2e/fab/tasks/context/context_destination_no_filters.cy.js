import destinationHelper from '../../../../../../helpers/destinationdialog/destination-dialog-helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../../../page/destinationdialog/destinationdialog_page'
import textWithDestinationDialog from '../../../../../../page/textwithdestinationdialog/textwithdestinationdialog_page'

describe('context_destination_no_filters.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'mattertasknofilters',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Task Create No Filters',
              tasks: [{ name: 'Task To have subtasks' }, { name: 'Here Goes' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when in a Task context and Create Task FAB button is clicked', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Task To have subtasks')
      destinationHelper.openTaskCreateFlowFromFab()
    })

    describe('When a name is entered and Edit pressed', () => {
      before(() => {
        cy.get('[data-test=text-prompt-text-field]')
          .find('input')
          .type('This is a new Task')
        cy.backendRoute('/matter/*/workstreams/*/task/**').as('taskGet')
        cy.backendRoute('/matters?*').as('getMatters')
        cy.backendRoute('/matter/*/workstreams?*').as('getProjects')
        cy.backendRoute('/matter/*/workstreams/*').as('getProject')
        cy.clock()
        textWithDestinationDialog.get.editLink().click()
        cy.wait(['@getMatters', '@getProjects', '@getProject'], {
          timeout: 12000,
        })
        // allow javascript to issue dependent fetches
        cy.tick(1000)
        // allow TaskParentTypeSelect to take focus
        cy.tick(1000)
        cy.wait(2000)
      })

      it('should have the Matter selected in the dialog', () => {
        destinationPage.get
          .matterSelectorInput()
          .should(
            'have.value',
            fixture.matter.name + ' - ' + fixture.matter.matterId
          )
      })

      describe('When the matter selection is cleared', () => {
        before(() => {
          cy.clock()
          destinationPage.get.matterSelector().find('Input').clear()
          cy.tick(1000)
        })

        it('should populate 1 result', () => {
          cy.get('[data-test=matter-select-menu-item]').should('have.length', 1)
        })

        it('the "Search everything" option should NOT be visible', () => {
          cy.get('[data-test=search-everything-filter]').should('not.exist')
        })
      })

      describe('When the project selection is cleared', () => {
        before(() => {
          cy.get('[data-test=dialog-header-title-text]').click()
          cy.clock()
          cy.tick(1000)
        })

        it('the "Search everything" option should NOT be visible', () => {
          cy.get('[data-test=search-everything-filter]').should('not.exist')
        })
      })

      describe('When the task selection is cleared', () => {
        before(() => {
          cy.get('[data-test=dialog-header-title-text]').click()
          cy.backendRoute('/matter/*/workstreams/*/tasks').as('taskGet')
          cy.wait(5000)
        })

        it('the "Search everything" option should NOT be visible', () => {
          cy.get('[data-test=search-everything-filter]').should('not.exist')
        })
      })
    })
  })
})
