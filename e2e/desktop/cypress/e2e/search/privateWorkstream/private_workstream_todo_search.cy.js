//add user to task that is due, then make workstream private
import { updatePED } from '../../../../../helpers/date/date_api_helper'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
} from '../../../../../helpers/organisation/organisation_api_helper'

const visitHelpers = new VisitHelpers()
describe('private_workstream_todo_search.cy', () => {
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
              orgUsers.matterAdmin,
              orgUsers.teamMember,
              orgUsers.knowledgeManager,
              orgUsers.matterAdminAndTeamMember,
            ],
            matterAdmins: [
              orgUsers.matterAdmin,
              orgUsers.matterAdminAndTeamMember,
            ],
            matterViewer: [orgUsers.matterViewer],
            projects: [
              { name: 'template source project', tasks: [{ name: 'task 1' }] },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })
  describe('when assigned a tas', () => {
    before(() => {
      cy.login(orgUsers.teamMember)
      visitHelpers.visitTaskDetails(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id
      )
      cy.wait(3000)
      cy.get('[data-test=add-team-member-button]').click()
      cy.get('[data-test=autocomplete-search]')
        .find('input')
        .type(`${orgUsers.teamMember.firstname}{enter}`)
      cy.wait(1000)
      updatePED(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        '-',
        4
      ).then(() => {
        cy.wait(5000)
        cy.login(orgUsers.teamMember)
        visitHelpers.visitHome()
        cy.get('[data-test=todo-range-picker-button]').click()
        cy.get('[data-test=todo-option-all]').click()
      })
    })
    it('should have 1 task to do', () => {
      cy.get('[data-test=todo-item]').should('have.length', 1)
    })
    describe('when that workstream is made private', () => {
      before(() => {
        cy.login(orgUsers.matterAdmin)
        let url = `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}`
        cy.apiSpecRequest({
          url,
          method: 'PATCH',
          body: { isPrivate: true },
        }).then(response => {
          expect(response.status).to.eq(200)
          cy.wait(5000)
          cy.login(orgUsers.teamMember)
          visitHelpers.visitHome()
        })
      })
      it('should no longer show the todo', () => {
        cy.get('[data-test=todo-item]').should('not.exist')
      })
    })
  })
})
