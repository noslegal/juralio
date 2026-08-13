import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { getTaskCellByTaskName } from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('filter_users_hard.cy', () => {
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
                          teamMembers: [adminUser],
                        },
                      ],
                    },
                  ],
                },

                {
                  name: 'Not milestone',
                  teamMembers: [adminUser],
                  properties: { status: 'not-started' },
                  tasks: [
                    {
                      name: 'Task 2',
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

  describe('when filtering by users on the taskmap', () => {
    before(() => {
      cy.reload()
      cy.login(adminUser.username)
      appPage.visitTaskMap()
      cy.wait(5000)
    })

    it('should show 1 tasks on the map', () => {
      cy.get('[data-test=options-dropdown]').should('have.length', 6)
    })

    describe('when using the filter to show user tasks', () => {
      before(() => {
        cy.get('[data-test=minimised-filters]').click({ force: true })
        cy.get('[data-test=person-filter-you]').click({ force: true })
        cy.wait(1000)
      })
      it('should only show the users tasks and parents which form the tree', () => {
        cy.get('[data-test=task-cell-test]', { timeout: 30000 }).should(
          'have.length',
          '5'
        )
      })
    })

    describe('when resetting the filter', () => {
      before(() => {
        cy.get('[data-test="reset-filters"]').click({ force: true })
      })
      it('should only all the tasks', () => {
        cy.get('[data-test=task-cell-test]', { timeout: 30000 }).should(
          'have.length',
          '6'
        )
      })
    })
  })
})
