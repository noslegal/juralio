import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('task_map_hover_disabled.cy', () => {
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
                      name: 'task2B1',
                    },
                    {
                      name: 'task2B',
                    },
                    {
                      name: 'task2B',
                    },
                    {
                      name: 'task2B',
                    },
                    {
                      name: 'task2B',
                    },
                    {
                      name: 'task2B',
                    },
                    {
                      name: 'task2B',
                    },
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
                {
                  name: 'task9',
                },
                {
                  name: 'task10',
                },
                {
                  name: 'task11',
                },
                {
                  name: 'task12',
                },
                {
                  name: 'task13',
                },
                {
                  name: 'task14',
                },
                {
                  name: 'task15',
                },
                {
                  name: 'task16',
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

    describe('when the mouse enters a phase with max siblings and subtask', () => {
      before(() => {
        triggerMouseOverForTask('task2')
      })

      it('sshould disable the right button', () => {
        cy.get('[data-test=hover-button-right]')
          .should('have.css', 'backgroundColor')
          .and('eq', 'rgb(225, 222, 216)')
      })
      it('sshould disable the top button', () => {
        cy.get('[data-test=hover-button-top]')
          .should('have.css', 'backgroundColor')
          .and('eq', 'rgb(225, 222, 216)')
      })
      it('should disable the bottom button', () => {
        cy.get('[data-test=hover-button-bottom]')
          .should('have.css', 'backgroundColor')
          .and('eq', 'rgb(225, 222, 216)')
      })

      after(() => {
        triggerMouseOutForTask('task2')
      })
    })

    describe('when the mouse enters a phase with max siblings and subtask', () => {
      before(() => {
        triggerMouseOverForTask('task2B1')
      })

      it('should display the button as enabled', () => {
        cy.get('[data-test=hover-button-right]')
          .should('have.css', 'backgroundColor')
          .and('eq', 'rgb(255, 255, 255)')
      })
      it('should disable the top button', () => {
        cy.get('[data-test=hover-button-top]')
          .should('have.css', 'backgroundColor')
          .and('eq', 'rgb(225, 222, 216)')
      })
      it('should disable the bottom button', () => {
        cy.get('[data-test=hover-button-bottom]')
          .should('have.css', 'backgroundColor')
          .and('eq', 'rgb(225, 222, 216)')
      })

      after(() => {
        triggerMouseOutForTask('task2')
      })
    })
  })
})
