import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { get as roadmap } from '../../../../../page/roadmap/roadmap_page'

describe('roadmap_filter_tasks_by_status.cy', () => {
  let adminUser, fixture, appPage

  const createUser1 = () =>
    createUser().then(createdUser => (adminUser = createdUser))

  before(() => {
    cy.window().then(win => {
      win.sessionStorage.clear()
    })
    createUser1().then(() => {
      const seed = {
        matter: {
          prefix: 'task_status_event',
          teamMembers: [adminUser],
          matterAdmins: [adminUser],
          projects: [
            {
              name: 'Law Project',
              tasks: [
                {
                  name: 'not-started',
                  properties: { status: 'not-started' },
                },
                {
                  name: 'in-progress a',
                  properties: { status: 'in-progress' },
                },
                {
                  name: 'nr',
                  properties: { status: 'task-not-required' },
                },
                {
                  name: 'in-progress b',
                  properties: { status: 'in-progress' },
                  tasks: [
                    {
                      name: 'This has not started',
                      properties: { status: 'not-started' },
                    },
                  ],
                },
                {
                  name: 'in-progress c',
                  properties: { status: 'in-progress' },
                  tasks: [
                    {
                      name: 'This has been done',
                      properties: { status: 'done' },
                    },
                  ],
                },
                {
                  name: 'done',
                  properties: { status: 'done' },
                },
                {
                  name: 'level A',
                  properties: { status: 'not-started' },
                },
              ],
            },
            {
              name: 'p2',
              tasks: [
                {
                  name: 'p2-in-progress',
                  properties: { status: 'in-progress' },
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

  describe('when on the task map', () => {
    before(() => {
      cy.login(adminUser.username)
      appPage.visitRoadmap()
      cy.get('.reactour__close').click()

      cy.get('[data-test=unselected-end-cap]').eq(0).trigger('mouseover', {
        force: true,
      })
      cy.get('[data-test=expand-hovered-end-cap]').click()
      cy.wait(5000)
    })

    it('should show all the incomplete tasks', () => {
      cy.get('[data-test=options-dropdown]').should('have.length', 6)
    })

    describe('when using the filter to show done tasks', () => {
      before(() => {
        cy.get('[data-test=minimised-filters]').click({ force: true })
        cy.get('[data-test=done-checkbox]').click()
      })
      it('should show all the tasks', () => {
        cy.get('[data-test=options-dropdown]').should('have.length', 7)
      })

      it('should have the task filter setting set to "All"', () => {
        cy.get('[data-test=status-filter-selected-text]').should(
          'have.text',
          'Status: NS, IP & D'
        )
      })
    })

    describe('when using the filter to hide not started tasks', () => {
      before(() => {
        cy.get('[data-test=not-started-checkbox]').click()
      })
      it('should show in-progress and done tasks', () => {
        cy.get('[data-test=options-dropdown]').should('have.length', 4)
      })

      it('should have the task filter setting set to "selected"', () => {
        cy.get('[data-test=status-filter-selected-text]').should(
          'have.text',
          'Status: IP & D'
        )
      })
    })

    describe('when using the filter to hide done and not started tasks', () => {
      before(() => {
        cy.get('[data-test=done-checkbox]').click()
      })
      it('should show in-progress tasks', () => {
        cy.get('[data-test=options-dropdown]').should('have.length', 3)
        cy.get('[data-test=status-filter-selected-text]').should(
          'have.text',
          'Status: IP'
        )
      })
    })

    describe('when using the reset filters button', () => {
      before(() => {
        // cy.get('body').click()
        // cy.get('[data-test=selected-level-a]').eq(0).click()
        cy.get('[data-test=reset-filters]').click()
        cy.wait(1000)
      })
      it('should show all tasks', () => {
        cy.get('[data-test=options-dropdown]').should('have.length', 6)
        cy.get('[data-test=status-filter-selected-text]').should(
          'have.text',
          'Status: NS & IP'
        )
      })
    })

    describe('when using the filter to hide tasks which exist as subtasks (done and not-started) and then expand everything', () => {
      before(() => {
        //cy.get('body').click()

        // roadmap.collapseAllButton().click({ force: true })
        // cy.get('[data-test=status-filter-selected-text]').click({ force: true })
        cy.get('[data-test=not-started-checkbox]').click()
        //  cy.get('[data-test=status-filter-selected-text]').click({ force: true })
      })
      it('should only show in-progress tasks', () => {
        cy.get('[data-test=options-dropdown]').should('have.length', 3)
        cy.get('[data-test=status-filter-selected-text]').should(
          'have.text',
          'Status: IP'
        )
      })
    })
    describe('when hovering over a checkbox for a status that has no tasks', () => {
      before(() => {
        cy.login(adminUser.username)
        appPage.visitRoadmap(1)
        cy.get('[data-test=minimised-filters]').click({ force: true })
        //cy.get('[data-test=status-filter-selected-text]').click()
      })
      describe('hovering over the done task', () => {
        before(() => {
          cy.get('[data-test=done-checkbox]').trigger('mouseover', {
            force: true,
          })
        })
        it('should disable the options', () => {
          cy.get('[data-test=done-checkbox]')
            .find('input')
            .should('be.disabled')
          cy.get('[role=tooltip]').should(
            'contain.text',
            'There are no done tasks'
          )
        })
        after(() => {
          cy.get('[data-test=done-checkbox]').trigger('mouseout', {
            force: true,
          })
        })
      })
      describe('hovering over the not-started task', () => {
        before(() => {
          cy.get('[data-test=not-started-checkbox]').trigger('mouseover', {
            force: true,
          })
        })
        it('should disable the options', () => {
          cy.get('[data-test=not-started-checkbox]')
            .find('input')
            .should('be.disabled')
          cy.get('[role=tooltip]').should(
            'contain.text',
            'There are no tasks not started'
          )
        })
        after(() => {
          cy.get('[data-test=not-started-checkbox]').trigger('mouseout', {
            force: true,
          })
        })
      })
    })

    describe('when hide all the tasks go to the Overview page and back to the Task Map', () => {
      before(() => {
        cy.login(adminUser.username)
        appPage.changeTaskStatus('in-progress a', 2)
        appPage.changeTaskStatus('This has not started', 2)
        appPage.changeTaskStatus('in-progress b', 2)
        appPage.changeTaskStatus('in-progress c', 2)
        appPage.visitRoadmap()
        cy.get('[data-test=minimised-filters]').click({ force: true })
        cy.wait(2000)
        cy.get('[data-test=not-started-checkbox]').click()
        cy.wait(2000)
        appPage.visitProjectOverview(fixture.matter.id, fixture.projects[0].id)
        cy.wait(2000)
        appPage.visitRoadmap()
      })

      it('should still have the filters', () => {
        cy.get('[data-test=zero-state-title]').should(
          'have.text',
          'You have hidden all your tasks'
        )
        cy.get('[data-test=minimised-filters]').click({ force: true })
        cy.get('[data-test=status-filter-selected-text]').should('be.visible')
        cy.get('[data-test=person-filter-selected-text]').should('be.visible')
      })
    })

    describe('when you show nr tasks on the roadmap', () => {
      before(() => {
        cy.login(adminUser.username)

        appPage.visitRoadmap()
        cy.get('[data-test=minimised-filters]').click({ force: true })
        //cy.get('[data-test=status-filter-selected-text]').click()
        cy.get('[data-test=not-required-checkbox]').click()
      })

      it('should show the nr task', () => {
        cy.get('[data-test=task-cell-test]').should('contain', 'nr')
      })
    })
  })
})
