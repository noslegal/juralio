import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { updateFTUE } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()
describe('private_workstream_creation_split.cy', () => {
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
                name: 'public workstream1',
                tasks: [{ name: 'new task' }],
              },
              {
                name: 'public workstream2',
                tasks: [{ name: 'new task' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when creating a new workstream in the matter admin area', () => {
    before(() => {
      updateFTUE(orgUsers.matterAdmin, { hasSeenMatterAdmin: true })
      cy.login(orgUsers.matterAdmin)
      visitHelpers.visitMatter(fixture.matter.id)
      cy.wait(2000)
      cy.get('[data-test=projects]').click()
      cy.wait(5000)
      cy.get('[data-test="create-new-workstream"]').click()
      cy.get('[data-test=split-workstream]', { timeout: 30000 }).click()
    })

    it('should validate the workstream name', () => {
      cy.get('[data-test=workstream-name]').find('input').clear().type('pro1')
      cy.get('[data-test=split-workstream-select]').click()
      cy.get('li').eq(4).click()
    })
    it('should show the add dialog with the private workstream option', () => {
      cy.get('[data-test=toggle-private-workstream]').should('exist')
      cy.get('[data-test=toggle-private-workstream]').click()
    })

    it('should allow users to be added to the private workstream team', () => {
      cy.get('[data-test=add-user-flow-autocomplete-text-field]').should(
        'exist'
      )
      cy.get('[data-test=add-user-flow-autocomplete-text-field]').click()
      cy.get('[data-test=add-user-flow-autocomplete-text-field]')
        .find('input')
        .type(orgUsers.matterAdmin.username)
      cy.get('[data-test=add-user-flow-autocomplete-option]').eq(0).click()
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(5000)
    })
    it('should take the user to task selection screen', () => {
      cy.get('[data-test=task-cell-test]', { timeout: 30000 })
        .eq(0)
        .click({ timeout: 30000, force: true })
      cy.backendRoute('POST', 'matter/*/workstreams/*/task/*/move').as(
        'workstreamSplit'
      )
      cy.get('[data-test=confirm-selection-button]').click()
      cy.wait('@workstreamSplit', { timeout: 10000 })

      cy.get('[data-test=task-cell-test]').should('have.length', 1)
    })

    it('should show the split workstream in the admin table with the private lozenge', () => {
      cy.login(orgUsers.matterAdmin)
      visitHelpers.visitMatter(fixture.matter.id)
      cy.wait(2000)
      cy.get('[data-test=projects]').click()
      cy.get('[data-test=status-select-selection-dropdown]').should('exist')
      cy.get('[data-rowindex="2"] [data-colindex="0"]').should('exist')
    })

    it('should allow access to the project taskmap and show the split task', () => {
      cy.wait(5000)
      cy.get('[data-test=matter-switcher-button]').click()
      cy.get('[data-test=matter-switcher-matter-item]', {
        timeout: 30000,
      }).click()
      cy.get('[data-test=matter-switcher-workstream-chip]', {
        timeout: 30000,
      }).should('have.length', 3)
      cy.get('[data-test=private-losenge]').eq(0).click()
      cy.wait(2000)
      cy.get('[data-test="private-losenge"]').should('exist')
      cy.get('[data-test="taskmap-navigation"]').click()
      cy.get('[data-test=task-cell-test]').should('have.length', 1)
    })
  })
})
