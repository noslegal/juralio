import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('task_map_hover_button.cy', () => {
  let user, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'task_map_hover_button',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {
                  name: 'task1A',
                  tasks: [
                    {
                      name: 'task1B',
                      tasks: [
                        {
                          name: 'task1C',
                          tasks: [
                            {
                              name: 'task1D',
                              tasks: [
                                {
                                  name: 'task1E',
                                  tasks: [
                                    {
                                      name: 'task1F',
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: 'task2',
                  tasks: [
                    {
                      name: 'task2B',
                    },
                  ],
                },
                {
                  name: 'task3',
                },
                {
                  name: 'task4',
                },
                {
                  name: 'task5',
                },
                {
                  name: 'task6',
                },
                {
                  name: 'task7',
                },
                {
                  name: 'task8',
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

  const getTaskCell = taskName =>
    cy
      .get('div')
      .contains(new RegExp(`^${taskName}$`))
      .scrollIntoView()

  const triggerMouseOverForTask = taskName => {
    getTaskCell(taskName).trigger('mouseover', {
      force: true,
    })
    cy.wait(1000)
  }

  const triggerMouseOutForTask = taskName => {
    getTaskCell(taskName).trigger('mouseout', {
      force: true,
    })
  }

  describe('when navigating to the task map', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()
    })

    describe('when the mouse enters a task with children and 7 siblings', () => {
      before(() => {
        triggerMouseOverForTask('task1A')
      })

      it('should not display the sibling or child hover buttons', () => {
        // cy.get('[data-test=hover-button-top]').should(
        //   'have.css',
        //   'opacity',
        //   '0'
        // )
        // cy.get('[data-test=hover-button-bottom]').should(
        //   'have.css',
        //   'opacity',
        //   '0'
        // )
        // cy.get('[data-test=hover-button-right]').should(
        //   'have.css',
        //   'opacity',
        //   '0'
        // )
      })

      after(() => {
        triggerMouseOutForTask('task1A')
      })
    })

    describe('when the mouse enters a task with no children and 7 siblings', () => {
      before(() => {
        triggerMouseOverForTask('task3')
      })

      it('should display the child button but not the sibling buttons', () => {
        // cy.get('[data-test=hover-button-top]').should(
        //   'have.css',
        //   'opacity',
        //   '0'
        // )
        // cy.get('[data-test=hover-button-bottom]').should(
        //   'have.css',
        //   'opacity',
        //   '0'
        // )
        cy.get('[data-test=hover-button-right]').should(
          'have.css',
          'opacity',
          '1'
        )
      })

      after(() => {
        triggerMouseOutForTask('task3')
      })
    })

    describe('when the mouse enters a task with children and no siblings', () => {
      before(() => {
        triggerMouseOverForTask('task1B')
      })

      it('should display the sibling buttons but not the child button', () => {
        cy.get('[data-test=hover-button-top]').should(
          'have.css',
          'opacity',
          '1'
        )
        cy.get('[data-test=hover-button-bottom]').should(
          'have.css',
          'opacity',
          '1'
        )
        // cy.get('[data-test=hover-button-right]').should(
        //   'have.css',
        //   'opacity',
        //   '0'
        // )
      })

      after(() => {
        triggerMouseOutForTask('task1B')
      })
    })

    describe('when the mouse enters a task with no children and fewer than 7 siblings', () => {
      before(() => {
        triggerMouseOverForTask('task2B')
      })

      it('should display the sibling buttons and the child button', () => {
        cy.get('[data-test=hover-button-top]').should(
          'have.css',
          'opacity',
          '1'
        )
        cy.get('[data-test=hover-button-bottom]').should(
          'have.css',
          'opacity',
          '1'
        )
        cy.get('[data-test=hover-button-right]').should(
          'have.css',
          'opacity',
          '1'
        )
      })

      after(() => {
        triggerMouseOutForTask('task2B')
      })
    })

    describe('when the mouse enters a level F task with no siblings', () => {
      before(() => {
        triggerMouseOverForTask('task1F')
      })

      it('should display the sibling buttons but not the child button', () => {
        cy.get('[data-test=hover-button-top]').should(
          'have.css',
          'opacity',
          '1'
        )
        cy.get('[data-test=hover-button-bottom]').should(
          'have.css',
          'opacity',
          '1'
        )
        // cy.get('[data-test=hover-button-right]').should(
        //   'have.css',
        //   'opacity',
        //   '0'
        // )
      })

      after(() => {
        triggerMouseOutForTask('task1F')
      })
    })
  })
})
