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
  cy.get('[data-test=add-user-defined-label-button]').click()
  cy.wait('@addLabel')
  cy.wait(500)
}

const visitHelpers = new VisitHelpers()
describe('bulk_remove_inactive_label.cy', () => {
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
        visitHelpers.visitMatterLabels(
          fixture.matter.id,
          fixture.projects[0].id
        )
        cy.get('[data-test=switch-with-text]').eq(2).click()
      })
    })
  })
  describe('when viewing the uses of a disabled label', () => {
    before(() => {
      cy.get('[data-test=label-usage-count-link]').eq(0).click()
    })
    it('should allow us to remove the uses', () => {
      cy.get('[data-test=action-dialog-button]').should(
        'have.text',
        'Remove from tasks'
      )
    })
    describe('when removing the label usages', () => {
      before(() => {
        cy.get('[data-test=remove-all-button]').click()
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(1000)
        cy.get('[data-test=action-dialog-button]').click()
      })
      it('should update the page post deletion', () => {
        cy.get('[data-test=label-usage-count-link]').should('have.length', 1)
      })
    })
  })
})
