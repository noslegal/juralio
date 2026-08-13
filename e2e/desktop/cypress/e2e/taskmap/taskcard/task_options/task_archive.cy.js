import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

describe(
  'task_archive.cy',
  {
    retries: {
      runMode: 3,
      openMode: 0,
    },
  },
  () => {
    let user, fixture, limitedUser, appPage

    before(() => {
      createUser().then(firstUser => {
        limitedUser = firstUser
      })
      createUser().then(createdUser => {
        user = createdUser
        const seed = {
          matter: {
            prefix: 'taskMapArchiveTest',
            teamMembers: [user, limitedUser],
            matterAdmins: [user],
            projects: [
              {
                tasks: [
                  {
                    name: 'task1',
                  },
                  {
                    name: 'task2',
                  },
                  {
                    name: 'task3',
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

    describe('when the taskmap is loaded for the user with MTM and MA permissions', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskMap()
      })

      it('should have 4 tasks visible on the map', () => {
        cy.get('[data-test=task-cell-test]').should('have.length', 3)
      })

      describe('when a task is opened ', () => {
        describe('when the option button is pressed and archive task is selected', () => {
          describe('when the archive operation is cancelled', () => {
            before(() => {
              cy.login(user.username)
              appPage.visitTaskByName('task1')
              cy.get('[data-test=task-card-option-menu-button]').click()
              cy.get('[data-test=task-card-option-menu-more]').click()
              cy.get('[data-test=task-card-option-menu-archive]').click()
              cy.get('[data-test=cancel-dialog-button]').click()
            })

            it('the archive dialogue should disappear', () => {
              cy.get('[data-test=archive-confirmation-dialog]').should(
                'not.exist'
              )
            })

            describe('when the map is reloaded after cancel operation', () => {
              before(() => {
                cy.reload()
                cy.login(user.username)
                appPage.visitTaskMap()
              })
              it('should still have 4 visible tasks', () => {
                cy.get('[data-test=task-cell-test]').should('have.length', 3)
              })
            })
          })

          describe('when the archive operation is actioned', () => {
            before(() => {
              cy.login(user.username)
              appPage.visitTaskByName('task1')
              cy.get('[data-test=task-card-option-menu-button]').click()
              cy.get('[data-test=task-card-option-menu-more]').click()
              cy.get('[data-test=task-card-option-menu-archive]').click()

              cy.backendRoute(
                'POST',
                '/matter/*/workstreams/*/task/*/archive'
              ).as('archiveTask')
              cy.get('[data-test=action-dialog-button]').click()
              cy.wait('@archiveTask')
            })

            it('the archive dialogue should disappear', () => {
              cy.get('[data-test=archive-confirmation-dialog]').should(
                'not.exist'
              )
            })

            describe('when the map is reloaded after action operation', () => {
              before(() => {
                cy.reload()
                cy.login(user.username)
                appPage.visitTaskMap()
              })
              it('should now have 3 visible tasks', () => {
                cy.get('[data-test=task-cell-test]').should('have.length', 2)
              })
            })
          })
        })
      })
    })

    describe('when the task is loaded for the user with full permission only', () => {
      before(() => {
        cy.login(limitedUser.username)
        appPage.visitTaskByName('task2')
        cy.get('[data-test=task-card-option-menu-button]').click()
        cy.get('[data-test=task-card-option-menu-more]').click()
      })

      it('the archive option is not available in the menu', () => {
        cy.get('[data-test=task-card-option-menu-archive]').should('be.visible')
      })
    })
  }
)
