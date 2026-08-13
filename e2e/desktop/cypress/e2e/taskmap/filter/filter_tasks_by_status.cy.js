import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('filter_tasks_by_status.cy', () => {
  let adminUser, fixture, appPage

  const createUser1 = () =>
    createUser().then(createdUser => (adminUser = createdUser))

  before(() => {
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
                  name: 'not-started 1',
                  teamMembers: [],
                  followers: [],
                },
                {
                  name: 'in-progress 1',
                  teamMembers: [],
                  properties: { status: 'in-progress' },
                },
                {
                  name: 'done',
                  teamMembers: [],
                  properties: { status: 'done' },
                },
                {
                  name: 'level A',
                  teamMembers: [],
                  properties: { status: 'done' },
                  tasks: [{ name: 'level B' }],
                },
              ],
            },
            {
              name: 'P2',
              tasks: [
                {
                  name: 'not-started 2',
                  teamMembers: [],
                  followers: [],
                },
                {
                  name: 'in-progress 2',
                  teamMembers: [],
                  followers: [],
                  properties: {
                    status: 'in-progress',
                  },
                },
                {
                  name: 'nr',
                  teamMembers: [],
                  followers: [],
                  properties: {
                    status: 'task-not-required',
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

  describe('when on the task map', () => {
    before(() => {
      cy.reload()
      cy.login(adminUser.username)
      appPage.visitTaskMap()
      cy.get('[data-test="status-tour-close-forever"]').click()
      cy.get('[data-test=minimised-filters]').click({ force: true })
    })

    it('should have the task filter setting set to "Incomplete"', () => {
      cy.get('[data-test=status-filter-selected-text]', {
        timeout: 30000,
      }).should('have.text', 'Status: NS & IP')
    })

    it('should show 2 tasks on the map', () => {
      cy.get('[data-test=options-dropdown]', { timeout: 30000 }).should(
        'have.length',
        2
      )
    })

    describe('when using the filter to show done tasks', () => {
      before(() => {
        cy.get('[data-test=status-filter-selected-text]', {
          timeout: 30000,
        }).click()
        cy.get('[data-test=done-checkbox]', { timeout: 30000 }).click({
          force: true,
        })
      })
      it('should contain contain 3 tasks', () => {
        cy.get('[data-test=options-dropdown]', { timeout: 30000 }).should(
          'have.length',
          5
        )
      })

      it('should have the task filter setting set to "All"', () => {
        cy.get('[data-test=status-filter-selected-text]', {
          timeout: 30000,
        }).should('have.text', 'Status: NS, IP & D')
      })
    })

    describe('when using the filter to hide not started tasks', () => {
      before(() => {
        cy.get('[data-test="status-filter-selected-text"]').click()
        cy.get('[data-test=not-started-checkbox]').click()
      })
      it('should contain contain 4 tasks', () => {
        cy.get('[data-test=options-dropdown]', { timeout: 30000 }).should(
          'have.length',
          4
        )
      })

      it('should have the task filter setting set to "selected"', () => {
        cy.get('[data-test=status-filter-selected-text]', {
          timeout: 30000,
        }).should('have.text', 'Status: IP & D')
      })
    })

    describe('when using the filter to hide done and not started tasks', () => {
      before(() => {
        cy.get('[data-test=done-checkbox]').click()
      })
      it('should contain 1 task', () => {
        cy.get('[data-test=options-dropdown]', { timeout: 30000 }).should(
          'have.length',
          1
        )
        cy.get('[data-test=status-filter-selected-text]', {
          timeout: 30000,
        }).should('have.text', 'Status: IP')
      })
    })

    describe('when hide all the tasks go to the Overview page and back to the Task Map', () => {
      before(() => {
        cy.login(adminUser.username)
        appPage.changeTaskStatus('in-progress 1', 2)
        appPage.visitTaskMap()
        cy.get('[data-test=minimised-filters]').click({ force: true })
        cy.get('[data-test=status-filter-selected-text]', {
          timeout: 30000,
        }).click({ force: true })
        cy.get('[data-test=not-started-checkbox]').click({ force: true })
        appPage.visitProjectOverview(fixture.matter.id, fixture.projects[0].id)
        appPage.visitTaskMap()
        cy.get('[data-test=minimised-filters]').click({ force: true })
      })

      it('should still have the filters', () => {
        cy.get('[data-test=zero-state-title]').should(
          'have.text',
          'You have hidden all your tasks'
        )
        cy.get('[data-test=status-filter-selected-text]', {
          timeout: 30000,
        }).should('be.visible')
        cy.get('[data-test=person-filter-selected-text]').should('be.visible')
      })
    })
  })

  describe('when on the task map', () => {
    before(() => {
      cy.login(adminUser.username)
      appPage.visitTaskMap(1)
      cy.get('[data-test=minimised-filters]').click({ force: true })
      cy.get('[data-test=status-filter-selected-text]', {
        timeout: 30000,
      }).click()
      cy.get('[data-test=not-started-checkbox]').click({ force: true })
      cy.get('[data-test=status-filter-selected-text]', {
        timeout: 30000,
      }).click({ force: true })
      cy.get('body').type('{esc}')
      cy.wait(2000)
      cy.get('[data-test=task-cell-test]').eq(0).trigger('mouseover')
    })
    it('should not show the quick add arrow', () => {
      cy.get('[data-test=hover-button-bottom]').should('not.be.visible')
    })
  })
})
