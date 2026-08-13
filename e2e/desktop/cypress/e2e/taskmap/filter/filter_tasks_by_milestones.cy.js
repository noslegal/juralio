import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { getTaskCellByTaskName } from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('filter_tasks_by_milestones.cy', () => {
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
                  name: 'Milestone',
                  teamMembers: [adminUser],
                  properties: { isMilestone: true },
                  followers: [],
                },
                {
                  name: 'Not milestone',
                  teamMembers: [],
                  properties: { status: 'not-started' },
                },
                {
                  name: 'Milestone not teammember',
                  teamMembers: [],
                  properties: { isMilestone: true },
                  followers: [],
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

  describe('when filtering by milestone on the taskmap', () => {
    before(() => {
      cy.reload()
      cy.login(adminUser.username)
      appPage.visitTaskMap()
      cy.wait(5000)
    })

    it('should show 2 tasks on the map', () => {
      cy.get('[data-test=options-dropdown]').should('have.length', 3)
    })

    describe('when using the filter to highlight milestone tasks', () => {
      before(() => {
        cy.get('[data-test=minimised-filters]').click({ force: true })
        // cy.get('[data-test=status-filter-selected-text]').click()
        cy.get('[data-test=task-type-milestone]').click({ force: true })
        cy.wait(3000)
        // cy.get('body').click()
      })
      it('should highlight the first task', () => {
        getTaskCellByTaskName('Milestone').should(
          'have.css',
          'background-color',
          'rgba(219, 217, 181, 0.6)'
        )
      })
      it('should filter in the third task', () => {
        getTaskCellByTaskName('Milestone not teammember').should(
          'have.css',
          'background-color',
          'rgba(219, 217, 181, 0.6)'
        )
      })
    })

    describe('when using the user highlight filter aswell as the milestone filter', () => {
      before(() => {
        cy.get('body').click()
        cy.get('[data-test=minimised-filters]').click({ force: true })
        cy.get('[data-test=person-filter-selected-text]').click()
        cy.get('[data-test=person-filter-you]').click()
      })
      it('should keep highlighting the first task', () => {
        getTaskCellByTaskName('Milestone').should(
          'have.css',
          'background-color',
          'rgba(219, 217, 181, 0.6)'
        )
      })
    })
  })
})
