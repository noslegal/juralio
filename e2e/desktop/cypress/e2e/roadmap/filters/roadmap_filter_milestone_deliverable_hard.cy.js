import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { getTaskCellByTaskName } from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('roadmap_filter_milestone_deliverable_hard.cy.js', () => {
  let user, fixture, appPage
  before(() => {
    const createUser1 = () =>
      createUser().then(createdUser => (user = createdUser))
    createUser1().then(() => {
      const seed = {
        matter: {
          prefix: 'task_status_event',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Law Project',
              tasks: [
                {
                  name: 'Milestone',
                  teamMembers: [user],
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
      cy.login(user.username).then(() => {
        visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
        cy.get('[data-test=task-cell-zero-assignee-chip]').eq(2).click()
        cy.get('[data-test="team-search"]')
          .click()
          .find('input')
          .clear()
          .type(user.username)
        cy.wait(2000)
        cy.get('[data-test="search-result-list-item"]').eq(0).click()
      })
    })
  })
  describe('when in the roadmap', () => {
    before(() => {
      visitHelpers.visitRoadmap(fixture.matter.id, fixture.projects[0].id)
      cy.get('[data-test=minimised-filters]').click({ force: true })
    })
    it('should have the milestone highlight option', () => {
      cy.get('[data-test=task-type-milestone]').should('be.visible')
    })
    describe('when showing the milestones', () => {
      before(() => {
        cy.get('[data-test=task-type-milestone]').click()
        cy.wait(3000)
      })
      it('should only show milestones and parents', () => {
        cy.get('[data-test=task-cell-test]').should('have.length', 4)
      })
      it('should filter out the third task', () => {
        getTaskCellByTaskName('Not milestone').should(
          'have.css',
          'background-color',
          'rgba(252, 251, 232, 0.4)'
        )
      })
      it('should keep highlighting the first task', () => {
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
      it('should keep highlighting the first task', () => {
        getTaskCellByTaskName('Task 3').should(
          'have.css',
          'background-color',
          'rgba(219, 217, 181, 0.6)'
        )
      })
    })
  })
})
