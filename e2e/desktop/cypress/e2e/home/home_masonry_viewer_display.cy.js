import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { addMatterViewer } from '../../../../helpers/matterprojects/matter_api_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'

const {
  createUser,
  updateFTUE,
} = require('../../../../helpers/users/user_api_helper')

const visitHelpers = new VisitHelpers()
describe('home_masonry_viewer_display.cy', () => {
  let admin, adminEditor, editor, seed, fixture

  before(() => {
    createUser('', true, true, {
      roles: ['ROLE_MATTER_CREATOR'],
    }).then(createdUser => {
      admin = createdUser
      createUser('', true, true, {
        roles: ['ROLE_MATTER_CREATOR', 'ROLE_USER'],
      }).then(createdUser => {
        adminEditor = createdUser
        updateFTUE(admin, { hasSeenMatterAdmin: true })
        updateFTUE(adminEditor, { hasSeenMatterAdmin: true })
        createUser().then(createdUser => {
          editor = createdUser
          seed = {
            matter: {
              prefex: 'home_masonry',
              teamMembers: [editor],
              matterAdmins: [admin],
              projects: [
                {
                  name: 'Project 1',
                  tasks: [{ name: 'task1', teamMembers: [editor] }],
                },
                {
                  name: 'Project  2',
                  tasks: [
                    { name: 'task2', teamMembers: [editor] },
                    { name: 'task3' },
                  ],
                },
              ],
            },
          }
          fixture = generateFixture(seed)
        })
      })
    })
  })
  describe('when visiting the home page', () => {
    before(() => {
      addMatterViewer(fixture.matter.id, admin.id, 'matter.creator@juralio.com')
      cy.login(admin.username)
      visitHelpers.visitMatter(fixture.matter.id)
      cy.wait(2000)
      cy.get('[data-test=projects]').click()
      cy.get('[data-rowindex="0"] [data-colindex="1"]', {
        timeout: 30000,
      }).click()
      // cy.get('[data-test=status-select-selection-dropdown]').eq(0).click()
      cy.get('[data-test=status-select-off-option]').click()
      cy.wait(1000)
      // cy.get('[data-test="back-to-list-link-text"]').click()
      cy.get('[data-rowindex="1"] [data-colindex="1"]', {
        timeout: 30000,
      }).click()
      // cy.get('[data-test=status-select-selection-dropdown]').eq(0).click()
      cy.get('[data-test=status-select-off-option]').click()
      cy.wait(3000)
      cy.get('[data-test=matter-people]').click()
      cy.wait(1000)
      cy.get(`[title="${admin.username}"]`)
        .parent()
        .parent()
        .find('.MuiInputBase-root > .MuiSelect-select')
        .eq(0)
        .click()
      cy.get('[data-test="view-only"]').click()
      cy.get('[data-test=action-dialog-button]').click()
    })
    it('should show no masonry', () => {
      cy.get('[data-test=home-zero-state-not-matter-editor]', {
        timeout: 30000,
      }).should(
        'have.text',
        'You are not a matter editor or viewer on any active matter or workstream'
      )
    })
    describe('when opening the switcher', () => {
      before(() => {
        cy.get('[data-test=matter-switcher-button]').click()
      })
      it('should have 0 item', () => {
        cy.get('[data-test=matter-switcher-matter-item]').should(
          'have.length',
          0
        )
      })
    })
  })
})
