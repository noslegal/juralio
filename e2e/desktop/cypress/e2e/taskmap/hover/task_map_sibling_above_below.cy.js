import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe(
  'task_map_sibling_above_below.cy',
  { retries: { runMode: 3, openMode: 3 } },
  () => {
    let user, fixture, appPage

    before(() => {
      cy.window().then(win => {
        win.sessionStorage.clear()
      })
      createUser().then(createdUser => {
        user = createdUser
        const seed = {
          matter: {
            prefix: 'task_map_sibling_above_below.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                tasks: [
                  {
                    name: 'Parent 1',
                    tasks: [
                      {
                        name: 'Task A',
                        properties: { status: 'done' },
                      },
                      {
                        name: 'Task B',
                        properties: { status: 'in-progress' },
                      },
                      {
                        name: 'Task C',
                        properties: { status: 'not-started' },
                      },
                    ],
                  },
                ],
              },
              {
                tasks: [
                  {
                    name: 'Parent 1',
                    tasks: [
                      {
                        name: 'Task A',
                        properties: { status: 'done' },
                      },
                      {
                        name: 'Task B',
                        properties: { status: 'in-progress' },
                      },
                      {
                        name: 'Task C',
                        properties: { status: 'not-started' },
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

    describe('when navigating to the task map', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskMap()
        cy.get('.reactour__close').click()
        cy.get('[data-test=minimised-filters]').click({ force: true })
        cy.get('[data-test=done-checkbox]').click()
        cy.get('body').click()
      })

      it('should display the expected number of task cells', () => {
        cy.get('[data-test=task-cell-test]').should('have.length', 4)
      })

      describe('when the mouse enters a task with no children and no siblings again', () => {
        before(() => {
          cy.clock()
          cy.get('div').contains('Task B').trigger('mouseover', { force: true })
          cy.tick(500)
        })

        describe('when a new sibling task is created', () => {
          before(() => {
            cy.clock()
            cy.get('[data-test=hover-button-bottom]').click({ force: true })
            cy.tick(500)
            cy.get('[data-test=edit-name-field] input').type('Below{Enter}')
            cy.tick(500)
          })

          it('should display the expected number of task cells', () => {
            cy.get('[data-test=task-cell-test]').should('have.length', 6)
          })
          // it('should have the in progress status', () => {
          //   cy.get('[data-test=structureItem]')
          //     .eq(5)
          //     .should('have.css', 'background-color')
          //     .and('be.colored', '#dfa837') //taskStatusColors.inProgress)
          // })
        })
      })
    })

    describe('when navigating to the task map', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskMap(1)
        cy.get('[data-test=minimised-filters]').click({ force: true })
        cy.get('[data-test=done-checkbox]').click()
        cy.get('body').click()
      })

      it(
        'should display the expected number of task cells',
        { retries: 3 },
        () => {
          cy.get('[data-test=task-cell-test]').should('have.length', 4)
        }
      )

      describe('when the mouse enters a task with no children and no siblings again', () => {
        before(() => {
          cy.clock()
          cy.get('div').contains('Task B').trigger('mouseover', { force: true })
          cy.tick(500)
        })

        describe('and the create child button is clicked, a task name is typed and enter is pressed', () => {
          before(() => {
            cy.clock()

            cy.get('[data-test=hover-button-top]').click({ force: true })
            cy.tick(500)
            cy.get('[data-test=edit-name-field] input').type('Above{Enter}')
            cy.tick(500)
          })

          it('should display the expected number of task cells', () => {
            cy.get('[data-test=task-cell-test]')
              .its('length')
              .should('be.gte', 5)
          })

          // it('should have the in progress status', () => {
          //   cy.get('[data-test=structureItem]')
          //     .eq(5)
          //     .should('have.css', 'background-color')
          //     .and('be.colored', taskStatusColors.inProgress)
          // })
        })
      })
    })
  }
)
