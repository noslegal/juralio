import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('roadmap_filter_by_milestones.cy', () => {
  let user, fixture, appPage
  before(() => {
    const createUser1 = () =>
      createUser().then(createdUser => (user = createdUser))
    createUser1().then(() => {
      const seed = {
        matter: {
          prefix: 'task_status_event',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'milestone filter test',
              tasks: [
                { name: 'regular task' },
                { name: 'another regular task' },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
      cy.login(user.username).then(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/tasks`,
          method: 'POST',
          body: {
            isMilestone: true,
            matterId: fixture.matter.id,
            name: 'Milestone',
            project: fixture.projects[0].id,
            status: 'not-started',
          },
        })
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/tasks`,
          method: 'POST',
          body: {
            isMilestone: true,
            matterId: fixture.matter.id,
            name: 'Milestone 2',
            project: fixture.projects[0].id,
            status: 'not-started',
          },
        })

        visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
        cy.get('[data-test=task-cell-zero-assignee-chip]').eq(2).click()
        cy.get('[data-test="team-search"]')
          .click()
          .find('input')
          .clear()
          .type(user.username)
        cy.wait(2000)
        cy.get('[data-test="search-result-list-item"]').eq(0).click()
      })
    })
  })
  describe('when in the roadmap', () => {
    before(() => {
      visitHelpers.visitRoadmap(fixture.matter.id, fixture.projects[0].id)
      cy.wait(2000)
      cy.get('[data-test=minimised-filters]').click({ force: true })
    })
    it('should have the milestone highlight option', () => {
      cy.wait(2000)
      cy.get('[data-test=task-type-milestone]').should('be.visible')
    })
    describe('when highlighting the milestones', () => {
      before(() => {
        cy.get('[data-test=task-type-milestone]').click()
        cy.wait(3000)
      })
      it('should highlight only the milestones', () => {
        cy.get('[data-test=task-cell-test]')
          .eq(0)
          .should('have.css', 'background-color')
          .and('eq', 'rgba(219, 217, 181, 0.6)')
        cy.get('[data-test=task-cell-test]')
          .eq(1)
          .should('have.css', 'background-color')
          .and('eq', 'rgba(219, 217, 181, 0.6)')
      })
      describe('when combining the milestone highlight with the user highlight', () => {
        before(() => {
          //cy.get('body').click()
          //cy.get('[data-test=minimised-filters]').click({ force: true })
          //cy.get('[data-test="person-filter-selected-text"]').click()
          cy.get('[data-test=person-filter-you]').click()
        })
        it('should only show & highlight one item', () => {
          // cy.get('[data-test=task-cell-test]')
          //   .eq(0)
          //   .should('have.css', 'background-color')
          //   .and('eq', 'rgba(252, 251, 232, 0.4)')
          cy.get('[data-test=task-cell-test]')
            .eq(0)
            .should('have.css', 'background-color')
            .and('eq', 'rgba(219, 217, 181, 0.6)')
        })
      })
    })
  })
})
