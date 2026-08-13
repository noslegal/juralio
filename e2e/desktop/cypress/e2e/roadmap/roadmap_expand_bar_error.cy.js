import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import { showDoneTasks } from '../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../helpers/users/user_api_helper'
import { get as roadmap } from '../../../../page/roadmap/roadmap_page'

describe('roadmap_expand_bar_error.cy', () => {
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
                      status: 'in-progress',
                      plannedEndDate: '2028-07-07T12:00:00.000Z',
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
                    properties: {
                      status: 'done',
                    },
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
      cy.get('.reactour__close').click()

      showDoneTasks()
    })
    it('should show only the level A tasks', () => {
      roadmap.tasks().should('have.length', 2)
      cy.get('[data-test=selected-level-a]').should('have.length', 2)
    })
  })
  describe('when expanding a level A task', () => {
    before(() => {
      cy.get('[data-test=unselected-sublevel-2]').eq(0).trigger('mouseover', {
        force: true,
      })
      cy.get('[data-test=selected-sublevel-2]').eq(0).click()
    })
    it('should show the level B task', () => {
      roadmap.tasks().should('have.length', 3)
      cy.get('[data-test=selected-level-a]').should('have.length', 2)
      cy.get('[data-test=selected-sublevel-2]').should('have.length', 2)
    })
  })
  describe('when expanding a level B task', () => {
    before(() => {
      cy.get('[data-test=unselected-sublevel-3]').eq(0).click()
    })
    it('should show the level C task', () => {
      roadmap.tasks().should('have.length', 4)
      cy.get('[data-test=selected-level-a]').should('have.length', 2)
      cy.get('[data-test=selected-sublevel-2]').should('have.length', 2)
      // cy.get('[data-test=selected-sublevel-3]').should('have.length', 1)
    })
  })

  describe('checking for the correct number of tasks after expanding off screen', () => {
    before(() => {
      roadmap.timePeriodPickerNextButton().click({ force: true })
      roadmap.timePeriodPickerNextButton().click({ force: true })
      roadmap.timePeriodPickerNextButton().click({ force: true })
      roadmap.timePeriodPickerNextButton().click({ force: true })
      //  roadmap.expandTask().eq(1).click()
      //  roadmap.expandTask().eq(1).click()
      // roadmap.expandTask().eq(2).click()
      // roadmap.expandTask().eq(3).click()
      // roadmap.expandTask().eq(0).click()

      roadmap.pointRightChevronText().eq(0).click()
    })
    it('correct number of tasks is shown', () => {
      roadmap.tasks().should('have.length', 4)
      cy.get('[data-test=selected-level-a]').should('have.length', 2)
      cy.get('[data-test=selected-sublevel-2]').should('have.length', 2)
    })
  })
})
