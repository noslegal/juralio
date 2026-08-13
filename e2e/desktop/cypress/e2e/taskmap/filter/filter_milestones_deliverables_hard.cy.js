import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { getTaskCellByTaskName } from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('filter_milestones_deliverables_hard.cy', () => {
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
                  name: 'Deliverable',
                  teamMembers: [],
                  properties: { isDeliverable: true },
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

    it('should show 1 tasks on the map', () => {
      cy.get('[data-test=options-dropdown]').should('have.length', 3)
    })

    describe('when using the filter to show milestone tasks', () => {
      before(() => {
        cy.get('[data-test=minimised-filters]').click({ force: true })
        cy.get('[data-test=task-type-milestone]').click({ force: true })
        cy.wait(3000)
      })
      it('should only show the milestone task', () => {
        cy.get('[data-test=task-cell-test]', { timeout: 30000 }).should(
          'have.length',
          '1'
        )
      })
    })

    describe('when using the filter to show deliverables tasks', () => {
      before(() => {
        // cy.get('[data-test=minimised-filters]').click({ force: true })
        cy.get('[data-test=task-type-deliverable]').click({ force: true })
        cy.wait(3000)
      })
      it('should only show the deliverable task', () => {
        cy.get('[data-test=task-cell-test]', { timeout: 30000 }).should(
          'have.length',
          '1'
        )
      })
    })

    describe('when resetting the filter', () => {
      before(() => {
        cy.get('[data-test="reset-filters"]').click({ force: true })
        cy.wait(3000)
      })
      it('should only show the deliverable task', () => {
        cy.get('[data-test=task-cell-test]', { timeout: 30000 }).should(
          'have.length',
          '3'
        )
      })
    })
  })
})
