//zero state
//add people
import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { addPrivateMembers } from '../../../../../helpers/matterprojects/projects_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
} from '../../../../../helpers/organisation/organisation_api_helper'

const visitHelpers = new VisitHelpers()
describe('private_workstream_people_tab.cy', () => {
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
              {
                name: 'private workstream people tab sec',
                properties: {
                  isPrivate: true,
                },
              },{name:'other'}
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when visiting an empty private workstream', () => {
    before(() => {
      cy.login(orgUsers.matterAdmin)
      addPrivateMembers(fixture.matter.id, fixture.projects[0].id, [
        orgUsers.matterAdmin,
      ])
    })
    it('should have a private losenge', () => {
      cy.backendRoute('/matter/*/overview').as('matterOverview')
      visitHelpers.visitMatterOverview(fixture.matter.id)
      cy.wait('@matterOverview')
      cy.get('[data-test=private-losenge]', { timeout: 30000 }).should('exist')
    })

    describe('when the private workstream has some team members', () => {
      before(() => {
        cy.login(orgUsers.matterAdmin)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/teammembers`,
          method: 'POST',
          body: { users: [orgUsers.teamMember.id] },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
      describe('when there is a private team member', () => {
        before(() => {
          cy.login(orgUsers.matterAdmin)
          visitHelpers.visitProjectOverviewPeople(
            fixture.matter.id,
            fixture.projects[0].id
          )
        })
        it('should not show the zero state', () => {
          cy.get('[data-test=people-tab-zero-state]').should('not.exist')
        })
        it('should show the correct table title', () => {
          cy.get('[data-test="private-workstream-people-title"]').should(
            'contain.text',
            'People with access to this workstream'
          )
          cy.get('[data-test="link-to-matter-admin"]').should('be.visible')
        })
        it('should show users despite not being assigned to tasks', () => {
          cy.get('[data-rowindex=0]', {
            timeout: 30000,
          }).should('exist')
          cy.get('[data-test=active-task-count]').should('have.text', '00')
        })
        describe('when click on the "can give or remove access" link', () => {
          before(() => {
            // cy.get('[data-test=link-to-matter-overview]').eq(0).click()
            // cy.get('[data-test=link-to-matter-admin]').eq(0).click()
           
            cy.get('[data-test=link-to-matter-admin]').eq(0).click()
             cy.get('[data-test=projects]').click()
            cy.get('[data-test=private-workstream-settings]').eq(0).click()
          })
          it('should navigate to the people section of the workstream in matter admin', () => {
            // cy.get('[data-test="people-tab"]').should('be.visible')
            cy.get('[data-test="back-to-list-link-text"]', {
              timeout: 30000,
            }).should('have.text', 'Back to workstream list')
          })
        })
      })
    })
  })
})
