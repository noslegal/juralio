import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { getTaskCellByTaskName } from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('filter_milestones_subtask_hard.cy', () => {
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
                  tasks: [
                    {
                      name: 'Task 2',
                      tasks: [
                        {
                          name: 'Task 3',
                          properties: { isMilestone: true },
                        },
                      ],
                    },
                  ],
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
      cy.get('[data-test=options-dropdown]').should('have.length', 4)
    })

    describe('when using the filter to show milestone tasks', () => {
      before(() => {
        cy.get('[data-test=minimised-filters]').click({ force: true })
        cy.get('[data-test=task-type-milestone]').click({ force: true })
        cy.wait(1000)
      })
      it('should only show the milestone tasks and parents which form the tree', () => {
        cy.get('[data-test=task-cell-test]', { timeout: 30000 }).should(
          'have.length',
          '4'
        )
      })

      it('should filter out the first task', () => {
        getTaskCellByTaskName('Not milestone').should(
          'have.css',
          'background-color',
          'rgba(252, 251, 232, 0.4)'
        )
      })
      it('should filter in the second task', () => {
        getTaskCellByTaskName('Milestone').should(
          'have.css',
          'background-color',
          'rgba(219, 217, 181, 0.6)'
        )
      })
      it('should filter out the third task', () => {
        getTaskCellByTaskName('Task 2').should(
          'have.css',
          'background-color',
          'rgba(252, 251, 232, 0.4)'
        )
      })
      it('should filter in the fourth task', () => {
        getTaskCellByTaskName('Task 3').should(
          'have.css',
          'background-color',
          'rgba(219, 217, 181, 0.6)'
        )
      })
    })

    describe('when resetting the filter', () => {
      before(() => {
        cy.get('[data-test="reset-filters"]').click({ force: true })
      })
      it('should only show the deliverable task', () => {
        cy.get('[data-test=task-cell-test]', { timeout: 30000 }).should(
          'have.length',
          '4'
        )
      })
    })
  })
})
