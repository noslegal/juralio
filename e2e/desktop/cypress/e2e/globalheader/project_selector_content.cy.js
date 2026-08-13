import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import {
  addMatterAdmin,
  addTeamMember,
  createMatter,
  updateMatterStatus,
} from '../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../helpers/matterprojects/projects_api_helper'
import { openSelector } from '../../../../helpers/navigation/project-selector-helper'
import {
  createUser,
  updateFTUE,
} from '../../../../helpers/users/user_api_helper'
import matterPage from '../../../../page/matterprojects/matter_page'
import { get } from '../../../../page/project/project_selector_page'

let tenDaysBeforeNow = new Date()
let tenDaysFromNow = new Date()
let twentyDaysFromNow = new Date()
const now = new Date()
let testUser

describe('project_selector_content.cy', () => {
  let fixture, user, matterWhereUserMTM, matterWhereUserMA, appPage

  before(() => {
    now.setMinutes(now.getMinutes() - 15) // subtract a few minutes to allow for some deviation & client & server clocks

    tenDaysBeforeNow.setDate(now.getDate() - 10)
    tenDaysFromNow.setDate(now.getDate() + 10)
    twentyDaysFromNow.setDate(now.getDate() + 20)
    createUser().then(user => (testUser = user))

    createUser().then(createdUser => {
      user = createdUser
      updateFTUE(user, { hasSeenMatterAdmin: true })
      const seed = {
        matter: {
          prefix: 'navigation_buttons.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Test Project',
              tasks: [
                {
                  name: 'Test Task',
                  teamMembers: [user],
                  properties: {
                    status: 'in-progress',
                    actualStartDate: tenDaysBeforeNow,
                  },
                },
              ],
            },
            {
              name: 'Test Project B',
              tasks: [
                {
                  name: 'Test Task B',
                  teamMembers: [user],
                  properties: {
                    plannedStartDate: tenDaysBeforeNow,
                    plannedEndDate: tenDaysFromNow,
                  },
                },
                {
                  name: 'Test Task C',
                  teamMembers: [user],
                  properties: {
                    plannedStartDate: tenDaysBeforeNow,
                    plannedEndDate: twentyDaysFromNow,
                  },
                },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when a user opens the project selector', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitHome()
      openSelector()
      cy.backendRoute('/matter/*/team*').as('teamFetch')
      cy.backendRoute('/matter/*/workstream**').as('projectFetch')
      cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()
      cy.wait(['@teamFetch', '@projectFetch'])
    })

    it('should render a project selector expanded view', () => {
      get.openSelector().should('exist')
    })

    it('should not have a closed chip', () => {
      cy.get('[data-test=closed-chip]').should('not.exist')
    })

    describe('when a user clicks the matter', () => {
      before(() => {
        cy.get('[data-test=matter-switcher-workstream-chip]')
          .eq(0)
          .trigger('mouseover')
        cy.wait(1000)
      })
      it('the settings cog should be shown', () => {
        cy.get('[data-test=matter-details-admin-button]').should('exist')
      })

      it('the heading has the text "Workstreams in this matter"', () => {
        cy.get('[data-test=matter-details-workstreams-title]').should(
          'have.text',
          ' 2 Workstreams'
        )
      })

      it('the projects for the matter should be shown', () => {
        cy.get('[data-test=matter-switcher-mask]')
          .find('[data-test=matter-switcher-workstream-chip]')
          .should('have.length', 2)
      })
      it('the project should have a task count, status bar and nav buttons', () => {
        cy.get('[data-test=workstream-chip-tasks]').should('exist')
        cy.get('[data-test=workstream-chip-status-bar]').should('exist')
        get.overviewButton().should('exist')
      })

      describe('and clicks the setting option', () => {
        before(() => {
          cy.get('[data-test=matter-details-admin-button]').first().click()
        })

        it('the user should be redirect to matter details', () => {
          matterPage.get.userDefinedReferenceNumber().should('exist')
        })
      })

      describe('and clicks the project card', () => {
        before(() => {
          openSelector()
          cy.backendRoute('/matter/*/team*').as('teamFetch')
          cy.backendRoute('/matter/*/workstream**').as('projectFetch')
          cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()
          cy.wait(['@teamFetch', '@projectFetch'])
          cy.get('[data-test=matter-switcher-workstream-chip]', {
            timeout: 30000,
          })
            .eq(0)
            .click()
        })
      })

      describe('and clicks the project overview', () => {
        before(() => {
          openSelector()
          get.overviewButton().first().click()
        })
      })

      describe('and clicks the project taskmap', () => {
        before(() => {
          openSelector()

          get.overviewButton().eq(0).click()
          get.taskMapButton().first().click()
        })

        it('the user should be redirect to project taskmap', () => {
          cy.wait(2000)
          cy.get('[data-test=task-cell-test]', { timeout: 30000 }).should(
            'exist'
          )
        })
      })
    })

    describe('when user selects second matter and project and opens the selector', () => {
      before(() => {
        createMatter()
          .then(m => {
            matterWhereUserMA = m
            addMatterAdmin(m.id, user.id)
          })
          .then(() => createMatter())
          .then(matter => {
            matterWhereUserMTM = matter
            addTeamMember(matter.id, user.id)
            addMatterAdmin(matter.id, user.id)
            cy.login(user.username)

            createProject(matterWhereUserMTM.id, 'Active project').then(() => {
              openSelector()
              cy.wait(1000)
              cy.backendRoute('/matter/*/team*').as('teamFetch')
              cy.backendRoute('/matter/*/workstream**').as('projectFetch')
              // cy.get('[data-test=matter-switcher-matter-item]').eq(2).click()
              cy.get('[data-test=matter-item-matter-name]')
                .contains(matter.name)
                .click()
              // cy.wait(['@teamFetch', '@projectFetch'])
            })
          })
      })

      it('the new matters projects should be shown as just work', () => {
        cy.get('[data-test=workstreams-title]').should(
          'contain',
          "This matter's work"
        )
      })

      describe('when clicking one of these projects and opening selector', () => {
        before(() => {
          cy.backendRoute('/matter/*').as('getMatter')
        })

        it('the currently viewed matter should be selected', () => {
          cy.get('[data-test=matter-item-matter-name]').should(
            'contain',
            fixture.matter.name
          )
        })
      })

      describe('when expanding a matter where the user is an MA, but not an MTM', () => {
        before(() => {
          cy.login(user)
          cy.get('[data-test=matter-item-matter-name]')
            .contains(matterWhereUserMA.name)
            .click()
          cy.get('[data-test=matter-details-admin-button]').click()
          cy.wait(2000)
          cy.get('[data-test=matter-people]').click()
          openSelector()

          cy.backendRoute('/matter/*/workstreams?**').as('getProjects')
          cy.backendRoute('/matter/*/team*').as('teamFetch')
          cy.backendRoute('/matter/*/workstream**').as('projectFetch')
        })

        it('the access denied zero state should be displayed', () => {
          cy.get('[data-test=matter-details-no-workstreams]', {
            timeout: 30000,
          }).should(
            'contain',
            'You are a matter admin but not a matter editor, so cannot see the work in this matter'
          )
        })
      })
      describe('when expanding a matter where the user is an MA, and a MTM', () => {
        before(() => {
          addTeamMember(matterWhereUserMA.id, user.id)
          cy.reload()
          cy.login(user)
          openSelector()
          cy.wait(5000)
          // openSelector()

          cy.get('[data-test=matter-details-admin-button]').click()
          cy.get('[data-test=status-select-selection-dropdown]').click()
          cy.get('[data-test=status-select-off-option]').click()
          openSelector()
        })
        it('the access denied zero state should be displayed', () => {
          cy.get('[data-test=matter-details-no-workstreams]', {
            timeout: 30000,
          }).should(
            'contain',
            'This matter is closed. Press ⚙️ (top right) to access the admin and see information or re-open.'
          )
        })
      })
    })

    describe('when user selects a matter with no projects', () => {
      let returnedMatter
      before(() => {
        cy.get('[data-test=home]').click('left', { force: true })
        createMatter().then(matter => {
          returnedMatter = matter
          addTeamMember(matter.id, user.id)
          addMatterAdmin(matter.id, user.id)

          cy.reload()
          cy.login(user.username)
          appPage.visitHome()

          openSelector()
          cy.wait(1000)
          cy.get('[data-test=matter-item-matter-name]')
            .contains(returnedMatter.name)
            .click()
        })
      })

      it('the new matters projects should be shown', () => {
        cy.get('[data-test=matter-details-no-workstreams]').should(
          'contain',
          'There are no active workstreams on this matter that you have access to'
        )
      })
    })

    describe('when a matter is closed', () => {
      let returnedMatter
      before(() => {
        createMatter().then(matter => {
          returnedMatter = matter
          addTeamMember(matter.id, user.id)
          addMatterAdmin(matter.id, user.id)
          updateMatterStatus(matter.id, 'closed')
          cy.login(user.username)
          cy.reload()
          openSelector()
          cy.wait(1000)
          cy.get('[data-test=closed-matters-checkbox]').click()
          cy.get('[data-test=matter-item-matter-name]')
            .contains(returnedMatter.name)
            .click()
        })
      })
      it('the matter should have closed chip', () => {
        cy.get('[data-test=closed-chip]').should('contain', 'Closed')
      })
    })

    describe('when >8 admins and team members', () => {
      before(() => {
        createMatter().then(matter => {
          let i = 0
          for (i = 0; i < 9; i++) {
            createUser().then(createdUser => {
              addTeamMember(matter.id, createdUser.id)
            })
          }
          addTeamMember(matter.id, user.id)
          addMatterAdmin(matter.id, user.id)
          cy.login(user.username)
          cy.reload()
          openSelector()
          cy.wait(1000)
          cy.get('[data-test=matter-switcher-matter-item]')
            .contains(matter.name)
            .click()
        })
      })

      describe('and the overflow avatar is clicked', () => {
        before(() => {
          cy.get('[data-test=overflow-avatar]').click()
        })

        it('should show a list of the overflow users', () => {
          cy.get('[data-test=pop-up-menu]').should('exist')
        })
      })
    })
  })
})
