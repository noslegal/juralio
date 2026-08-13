import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
  createBlankTemplate,
  createTemplateTask,
  publishTemplate,
} from '../../../../helpers/templates/template_api_helper'
import HttpStatus from 'http-status-codes'

const {
  createUser,
  updateFTUE,
} = require('../../../../helpers/users/user_api_helper')

const visitHelpers = new VisitHelpers()
describe('home_masonry.cy', () => {
  let admin, adminEditor, editor, seed, seed_full, seed_5_projects

  before(() => {
    // The trialing/not-confirmed masonry card only renders when user
    // confirmation is enabled instance-wide; ensure it is off so the masonry
    // card counts are deterministic regardless of spec execution order.
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    cy.apiSpecRequest({
      url: `${Cypress.env('serverRootBaseUrl')}/api/admin/instance/settings`,
      method: 'PATCH',
      body: {
        enableUserConfirmation: false,
      },
    }).then(response => {
      expect(response.status).to.eq(HttpStatus.OK)
    })
    createUser('', true, true, {
      roles: ['ROLE_MATTER_CREATOR', 'ROLE_KNOWLEDGE_MANAGER'],
    }).then(createdUser => {
      admin = createdUser
      updateFTUE(admin, { hasSeenMatterAdmin: true })
      createUser('', true, true, {
        roles: ['ROLE_MATTER_CREATOR', 'ROLE_USER'],
      }).then(createdUser => {
        adminEditor = createdUser
        updateFTUE(adminEditor, { hasSeenMatterAdmin: true })
        createUser().then(createdUser => {
          editor = createdUser
          seed_full = {
            matter: {
              prefex: 'home_masonry',
              teamMembers: [editor, adminEditor],
              matterAdmins: [adminEditor, admin],
              projects: [
                {
                  name: 'Project 1',
                  tasks: [{ name: 'task1', teamMembers: [adminEditor] }],
                },
                {
                  name: 'Project 2',
                  tasks: [
                    { name: 'task2', teamMembers: [adminEditor] },
                    { name: 'task3' },
                  ],
                },
              ],
            },
          }
          seed = {
            matter: {
              prefex: 'home_masonry',
              teamMembers: [adminEditor],
              matterAdmins: [adminEditor],
              projects: [],
            },
          }
          seed_5_projects = {
            matter: {
              prefex: 'home_masonry',
              teamMembers: [editor, adminEditor],
              matterAdmins: [adminEditor, admin],
              projects: [
                {
                  name: 'Project 1',
                  tasks: [{ name: 'task1', teamMembers: [adminEditor] }],
                },
                {
                  name: 'Project 2',
                  tasks: [
                    { name: 'task2', teamMembers: [adminEditor] },
                    { name: 'task3' },
                  ],
                },
                {
                  name: 'Project 3',
                  tasks: [
                    { name: 'task4', teamMembers: [adminEditor] },
                    { name: 'task5' },
                  ],
                },
                {
                  name: 'Project 4',
                  tasks: [
                    { name: 'task6', teamMembers: [adminEditor] },
                    { name: 'task7' },
                  ],
                },
                {
                  name: 'Project 5',
                  tasks: [
                    { name: 'task8', teamMembers: [adminEditor] },
                    { name: 'task9' },
                  ],
                },
              ],
            },
          }

          fixture = generateFixture(seed)
          appPage = getWrapper(fixture)
        })
      })
    })
  })
  describe('as an admin with no assigned matters', () => {
    before(() => {
      cy.login(admin.username)
      createBlankTemplate('temp').then(t => {
        template = t
        createTemplateTask(template.id, undefined, 'test')
        publishTemplate(template.id)
      })
      appPage.visitHome()
    })
    it('should show the admin zero state', () => {
      cy.get('[data-test=home-zero-state]').should('be.visible')
      cy.get('[data-test=desktop-home-zero-state]').should(
        'have.text',
        'Welcome to Juralio!'
      )
      cy.get('[data-test=home-zero-state]').should(
        'have.text',
        'To get started, create a matter using the ⊕ button'
      )
    })
  })
  describe('as an editor with no assigned matters', () => {
    before(() => {
      cy.login(editor.username)
      appPage.visitHome()
    })
    it('should show the admin zero state', () => {
      cy.get('[data-test=home-zero-state]').should('be.visible')
      cy.get('[data-test=desktop-home-zero-state]').should(
        'have.text',
        'Welcome to Juralio!'
      )
      cy.get('[data-test=home-zero-state]').should(
        'have.text',
        "You haven't been assigned to any matters yet. Ask someone to add you!"
      )
    })
  })
  describe('as an admin without editor role', () => {
    before(() => {
      fixture = generateFixture(seed_full)
      appPage = getWrapper(fixture)
      cy.login(admin.username)
      visitHelpers.visitHome()
    })
    it(
      'should show the admin zero state',
      { retries: { runMode: 2, openMode: 1 } },
      () => {
        cy.get('[data-test=home-zero-state-not-matter-editor]', {
          timeout: 60000,
        }).should('be.visible')
        cy.get('[data-test=home-zero-state-not-matter-editor]', {
          timeout: 60000,
        }).should(
          'have.text',
          'You are not a matter editor or viewer on any active matter or workstream'
        )
      }
    )
  })
  describe('as an admin editor', () => {
    before(() => {
      cy.login(adminEditor.username)
      appPage.visitHome()
    })
    it('should show me my matters', () => {
      cy.wait(3000)
      cy.get('[data-test=masonry-item]').should('have.length', 3)
      cy.get('[data-test=masonry-client-name]').should(
        'have.text',
        fixture.matter.clientName
      )
      cy.get('[data-test=masonry-matter-name]').should(
        'have.text',
        fixture.matter.name
      )
      cy.get('[data-test=masonry-reference-number]').should(
        'have.text',
        fixture.matter.userDefinedReferenceNumber
      )
      cy.get('[data-test=matter-switcher-workstream-chip]').should(
        'have.length',
        2
      )
      cy.get('[data-test=matter-switcher-workstream-chip]')
        .eq(0)
        .find('[data-test=workstream-chip-title]')
        .should('have.text', fixture.projects[0].name)
      cy.get('[data-test=matter-switcher-workstream-chip]')
        .eq(1)
        .find('[data-test=workstream-chip-title]')
        .should('have.text', fixture.projects[1].name)
      cy.get('[data-test=matter-switcher-workstream-chip]')
        .eq(0)
        .find('[data-test=workstream-chip-tasks]')
        .should('contain.text', 1)
      cy.get('[data-test=matter-switcher-workstream-chip]')
        .eq(1)
        .find('[data-test=workstream-chip-tasks]')
        .should('contain.text', 2)
    })

    //when there is an open and a closed project
    describe('when there is and open and a closed project', () => {
      before(() => {
        cy.get('[data-test=matter-switcher-button]').click()
        // cy.get('[data-test=matter-switcher-matter-item]').eq(1).click()
        cy.get('[data-test=matter-item-matter-name]')
          .contains(fixture.matter.name)
          .click()
        cy.get('[data-test=matter-details-admin-button]').click()
        cy.wait(2000)
        cy.get('[data-test=projects]').click()
        cy.get('[data-test=status-select-selection-dropdown]').eq(0).click()
        cy.get('[data-test=status-select-off-option]').click()
        cy.login(adminEditor)
        appPage.visitHome()
      })
      it('should hide the closed project', () => {
        cy.wait(3000)
        cy.get('[data-test=masonry-item]').should('have.length', 3)
        cy.get('[data-test=masonry-client-name]').should(
          'have.text',
          fixture.matter.clientName
        )
        cy.get('[data-test=masonry-matter-name]').should(
          'have.text',
          fixture.matter.name
        )
        cy.get('[data-test=masonry-reference-number]').should(
          'have.text',
          fixture.matter.userDefinedReferenceNumber
        )
        cy.get('[data-test=matter-switcher-workstream-chip]').should(
          'have.length',
          1
        )
      })
      it('should show the single workstream masonry card', () => {
        cy.wait(3000)
        cy.get('[data-test=masonry-item]').should('have.length', 3)
        cy.get('[data-test=masonry-client-name]').should(
          'have.text',
          fixture.matter.clientName
        )
        cy.get('[data-test=masonry-matter-name]').should(
          'have.text',
          fixture.matter.name
        )
        cy.get('[data-test=masonry-reference-number]').should(
          'have.text',
          fixture.matter.userDefinedReferenceNumber
        )
        cy.get('[data-test=matter-switcher-workstream-chip]').should(
          'have.length',
          1
        )
        cy.get('[data-test=workstream-chip-title]').should('not.exist')
        cy.get('[data-test=matter-switcher-workstream-chip]')
          .find('[data-test=workstream-chip-tasks]')
          .should('contain.text', 2)
      })
    })
    describe('when the matter is closed', () => {
      before(() => {
        cy.get('[data-test=matter-switcher-button]').click()
        cy.get('[data-test=matter-item-matter-name]')
          .contains(fixture.matter.name)
          .click()
        cy.get('[data-test=matter-details-admin-button]').click()
        cy.get('[data-test=status-select-selection-dropdown]').eq(0).click()
        cy.get('[data-test=status-select-off-option]').click()
        cy.login(adminEditor)
        appPage.visitHome()
      })
      it('should not show the closed matter', () => {
        cy.wait(3000)
        cy.get('[data-test=masonry-item]').should('have.length', 0)
      })
    })
    describe('when there are > 4 projects', () => {
      before(() => {
        fixture = generateFixture(seed_5_projects)
        appPage = getWrapper(fixture)
        cy.login(adminEditor)
        appPage.visitHome()
      })
      it('should show 4 projects by default', () => {
        cy.wait(3000)
        cy.get('[data-test=masonry-item]').should('have.length', 3)
        cy.get('[data-test=matter-switcher-workstream-chip]').should(
          'have.length',
          4
        )
      })
      it('should render a see more button', () => {
        cy.get('[data-test=see-more-projects]').should('be.visible')
      })
      describe('when clicking see more', () => {
        before(() => {
          cy.get('[data-test=see-more-projects]').click()
        })
        it('should render all projects', () => {
          cy.wait(3000)
          cy.get('[data-test=masonry-item]').should('have.length', 3)
          cy.get('[data-test=matter-switcher-workstream-chip]').should(
            'have.length',
            5
          )
        })
      })
    })
  })
})
