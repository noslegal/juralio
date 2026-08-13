import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
} from '../../../../../helpers/organisation/organisation_api_helper'

const visitHelpers = new VisitHelpers()
describe('private_workstream_in_content_search.cy', () => {
  let orgUsers, otherOrgUsers, fixture

  before(() => {
    createDefaultOrgTestUsers()
      .then(users => {
        orgUsers = users
      })
      .then(() => createPopulatedDummyOrg('otherOrg'))
      .then(users => {
        otherOrgUsers = users
      })
      .then(() => {
        const seed = {
          matter: {
            prefix: 'importantMatter',
            teamMembers: [
              orgUsers.matterAdminAndTeamMember,
              orgUsers.matterAdmin,
              orgUsers.teamMember,
              orgUsers.knowledgeManager,
            ],
            matterAdmins: [
              orgUsers.matterAdminAndTeamMember,
              orgUsers.matterAdmin,
            ],
            matterViewer: [orgUsers.matterViewer],
            projects: [
              {
                name: 'A',
                tasks: [{ name: 'task 1' }],
                properties: { isPrivate: true },
                privateTeam: [
                  orgUsers.matterAdminAndTeamMember,
                  orgUsers.teamMember,
                ],
              },
              { name: 'B', tasks: [{ name: 'task 2' }] },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })
  describe('as a matter admin who is a team member', () => {
    before(() => {
      cy.login(orgUsers.matterAdmin)
      visitHelpers.visitMatterOverview(fixture.matter.id)
    })
    describe('when searching in context', () => {
      before(() => {
        cy.backendRoute('/universal/search**').as('search')
        cy.get('[data-test=search-icon]').click()
        cy.get('[data-test=global-searchbar]')
          .find('input')
          .clear()
          .type('task')
        cy.wait(5000)
        //  cy.wait('@search')
      })
      it('should only have 1 response', () => {
        cy.get('[data-test=search-result-item]').should('have.length', 1)
        cy.get('[data-test=search-result-title]')
          .eq(0)
          .should('have.text', 'task 2')
      })
      describe('when in context', () => {
        before(() => {
          cy.login(orgUsers.matterAdmin)
          visitHelpers.visitMatterOverview(fixture.matter.id)
          cy.backendRoute('**/search**').as('search')
          cy.get('[data-test=search-icon]').click()
          cy.get('[data-test=global-searchbar]')
            .find('input')
            .clear()
            .type('task 1')
          //  cy.wait('@search')
        })
        it('should not show the private results', () => {
          cy.get('[data-test=no-results-search]').should('be.visible')
        })
      })
    })
  })
  describe('as a matter admin who is a private team member', () => {
    before(() => {
      cy.login(orgUsers.matterAdminAndTeamMember)
      cy.backendRoute('/matter/*/overview').as('matterOverview')
      visitHelpers.visitMatterOverview(fixture.matter.id)
      cy.wait('@matterOverview')
    })
    describe('when searching in context', () => {
      // it('test', () => {
      //   expect(1).to.eq(1)
      // })
      before(() => {
        cy.wait(5000)
        cy.backendRoute('/universal/search**').as('search')
        cy.get('[data-test=search-icon]').click()
        cy.get('[data-test=global-searchbar]')
          .find('input')
          .clear()
          .type('task')
        // cy.wait('@search')
      })
      it('should only have 2 response', () => {
        cy.get('[data-test=search-result-item]').should('have.length', 2)
        cy.get('[data-test="search-results-list"]').should(
          'contain.text',
          'task 2'
        )
        cy.get('[data-test="search-results-list"]').should(
          'contain.text',
          'task 1'
        )
      })
      describe('when in context', () => {
        before(() => {
          cy.login(orgUsers.matterAdminAndTeamMember)
          visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
          cy.backendRoute('**/search**').as('search')
          cy.get('[data-test=search-icon]').click()
          cy.get('[data-test=global-searchbar]')
            .find('input')
            .clear()
            .type('task')
          // cy.wait('@search')
        })
        it('should show the private results', () => {
          cy.get('[data-test=search-result-item]').should('have.length', 2)
          cy.get('[data-test="search-results-list"]').should(
            'contain.text',
            'task 2'
          )
          cy.get('[data-test="search-results-list"]').should(
            'contain.text',
            'task 1'
          )
        })
      })
    })
  })
  describe('as a private team member', () => {
    before(() => {
      cy.login(orgUsers.teamMember)
      visitHelpers.visitMatterOverview(fixture.matter.id)
    })
    describe('when searching in context', () => {
      before(() => {
        cy.backendRoute('/universal/search**').as('search')
        cy.get('[data-test=search-icon]').click()
        cy.get('[data-test=global-searchbar]')
          .find('input')
          .clear()
          .type('task')
        // cy.wait('@search')
      })
      it('should only have 2 response', () => {
        cy.get('[data-test=search-result-item]').should('have.length', 2)
        cy.get('[data-test="search-results-list"]').should(
          'contain.text',
          'task 2'
        )
        cy.get('[data-test="search-results-list"]').should(
          'contain.text',
          'task 1'
        )
      })
      describe('when in context', () => {
        before(() => {
          cy.login(orgUsers.teamMember)
          visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
          cy.backendRoute('**/search**').as('search')
          cy.get('[data-test=search-icon]').click()
          cy.get('[data-test=global-searchbar]')
            .find('input')
            .clear()
            .type('task 1')
          // cy.wait('@search')
        })
        it('should show the private results', () => {
          cy.get('[data-test=search-result-item]').should('have.length', 1)
          cy.get('[data-test=search-result-title]')
            .eq(0)
            .should('have.text', 'task 1')
        })
      })
    })
  })
})
