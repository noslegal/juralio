import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../helpers/users/user_api_helper'

// Functional coverage for the matter-admin History panel: panel + event groups
// render, CSV export enables when there is data, and the category filter round
// trip (filter -> empty state -> clear -> repopulate) works end to end.
describe('JUR-23135_matter_history_panel.cy', () => {
  let user, fixture

  const openHistoryTab = matterId => {
    cy.backendRoute('/matter/*').as('getMatter')
    cy.visit(`/#/matteradmin/${matterId}`)
    cy.wait('@getMatter')
    // The History tab lives in the matter-admin sub-header and navigates to
    // tabItem 5. Wait on the rendered panel + loading spinner clearing rather
    // than network aliases (the /history and /history/filters globs overlap).
    cy.get('[data-test=history]', { timeout: 30000 }).click()
    cy.get('[data-test=matter-history-panel]', { timeout: 30000 }).should(
      'be.visible'
    )
    cy.get('[data-test=history-loading]').should('not.exist')
  }

  before(() => {
    createUser().then(u => {
      user = u
      // Each task creation publishes a TaskCreated MatterEvent, so the matter
      // has history without any extra setup.
      const seed = {
        matter: {
          prefix: 'JUR-23135',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Workstream 1',
              tasks: [{ name: 'Phase 1' }, { name: 'Phase 2' }],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
    // Suppress the matter-admin first-time-user modal, which otherwise overlays
    // the page and blocks the History tab click.
    cy.then(() => updateFTUE(user, { hasSeenMatterAdmin: true }))
  })

  describe('when viewing the history panel', () => {
    beforeEach(() => {
      cy.login(user.username)
      openHistoryTab(fixture.matter.id)
    })

    it('should render event groups with at least one event', () => {
      cy.get('[data-test=history-event-group]')
        .its('length')
        .should('be.greaterThan', 0)
      cy.get('[data-test=history-event]')
        .its('length')
        .should('be.greaterThan', 0)
    })

    it('should show a category badge with a count on the group summary', () => {
      // Task creation produces Tasks-category events, so the summary badge must
      // render the category label and its ×count.
      cy.get('[data-test=history-event-group-summary]')
        .first()
        .should('contain', 'Tasks')
        .and('contain', '×')
    })

    it('should expand a group to reveal its event rows', () => {
      // Rows live in a collapsed accordion; expanding must make them visible with
      // rendered title text.
      cy.get('[data-test=history-event-group-summary]').first().click()
      cy.get('[data-test=history-event]')
        .first()
        .should('be.visible')
        .and('not.have.text', '')
    })

    it('should enable CSV export when history is present', () => {
      cy.get('[data-test=history-download-csv]').should('not.be.disabled')
    })

    it('should filter to an empty category then clear back to populated', () => {
      // No posts were created, so filtering to the Notes category yields nothing.
      cy.get('[data-test=history-event-filter]').click()
      cy.get('[role=listbox]').contains('li', 'Notes').click()
      cy.get('body').type('{esc}')

      cy.contains('No matter history to display.').should('be.visible')
      cy.get('[data-test=history-event-group]').should('not.exist')

      cy.get('[data-test=history-clear-filters]').click()

      cy.get('[data-test=history-event-group]', { timeout: 15000 })
        .its('length')
        .should('be.greaterThan', 0)
    })

    it('should keep results when filtering to a populated category', () => {
      // Filtering to Tasks (which is populated) must NARROW to that subset, not
      // clear everything - proves the filter scopes by category.
      cy.get('[data-test=history-event-filter]').click()
      cy.get('[role=listbox]').contains('li', 'Tasks').click()
      cy.get('body').type('{esc}')

      cy.get('[data-test=history-event-group]', { timeout: 15000 })
        .its('length')
        .should('be.greaterThan', 0)
      // Every remaining group's badge should be the Tasks category.
      cy.get('[data-test=history-event-group-summary]').each($el => {
        cy.wrap($el).should('contain', 'Tasks')
      })
    })

    it('should keep results when filtering by the acting person', () => {
      // The fixture's events were all performed by the one seeded user, so
      // selecting them from the People filter must keep the events.
      cy.get('[data-test=history-people-filter]').click()
      cy.get('[role=listbox] li').first().click()
      cy.get('body').type('{esc}')

      cy.get('[data-test=history-event-group]', { timeout: 15000 })
        .its('length')
        .should('be.greaterThan', 0)
    })
  })
})
