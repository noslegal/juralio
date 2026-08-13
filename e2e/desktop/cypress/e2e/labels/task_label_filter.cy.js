import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
  createUser,
  updateFTUE,
} from '../../../../helpers/users/user_api_helper'

const addUserDefinedLabel = text => {
  cy.get('[data-test=add-label-button]').click()
  cy.get('[data-test=label-search-field]').find('input').type(text)
  cy.backendRoute('POST', '/matter/*/labels').as('addLabel')
  cy.get('[data-test=add-user-defined-label-button]').click({ force: true })
  cy.wait('@addLabel')
  cy.wait(500)
}

const visitHelpers = new VisitHelpers()
describe(
  'task_label_filter.cy',
  { retries: { runMode: 3, openMode: 1 } },
  () => {
    let testUser, fixture, appPage
    before(() => {
      createUser().then(createdUser => {
        testUser = createdUser
        updateFTUE(testUser, { hasSeenMatterAdmin: true })
        const seed = {
          matter: {
            teamMembers: [testUser],
            matterAdmins: [testUser],
            projects: [
              {
                name: 'Project 1',
                tasks: [{ name: '1' }, { name: '2' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
        cy.login(testUser.username).then(() => {
          visitHelpers.visitTaskDetails(
            fixture.matter.id,
            fixture.projects[0].id,
            fixture.tasks[0].id
          )
          cy.backendRoute('GET', `/matter/${fixture.matter.id}/labels**`).as(
            'fetchLabels'
          )

          cy.backendRoute(
            'GET',
            `/matter/${fixture.matter.id}/workstreams/${fixture.projects[0].id}/task/${fixture.tasks[0].id}`
          ).as('fetchFirstTask')
          cy.get('[data-test=add-label-button]').click()
          cy.wait('@fetchLabels')
          cy.get('[data-test=label-chip-text]').contains('Clarity').click()
          cy.get('[data-test=modifier-option-red]').click()
          cy.wait('@fetchFirstTask')
          visitHelpers.visitTaskDetails(
            fixture.matter.id,
            fixture.projects[0].id,
            fixture.tasks[1].id
          )
          cy.backendRoute('GET', `/matter/${fixture.matter.id}/labels**`).as(
            'fetchLabels'
          )

          cy.get('[data-test=add-label-button]').click()
          cy.wait('@fetchLabels')
          cy.get('[data-test=label-chip-text]').contains('Scope').click()
          cy.get('[data-test=modifier-option-green]').click()
        })
      })
    })
    describe('when viewing the taskmap filter', () => {
      before(() => {
        visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
        cy.get('[data-test=minimised-filters]').click({ force: true })
        cy.get('[data-test=labels-filter]').click()
      })
      it('should show the 2 available options', () => {
        cy.get('[data-test=label-option]').should('have.length', 2)
        cy.get('[data-test=label-option]').eq(0).should('contain', 'Clarity')
        cy.get('[data-test=label-option]').eq(1).should('contain', 'Scope')
      })
      describe('when filtering by an option', () => {
        before(() => {
          cy.get('[data-test=label-option-checkbox]').eq(0).click()
          //cy.get('[data-test=label-option]').eq(0).type('{esc}')
        })
        it('should highlight only one task', () => {
          cy.get('[data-test=task-cell-test]')
            .eq(0)
            .should('have.css', 'background-color')
            .and('eq', 'rgba(219, 217, 181, 0.6)')
          // cy.get('[data-test=task-cell-test]')
          //   .eq(1)
          //   .should('have.css', 'background-color')
          //   .and('eq', 'rgba(252, 251, 232, 0.4)')
        })
        describe('when visiting the roadmap', () => {
          before(() => {
            cy.get('[data-test=timeline-navigation-button]').click()
          })
          it('should preserve the filters on the tasks', () => {
            cy.get('[data-test=task-cell-test]')
              .eq(0)
              .should('have.css', 'background-color')
              .and('eq', 'rgba(219, 217, 181, 0.6)')
          })
        })
      })
      describe('when there are more than 15 options', () => {
        before(() => {
          cy.login(testUser.username)
          visitHelpers.visitTaskDetails(
            fixture.matter.id,
            fixture.projects[0].id,
            fixture.tasks[0].id
          )
          addUserDefinedLabel('a')
          addUserDefinedLabel('b')
          addUserDefinedLabel('c')
          addUserDefinedLabel('d')
          addUserDefinedLabel('e')
          addUserDefinedLabel('f')
          addUserDefinedLabel('g')
          addUserDefinedLabel('h')
          addUserDefinedLabel('i')
          addUserDefinedLabel('j')
          addUserDefinedLabel('k')
          addUserDefinedLabel('l')
          addUserDefinedLabel('m')
          addUserDefinedLabel('n')
          addUserDefinedLabel('o')
          addUserDefinedLabel('p')
          addUserDefinedLabel('q')
          visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
          cy.get('[data-test=minimised-filters]').click({ force: true })
          cy.get('[data-test=labels-filter]').click()
        })
        it('shows a search bar', () => {
          cy.get('[data-test="task-type-filter-selected-text"]').click()
          cy.get('[data-test=label-filter-search]').should('be.visible')
        })
        describe('when using the search bar', () => {
          before(() => {
            cy.get('[data-test=label-filter-search]').find('input').type('k')
          })
          it('updates the dropdown options', () => {
            cy.get('[data-test=label-option]').should('have.length', 1)
          })
        })
        describe('when using the search bar clear button', () => {
          before(() => {
            cy.get('[data-test=label-filter-close-icon]').click()
          })
          it('updates the dropdown options', () => {
            cy.get('[data-test=label-option]').should('have.length', 19)
          })
        })
      })
    })
  }
)
