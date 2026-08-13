import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('recent_tasks_archive.cy', () => {
  let user1, user2, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user2 = createdUser

      createUser().then(createdUser => {
        user1 = createdUser

        const seed = {
          matter: {
            prefix: 'navigation_buttons.cy',
            teamMembers: [user1, user2],
            matterAdmins: [user1],
            projects: [
              {
                name: 'Test Project',
                tasks: [
                  { name: 'Test Task A' },
                  {
                    name: 'Test Task B',
                    tasks: [
                      { name: 'Test Sub Task A' },
                      { name: 'Test Sub Task B' },
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
  })

  describe('when visiting all the tasks as user1', () => {
    before(() => {
      cy.login(user1.username)
      appPage.visitTaskByName('Test Task A')
      appPage.visitTaskByName('Test Task B')
      appPage.visitTaskByName('Test Sub Task A')
      appPage.visitTaskByName('Test Sub Task B')
      cy.visit('/#/home')
      cy.get('[data-test=home-recently-viewed-tab]').click()
    })

    describe('the recent tasks panel', () => {
      const recentTasksPanel = '[data-test=home-recent-tasks-panel]'

      it('should be visible', () => {
        cy.get(recentTasksPanel, { timeout: 60000 }).should('be.visible')
      })

      it('should have the correct number of children', () => {
        cy.get('[data-test=juralio-chip-task]').should('have.length', 4)
      })
    })
  })

  describe('when visiting all the tasks as user2', () => {
    before(() => {
      cy.login(user2.username)
      appPage.visitTaskByName('Test Task A')
      appPage.visitTaskByName('Test Task B')
      appPage.visitTaskByName('Test Sub Task A')
      appPage.visitTaskByName('Test Sub Task B')
      cy.visit('/#/home')
      cy.get('[data-test=home-recently-viewed-tab]').click()
    })

    describe('the recent tasks panel', () => {
      const recentTasksPanel = '[data-test=home-recent-tasks-panel]'

      it('should be visible', () => {
        cy.get(recentTasksPanel).should('be.visible')
      })

      it('should have the correct number of children', () => {
        cy.get('[data-test=juralio-chip-task]').should('have.length', 4)
      })
    })
  })

  describe('when the archive operation is actioned', () => {
    before(() => {
      cy.login(user1.username)
      appPage.visitTaskByName('Test Task B')
      cy.get('[data-test="task-card-option-menu-button"]').click()
      cy.get('[data-test=task-card-option-menu-more]').click()
      cy.get('[data-test="task-card-option-menu-archive"]').click()
      cy.get('[data-test="action-dialog-button"]').click()
    })

    it('the archive dialogue should disappear', () => {
      cy.get('[data-test="archive-confirmation-dialog"]').should('not.exist')
    })
  })

  describe('when visiting homepage as user1', () => {
    before(() => {
      cy.login(user1.username)
      cy.visit('/#/home')
      cy.get('[data-test=home-recently-viewed-tab]').click()
    })

    describe('the recent tasks panel', () => {
      checkNumberOfRecentTasks(1)

      it('should have the correct name', () => {
        cy.get('[data-test="task-chip-wrapper"]').should(
          'contain',
          fixture.tasks[0].name
        )
      })
    })
  })

  describe('when visiting homepage as user2', () => {
    before(() => {
      cy.login(user2.username)
      cy.visit('/#/home')
      cy.get('[data-test=home-recently-viewed-tab]').click()
    })

    describe('the recent tasks panel', () => {
      checkNumberOfRecentTasks(1)

      it('should have the correct name', () => {
        cy.get('[data-test="task-chip-wrapper"]').should(
          'contain',
          fixture.tasks[0].name
        )
      })
    })
  })

  function checkNumberOfRecentTasks(expectedCount) {
    it('should have the correct number of children', () => {
      cy.get('[data-test=juralio-chip-task]').should(
        'have.length',
        expectedCount
      )
    })
  }
})
