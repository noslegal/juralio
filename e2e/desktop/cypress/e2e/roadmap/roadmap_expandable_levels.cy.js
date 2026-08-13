import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import { showDoneTasks } from '../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../helpers/users/user_api_helper'
import { get as roadmap } from '../../../../page/roadmap/roadmap_page'

describe('roadmap_expandable_levels.cy', () => {
  let user, fixture, appPage
  before(() => {
    cy.window().then(win => {
      win.sessionStorage.clear()
    })
    createUser()
      .then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'roadmap_expandable_levels.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'Expandable Tasks',
                tasks: [
                  {
                    name: 'Task 1',
                    properties: {
                      status: 'done',
                    },
                    tasks: [
                      {
                        name: 'Task 2',
                        tasks: [
                          {
                            name: 'Task 3',
                            tasks: [{ name: 'Task 4' }],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    name: 'Another Level A Task',
                    tasks: [{ name: 'Another Level B task' }],
                  },
                ],
              },
              ,
              { name: 'Empty project' },
              {
                name: 'Project with only level As',
                tasks: [{ name: 'Level A 1' }, { name: 'Level A 2' }],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
      })
      .then(() => {
        appPage = getWrapper(fixture)
      })
  })
  describe('when visiting the roadmap', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitRoadmap()
      cy.get('.reactour__close', { timeout: 10000 }).click()

      showDoneTasks()
    })
    it('should show only the level A tasks', () => {
      roadmap.tasks().should('have.length', 2)
      cy.get('[data-test=selected-level-a]').should('have.length', 2)
    })
  })
  describe('when expanding a level A task', () => {
    before(() => {
      cy.get('[data-test=unselected-end-cap]').eq(0).click({ force: true })
    })
    it('should show the level B task', () => {
      roadmap.tasks().should('have.length', 5)
      cy.get('[data-test=selected-level-a]').should('have.length', 2)
      cy.get('[data-test=selected-sublevel-2]').should('have.length', 1)
    })
  })
  describe('when expanding a level B task', () => {
    before(() => {
      cy.get('[data-test=unselected-end-cap]').eq(1).click({ force: true })
    })
    it('should show the level C task', () => {
      roadmap.tasks().should('have.length', 4)
      cy.get('[data-test=selected-level-a]').should('have.length', 2)
      cy.get('[data-test=selected-sublevel-2]').should('have.length', 1)
      cy.get('[data-test=unselected-sublevel-3]').should('have.length', 3)
    })
    describe('when expanding a level C task', () => {
      before(() => {
        cy.get('[data-test=unselected-end-cap]').eq(1).click({ force: true })
      })
      it('should show the level D task', () => {
        roadmap.tasks().should('have.length', 5)
        cy.get('[data-test=selected-level-a]').should('have.length', 2)
        cy.get('[data-test=selected-sublevel-2]').should('have.length', 1)
        cy.get('[data-test=selected-end-cap]').should('have.length', 1)
      })
    })

    describe('when collapsing a level C task', () => {
      before(() => {
        cy.get('[data-test=unselected-sublevel-3]').eq(0).click({ force: true })
      })
      it('should hide the level D task', () => {
        roadmap.tasks().should('have.length', 5)
        cy.get('[data-test=selected-level-a]').should('have.length', 2)
        cy.get('[data-test=selected-sublevel-2]').should('have.length', 1)
        cy.get('[data-test=unselected-sublevel-3]').should('have.length', 3)
      })
    })
    describe('when collapsing a level A task', () => {
      before(() => {
        cy.get('[data-test=selected-level-a]').eq(0).click({ force: true })
        cy.get('[data-test=selected-level-a]').eq(1).click({ force: true })
      })
      it('should hide all subtask', () => {
        roadmap.tasks().should('have.length', 2)
        cy.get('[data-test=selected-level-a]').should('have.length', 2)
        cy.get('[data-test=selected-sublevel-2]').should('have.length', 0)
        cy.get('[data-test=unselected-sublevel-3]').should('have.length', 1)
      })
    })
  })
  describe('when visiting an empty roadmap', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitRoadmap(1)
    })
    it('should not display the expand/collapse button', () => {
      roadmap.expandAllButton().should('not.exist')
      roadmap.collapseAllButton().should('not.exist')
    })
  })
})
