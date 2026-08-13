import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()
describe('roadmap_detailed_mode_display.cy', () => {
  let user, appPage, fixture
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'detailed_display',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Alpha Project',
              tasks: [
                {
                  name: 'Moon',
                },
                { name: 'Stars' },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })
  describe('when there are no labels', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitRoadmap(fixture.matter.id, fixture.projects[0].id)
    })
    it('should disable the detailed options', () => {
      cy.get('[data-test=minimap-view-menu]').click()
      cy.get('[data-test=detailed-view-filter]').should('not.exist')
    })
  })
  describe('when there are labels', () => {
    before(() => {
      cy.login(user.username).then(() => {
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
        cy.backendRoute('GET', `/matter/${fixture.matter.id}/labels**`).as(
          'fetchLabels'
        )
        cy.get('[data-test=add-label-button]').click()
        cy.wait('@fetchLabels')
        cy.wait(1000)
        cy.get('[data-test=label-chip-text]')
          .contains('Awaiting review')
          .click()
        cy.backendRoute('GET', `/matter/${fixture.matter.id}/labels**`).as(
          'fetchLabels'
        )
        cy.get('[data-test=add-label-button]').click()
        cy.wait('@fetchLabels')
        cy.wait(1000)
        cy.get('[data-test=label-chip-text]', { timeout: 30000 })
          .contains('Awaiting approval')
          .click()

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
        cy.wait(2000)
        cy.get('[data-test=label-chip-text]').contains('Scope').click()
        cy.wait(1000)
        cy.get('[data-test=modifier-option-green]').click()
        cy.wait(5000)
        visitHelpers.visitRoadmap(fixture.matter.id, fixture.projects[0].id)
        cy.wait(3000)
        cy.get('[data-test=minimap-view-menu]').click()
        cy.get('[data-test=detailed-view-filter]').click()
      })
    })
    it('should be able to enable detailed view', () => {
      cy.get('[data-test=labels-wrapper]').should('exist')
      cy.get('[data-test=labels-wrapper]')
        .eq(0)
        .find('[data-test=label-chip-text]')
        .eq(0)
        .should('have.text', 'Awaiting approval')
      cy.get('[data-test=labels-wrapper]')
        .eq(0)
        .find('[data-test=label-overflow-count]')
        .should('have.text', '+2')

      cy.get('[data-test=labels-wrapper]')
        .eq(1)
        .find('[data-test=label-chip-text]')
        .eq(0)
        .should('have.text', 'Scope')
    })
  })
})
