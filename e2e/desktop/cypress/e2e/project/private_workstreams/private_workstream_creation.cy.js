import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { updateFTUE } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()
describe('private_workstream_creation.cy', () => {
  let orgUsers, otherOrgUsers, fixture

  before(() => {
    createDefaultOrgTestUsers()
      .then(users => {
        orgUsers = users
        updateFTUE(orgUsers.matterAdmin, { hasSeenMatterAdmin: true })
        updateFTUE(orgUsers.matterAdminAndTeamMember, {
          hasSeenMatterAdmin: true,
        })
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
      cy.login(orgUsers.matterAdmin)
      visitHelpers.visitMatter(fixture.matter.id)
      cy.wait(2000)
      cy.get('[data-test=projects]').click()
      cy.get('[data-test="create-new-workstream"]').click()
      cy.get('[data-test=blank-workstream]', { timeout: 30000 }).click()
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
    })
    it('should add the private workstream', () => {
      cy.get('[data-test=action-dialog-button]').click()
      cy.get('[data-rowindex="2"] [data-colindex="0"]').should('exist')
    })

    it('should allow access to the project overview and show the lozenge', () => {
      cy.get('[data-test=matter-switcher-button]').click()
      cy.get('[data-test=matter-switcher-matter-item]', {
        timeout: 30000,
      }).click()
      cy.get('[data-test=matter-switcher-workstream-chip]', {
        timeout: 30000,
      }).should('have.length', 3)
      cy.get('[data-test=matter-switcher-workstream-chip]').eq(2).click()
      cy.wait(2000)
      cy.get('[data-test="private-losenge"]').should('exist')
    })
  })
})
