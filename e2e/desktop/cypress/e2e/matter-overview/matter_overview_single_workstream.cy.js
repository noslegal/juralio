import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()
describe(
  'matter_overview_single_workstream.cy',
  {
    retries: {
      runMode: 3,
      openMode: 0,
    },
  },
  () => {
    let testUser, fixture, matter, project, project2, appPage

    before(() => {
      createUser()
        .then(createdUser => {
          testUser = createdUser
        })
        .then(() => {
          const seed = {
            matter: {
              teamMembers: [testUser],
              matterAdmins: [testUser],
              projects: [
                {
                  name: 'Overview Spec with Tasks',
                  tasks: [{ name: 'Task1', teamMembers: [testUser] }],
                },
              ],
            },
          }

          fixture = generateFixture(seed)
        })
        .then(() => {
          matter = fixture.matter
          project = fixture.projects[0]
          appPage = getWrapper(fixture)
        })
    })

    describe('When navigating to a matter overview', () => {
      before(() => {
        cy.login(testUser.username)
        visitHelpers.visitMatterOverview(matter.id)
      })
      it('should show the single workstream overview', () => {
        //name
        cy.get('[data-test=bread1]', {
          timeout: 30000,
        }).should('contains.text', matter.name)
        //tab content
        cy.get('[data-test=menuItem]').should('have.length', 3)
        cy.get('[data-test=global-sub-header]')
          .children()
          .eq(0)
          .should('contain.text', 'Overview')
        //overview roadmap
        cy.get('[data-test=project-overview-roadmap-level]', {
          timeout: 30000,
        }).should('have.length', 1)
      })
    })
    describe('navigation from the switcher', () => {
      before(() => {
        cy.login(testUser.username)
        appPage.visitHome()
        cy.get('[data-test=matter-switcher-button]').click()
        cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()
        cy.get('[data-test=workstream-chip-instructions]').click()
      })
      it('should take the user to the matter overview', () => {
        cy.get('[data-test=global-sub-header]')
          .children()
          .eq(0)
          .should('contain.text', 'Overview')
        cy.url().should('contain', 'overview')
        cy.url().should('not.contain', 'workstream')
      })
    })
  }
)
