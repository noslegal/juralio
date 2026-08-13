import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createTemplate,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import { updateFTUE } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()
describe('private_workstream_creation_routing.cy', () => {
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
              orgUsers.teamMember,
              orgUsers.knowledgeManager,
              orgUsers.matterAdminAndTeamMember,
              orgUsers.matterAdmin,
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
              {
                name: 'private workstream',
                properties: {
                  isPrivate: true,
                },
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })
  describe('when trying to split a private workstream I am not a member of', () => {
    before(() => {
      updateFTUE(orgUsers.matterAdmin, { hasSeenMatterAdmin: true })
      cy.login(orgUsers.matterAdmin.username)
      visitHelpers.visitMatter(fixture.matter.id)
      cy.wait(2000)
      cy.get('[data-test=projects]').click()
      cy.get('[data-test="create-new-workstream"]').click()
      cy.get('[data-test=split-workstream]', { timeout: 30000 }).click()
      cy.get('[data-test=split-workstream-select]').click()
    })
    it('should not show the private workstream', () => {
      cy.get('[role=listbox]').eq(0).children().should('have.length', 2)
    })
  })
  describe('when trying to split into a pw yout cant see', () => {
    before(() => {
      cy.login(orgUsers.knowledgeManager.username)
      createTemplate('Context Template', fixture.projects[0].id).then(
        template => {
          publishTemplate(template.id)
        }
      )
      cy.login(orgUsers.matterAdmin.username)
      visitHelpers.visitMatter(fixture.matter.id)
      cy.wait(2000)
      cy.get('[data-test=projects]').click()
      cy.get('[data-test="create-new-workstream"]').click()
      cy.get('[data-test=split-workstream]', { timeout: 30000 }).click()
      cy.get('[data-test=split-workstream-select]').click()
      cy.wait(5000)
      cy.get('[role=listbox]').eq(0).children().eq(1).click()
      cy.get('[data-test=workstream-name]')
        .find('input')
        .clear()
        .type('PW split')
      cy.get('[data-test=toggle-private-workstream]').click()
      cy.get('[data-test=add-user-flow-autocomplete-text-field]').click()
      cy.get('[data-test=add-user-flow-autocomplete-text-field]')
        .find('input')
        .type(orgUsers.teamMember.username)
      cy.get('[role=listbox]').eq(0).children().eq(0).click()
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(3000)
      cy.get('[data-test=task-cell-test]', { timeout: 30000 })
        .eq(0)
        .click({ force: true })
      cy.get('[data-test=confirm-selection-button]').click()
      cy.wait(3000)
    })
    it('should return the user to the matter admin page', () => {
      cy.get('[data-test=panel-title]').should('have.text', 'Admin summary')
    })
  })
  describe('when trying to use a template as a pw you cant see from matter admin', () => {
    before(() => {
      cy.login(orgUsers.matterAdmin.username)
      visitHelpers.visitMatter(fixture.matter.id)
      cy.wait(2000)
      cy.get('[data-test=projects]').click()
      cy.get('[data-test="create-new-workstream"]').click()

      cy.get('[data-test=create-workstream-from-template]').click()
      cy.get('[data-test=template-name]').eq(0).click()
      cy.get('[data-test=action-dialog-button]').click()
      cy.get('[data-test=toggle-private-workstream]').click()
      cy.get('[data-test=add-user-flow-autocomplete-text-field]').click()
      cy.get('[data-test=add-user-flow-autocomplete-text-field]')
        .find('input')
        .type(orgUsers.teamMember.username)
      cy.get('[role=listbox]').eq(0).children().eq(0).click()
      cy.get('[data-test=action-dialog-button]').click()
    })
  })
  describe('when trying to use a template as a pw you cant see', () => {
    before(() => {
      cy.login(orgUsers.matterAdmin.username)
      visitHelpers.visitTemplates()

      cy.get('[data-test=template-name]').eq(0).click()
      cy.wait(5000)
      cy.get('[data-test=use-template-button]', { timeout: 30000 }).click()
      cy.get('[data-test=action-dialog-button]').click()
      cy.get('[data-test=auto-complete-search-term]').eq(0).click()
      cy.get('[data-test=auto-complete-search-term]')
        .eq(0)
        .find('input')
        .type(`${fixture.matter.name}`)
      cy.get('[data-test=matter-select-menu-item]').eq(0).click()
      cy.get('[data-test=destination-select]').click()
      cy.get('[data-test=new-stream]').click()
      cy.get('[data-test=new-name]').find('input').type('pw from tp')
      cy.get('[data-test=toggle-private-workstream]').click()
      cy.get('[data-test=add-user-flow-autocomplete-text-field]').click()
      cy.get('[data-test=add-user-flow-autocomplete-text-field]')
        .find('input')
        .type(orgUsers.teamMember.username)
      cy.get('[role=listbox]').eq(0).children().eq(0).click()
      cy.get('[data-test=action-dialog-button]').click()
    })
  })
})
