import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createTemplateFromProject } from '../../../../../helpers/templates/template_helper'
import { updateFTUE } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()
describe('private_workstream_creation_template.cy', () => {
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
              orgUsers.knowledgeManager,
            ],
            matterViewer: [orgUsers.matterViewer],
            projects: [
              {
                name: 'public workstream1',
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
      updateFTUE(orgUsers.knowledgeManager, { hasSeenMatterAdmin: true })
      cy.login(orgUsers.knowledgeManager)
      visitHelpers.visitTemplates()
      createTemplateFromProject('temp', 'importantMatter', 'public workstream1')
      cy.wait(5000)
      cy.get('[data-test=status-tour-close-forever]').click()
      cy.get('[data-test="publish-template"]').click()
      cy.wait(3000)
      cy.get('[data-test=action-dialog-button]').click()
      visitHelpers.visitMatter(fixture.matter.id)
      cy.wait(2000)
      cy.get('[data-test=projects]').click()
      cy.get('[data-test="create-new-workstream"]').click()
      cy.get('[data-test="workstream-name"]').eq(0).find('input').type('old')
      cy.get('[data-test="workstream-name"]').eq(1).find('input').type('new')
      cy.get('[data-test=create-workstream-from-template]').click()
    })
    it('should show the select template option', () => {
      cy.get('[data-test=template]').should('exist')
      cy.wait(5000)
      cy.get('[data-test=template]').eq(0).click()
      cy.get('[data-test=action-dialog-button]').click()
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
        .type(orgUsers.knowledgeManager.username)
      cy.get('[data-test=add-user-flow-autocomplete-option]').eq(0).click()
    })
    it('should add the private workstream', () => {
      cy.get('[data-test=action-dialog-button]').click()
      cy.get('[data-rowindex="1"] [data-colindex="0"]', {
        timeout: 30000,
      }).should('exist')
    })

    it('should allow access to the project overview and show the lozenge', () => {
      cy.get('[data-test=matter-switcher-button]').click()
      cy.get('[data-test=matter-switcher-matter-item]', {
        timeout: 30000,
      }).click()
      cy.get('[data-test=matter-switcher-workstream-chip]').eq(1).click()
      cy.wait(2000)
      cy.get('[data-test="private-losenge"]').should('exist')
    })
  })
})
