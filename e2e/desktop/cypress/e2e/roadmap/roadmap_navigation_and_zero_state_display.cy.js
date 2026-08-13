import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import { showDoneTasks } from '../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../helpers/users/user_api_helper'
import { get as roadmap } from '../../../../page/roadmap/roadmap_page'

describe('roadmap_navigation_and_zero_state_display.cy', () => {
  let user, fixture, project, appPage

  before(() => {
    cy.window().then(win => {
      win.sessionStorage.clear()
    })
    createUser()
      .then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'roadmap_navigation_and_zero_state_display.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {},
              {
                tasks: [
                  {
                    name: 'Navigate To Task',
                    properties: { status: 'in-progress' },
                  },
                  {
                    name: 'Another Task',
                    properties: { status: 'done' },
                  },
                ],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
      })
      .then(() => {
        appPage = getWrapper(fixture)
        project = fixture.projects
      })
  })

  describe("When navigating to an empty project's Roadmap", () => {
    before(() => {
      appPage.visitRoadmap()
    })

    it('should set the correct document title', () => {
      cy.title().should('eq', `Roadmap | ${fixture.projects[0].name} | Juralio`)
    })

    it('should show the zero state text', () => {
      roadmap.zerostateTitle().should('be.visible')
      roadmap.zerostateCaption().should('be.visible')
    })

    it('should not show Today label', () => {
      roadmap.todayLabel().should('not.exist')
    })

    it('should display the Date Range labels', () => {
      roadmap.startTimelineLabel().should('not.exist')
      roadmap.endTimelineLabel().should('not.exist')
    })
  })

  describe("When navigating to a populated project's Roadmap", () => {
    before(() => {
      cy.login(user)
      appPage.visitRoadmap(1)
      cy.get('.reactour__close').click()

      showDoneTasks()
    })

    it('should set the correct document title', () => {
      cy.title().should('eq', `Roadmap | ${fixture.projects[1].name} | Juralio`)
    })

    describe('When clicking on the first task', () => {
      before(() => {
        roadmap.tasks().eq(1).click('top', { force: true })
        cy.wait(1000)
      })

      describe('When clicking on another task on the roadmap', () => {
        before(() => {
          cy.get('[data-test=subheader-location-name]').eq(1).click()
          cy.wait(2000)
          roadmap.tasks().eq(0).click({ force: true })
          cy.wait(5000)
        })

        it('should go to the Task details page for that task', () => {
          cy.title().should('eq', 'Task | Another Task | Juralio')
          cy.get('[data-test=read-field]')
            .eq(0)
            .should('contains.text', 'Another Task')
        })
      })
    })
  })
})
