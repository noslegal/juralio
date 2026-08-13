import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('task_map.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskMapTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {
                  properties: {
                    name: 'task1',
                  },
                },
                {
                  properties: {
                    name: 'task2',
                  },
                },
                {
                  properties: {
                    name: 'task3',
                  },
                },
              ],
            },
            {},
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when navigating to the task map', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()
    })

    it('should set the correct document title', () => {
      cy.title().should('eq', `Taskmap | ${fixture.projects[0].name} | Juralio`)
    })
  })

  describe('the task map for a valid matter and project id when project has tasks', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()
    })

    // it('should be displayed', () => {
    // cy.get('[data-test=container]').should('have.length', 1)
    // })

    it('should have 4 icicles in total', () => {
      cy.get('[data-test=task-cell-test]').should('have.length', 3)
    })
  })

  describe('the task map for a valid matter and project id when project has no tasks', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap(1)
    })

    it('displays the No Tasks heading', () => {
      cy.get('[data-test=zero-state-title]').should(
        'contain',
        'This workstream is empty'
      )
    })
    it('and the No Tasks subheading', () => {
      cy.get('[data-test=zero-state-caption]').should(
        'contain',
        'Get started by creating your first level A task'
      )
    })
  })
})
