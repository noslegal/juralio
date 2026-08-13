import { generateFixture } from '../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import { openCreateNote } from '../../../../../../helpers/notes/notes_create_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('create_note_project_selection.cy', () => {
  let user, matter1Fixture, matter2Fixture
  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const matter1Layout = {
        matter: {
          matterAdmins: [user],
          teamMembers: [user],
          projects: [
            {
              name: 'Matter1Project1',
            },
            {
              name: 'Matter1Project2',
            },
            {
              name: 'Matter1Project3Closed',
              properties: {
                active: false,
              },
            },
          ],
        },
      }

      const matter2Layout = {
        matter: {
          matterAdmins: [user],
          teamMembers: [user],
          projects: [
            {
              name: 'Matter2Project1',
            },
            { name: 'matter2Project2' },
          ],
        },
      }

      matter1Fixture = generateFixture(matter1Layout)
      matter2Fixture = generateFixture(matter2Layout)
    })
  })

  const getProjectSelector = () =>
    cy.get('[data-test=project-select-container]')
  const getProjectSelectorInput = () => getProjectSelector().find('input')

  describe('when the create note destination dialog is launched, the project selector', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitHome()
      cy.backendRoute('/matters*').as('fetchMatters')
      openCreateNote()
      cy.wait('@fetchMatters')
    })

    it('should be displayed', () => {
      getProjectSelector().should('exist')
    })

    it('should have a "Choose a workstream" placeholder', () => {
      getProjectSelectorInput().should(
        'have.attr',
        'placeholder',
        'Choose a workstream'
      )
    })

    it('should be disabled when a matter is NOT yet selected', () => {
      getProjectSelectorInput().should('have.attr', 'disabled')
    })

    describe('when a matter is selected', () => {
      before(() => {
        cy.get('[data-test=matter-select-container] input')
          .type(`${matter1Fixture.matter.name}`)
          .type('{backspace}')
        cy.backendRoute('/matter/*/workstreams?**').as('fetchProjects')
        cy.get('[data-test=matter-select-menu-item]').first().click()
        cy.wait('@fetchProjects')
      })

      it('the project selector should be enabled', () => {
        getProjectSelectorInput().should('not.have.attr', 'disabled')
      })
    })

    describe('when the user enters a search term', () => {
      before(() => {
        getProjectSelectorInput().type('a')
      })

      it('should only display the projects that belong to the selected matter', () => {
        cy.get('[data-test=workstream-item-name]').should('have.length', 2)
      })

      it('should display the first project as "Matter1Project1"', () => {
        cy.get('[data-test=workstream-item-name]')
          .first()
          .should('have.text', 'Matter1Project1')
      })

      it('should display the second project as "Matter1Project2"', () => {
        cy.get('[data-test=workstream-item-name]')
          .last()
          .should('have.text', 'Matter1Project2')
      })
    })

    describe('when the user selects another matter', () => {
      before(() => {
        cy.get('[data-test=matter-select-container] input')
          .clear()
          .type(`${matter2Fixture.matter.name}`)
          .type('{backspace}')
        cy.backendRoute('/matter/*/workstreams?**').as('fetchProjects')
        cy.get('[data-test=matter-select-menu-item]').last().click()
        cy.wait('@fetchProjects')
      })

      it('the search term input should have no value', () => {
        getProjectSelectorInput().should('have.value', '')
      })

      describe('and enters a search term', () => {
        before(() => {
          getProjectSelectorInput().type('a')
        })

        it('should only display the projects that belong to the selected matter', () => {
          cy.get('[data-test=workstream-item-name]').should('have.length', 2)
        })

        it('should display the first project as "Matter2Project1"', () => {
          cy.get('[data-test=workstream-item-name]')
            .first()
            .should('have.text', 'Matter2Project1')
        })

        describe('when the user chooses to select a project', () => {
          before(() => {
            cy.get('[data-test=workstream-item-name]').first().click()
          })

          it('should display that project as the selected item', () => {
            getProjectSelectorInput().should('have.value', 'Matter2Project1')
          })
        })
      })
    })
  })
})
