import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('reset_filters.cy', () => {
  let adminUser, fixture, appPage

  const otherTasks = [{}, {}, {}, {}, {}, {}, {}, {}]

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
                  name: 'not-started',
                  teamMembers: [],
                  followers: [],
                },
                {
                  name: 'in-progress',
                  teamMembers: [],
                },
                {
                  name: 'done',
                  teamMembers: [],
                },
                {
                  name: 'level A',
                  teamMembers: [],
                  tasks: [{ name: 'level B' }],
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
      appPage.visitTaskMap()
      appPage.changeTaskStatus('in-progress', 1)
      appPage.changeTaskStatus('done', 2)
      appPage.changeTaskStatus('level A', 1)
      appPage.changeTaskStatus('level B', 2)
      appPage.visitTaskMap()
    })

    it('should have the task filter setting set to "status"', () => {
      cy.get('[data-test=minimised-filters]').click({ force: true })
      cy.get('[data-test=status-filter-selected-text]').should(
        'have.text',
        'Status: NS & IP'
      )
    })

    it('should contain contain 5 tasks', () => {
      cy.get('[data-test=options-dropdown]').should('have.length', 3)
    })
    it('the reset filter button should not be present', () => {
      cy.get('[data-test=reset-filters]').should('not.exist')
    })

    describe('when using the filter to show done and hide not started tasks', () => {
      before(() => {
        cy.get('[data-test=done-checkbox]').click({ force: true })
        cy.get('[data-test=not-started-checkbox]').click({ force: true })
      })
      it('should contain contain 2 tasks', () => {
        cy.get('[data-test=options-dropdown]').should('have.length', 4)
      })
      it('the reset filter button should be present', () => {
        cy.get('[data-test=reset-filters]').should('exist')
      })
    })
    describe('when using the reset button to remove filters', () => {
      before(() => {
        cy.get('[data-test=reset-filters]').click({ force: true })
      })
      it('should contain contain 3 tasks', () => {
        cy.get('[data-test=options-dropdown]').should('have.length', 3)
      })
    })

    describe('when using the reset button to remove member filters', () => {
      before(() => {
        cy.get('[data-test="person-filter-selected-text"]').click()
        cy.get('[data-test=person-filter-unassigned]').click()
      })
      it('reset filter should exist', () => {
        cy.get('[data-test=reset-filters]').should('exist')
      })
      it('reset filter should exist', () => {
        cy.get('[data-test=reset-filters]').click()
        cy.get('[data-test=person-filter-selected-text]').should(
          'have.text',
          ' Anyone’s tasks'
        )
      })
    })
  })
})
