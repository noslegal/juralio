import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('matter_overview_taskmap_display.cy', () => {
  let user, fixture_SWM, fixture_MWM
  const visitHelpers = new VisitHelpers()
  before(() => {
    createUser().then(u => {
      user = u
      const seed_SWM = {
        matter: {
          prefix: 'matter_overview_taskmap_display_SWM',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'P1',
              tasks: [{ name: 'Task 1' }],
            },
          ],
        },
      }
      const seed_MWM = {
        matter: {
          prefix: 'matter_overview_taskmap_display_MWM',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'P1',
              tasks: [{ name: 'Task 1' }],
            },
            {
              name: 'P2',
              tasks: [{ name: 'Task 1' }],
            },
          ],
        },
      }
      fixture_SWM = generateFixture(seed_SWM)
      fixture_MWM = generateFixture(seed_MWM)
    })
  })
  describe('when visiting a SWM matter overview', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitMatterOverview(fixture_SWM.matter.id)
    })
    it('should show the tabs', () => {
      cy.get('[data-test=overview-map-button]').should('be.visible')
      cy.get('[data-test=overview-timeline-button]').should('be.visible')
    })
    describe('when clicking the timeline button', () => {
      before(() => {
        cy.get('[data-test=overview-timeline-button]').click()
      })
      it('should render a taskmap preview', () => {
        cy.get('[data-test=project-overview-taskmap]').should('be.visible')
      })
      describe('when clicking the map button', () => {
        before(() => {
          cy.get('[data-test=overview-map-button]').click()
        })
        it('should render a roadmap preview', () => {
          cy.get('[data-test=project-overview-roadmap]').should('be.visible')
        })
        describe('when visiting a MWM matter overview', () => {
          before(() => {
            cy.login(user.username)

            visitHelpers.visitMatterOverview(fixture_MWM.matter.id)
          })
          it('should not show the tabs', () => {
            cy.get('[data-test=overview-map-button]').should('not.exist')
            cy.get('[data-test=overview-timeline-button]').should('not.exist')
          })
          describe('when visiting a workstream overview', () => {
            before(() => {
              cy.login(user.username)
              visitHelpers.visitProjectOverview(
                fixture_MWM.matter.id,
                fixture_MWM.projects[1].id
              )
            })
            it('should show the tabs', () => {
              cy.get('[data-test=overview-map-button]').should('be.visible')
              cy.get('[data-test=overview-timeline-button]').should(
                'be.visible'
              )
            })
            describe('when clicking the timeline button', () => {
              before(() => {
                cy.get('[data-test=overview-timeline-button]').click()
              })
              it('should render a taskmap preview', () => {
                cy.get('[data-test=project-overview-taskmap]').should(
                  'be.visible'
                )
              })
            })
          })
        })
      })
    })
  })
})
