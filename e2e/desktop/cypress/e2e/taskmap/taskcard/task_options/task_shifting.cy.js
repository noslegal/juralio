import dayjs from 'dayjs'
import HttpStatus from 'http-status-codes'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import {
  setPlannedEndDateForTask,
  setPlannedStartDateForTask,
} from '../../../../../../security/cypress/e2e/task/dates/task-date-helpers'


let utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

describe(
  'task_shifting.cy',
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
                    properties: {
                      plannedStartDate: new Date(2000, 3, 3),
                      plannedEndDate: new Date(2000, 4, 4),
                    },
                    tasks: [
                      {
                        name: 'subtask',
                        properties: {
                          plannedStartDate: new Date(2000, 3, 3),
                          plannedEndDate: new Date(2000, 4, 4),
                        },
                      },
                    ],
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
        cy.get('[data-test=task-cell-test]').should('have.length', 4)
      })

      describe('when a task is opened ', () => {
        describe('when the option button is pressed and archive task is selected', () => {
          before(() => {
            cy.login(user)
            setPlannedStartDateForTask(
              dayjs.utc('2000-04-03').toISOString(),
              fixture.tasks[0].id,
              fixture.projects[0].id,
              fixture.matter.id
            ).then(res => {
              expect(res.status).to.eq(HttpStatus.OK)
            })
            setPlannedEndDateForTask(
              dayjs.utc('2000-05-04').startOf('day').toISOString(),
              fixture.tasks[0].id,
              fixture.projects[0].id,
              fixture.matter.id
            ).then(res => {
              expect(res.status).to.eq(HttpStatus.OK)
            })

            setPlannedStartDateForTask(
              dayjs.utc('2000-04-03').toISOString(),
              fixture.tasks[1].id,
              fixture.projects[0].id,
              fixture.matter.id
            ).then(res => {
              expect(res.status).to.eq(HttpStatus.OK)
            })
            setPlannedEndDateForTask(
              dayjs.utc('2000-05-04').startOf('day').toISOString(),
              fixture.tasks[1].id,
              fixture.projects[0].id,
              fixture.matter.id
            ).then(res => {
              expect(res.status).to.eq(HttpStatus.OK)
            })
          })
          describe('when the archive operation is cancelled', () => {
            before(() => {
              cy.login(user.username)
              appPage.visitTaskByName('task1')
              cy.get('[data-test=task-card-option-menu-button]').click()
              cy.get('[data-test=task-card-option-menu-shift]').click()
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
                cy.get('[data-test=task-cell-test]').should('have.length', 4)
              })
            })
          })

          describe('when the shifting forward operation is actioned', () => {
            before(() => {
              cy.backendRoute(
                'GET',
                'matter/*/workstreams/*/tasks/*/getMinMaxBoundsUpTree'
              ).as('getBounds')
              cy.login(user.username)
              appPage.visitTaskByName('task1')
              cy.get('[data-test=task-card-option-menu-button]').click()
              cy.get('[data-test=task-card-option-menu-shift]').click()
              cy.wait('@getBounds')
            })
            it('when moving forward by a day the preview should be correct', () => {
              cy.get('[data-test=shift-subtask-info]').should('exist')
              cy.get('[data-test=days-field]').find('input').type('1')
              cy.get('[data-test=action-dialog-button]').click()
              cy.wait(3000)

              cy.get('[data-test="planned-start-date"]').should(
                'contain.text',
                'Tue 4 Apr 2000'
              )

              cy.get('[data-test="planned-end-date"]').should(
                'contain.text',
                'Fri 5 May 2000'
              )
            })
          })

          describe('when the shifting backward operation is actioned', () => {
            before(() => {
              cy.get('[data-test=task-card-option-menu-button]').click()
              cy.get('[data-test=task-card-option-menu-shift]').click()
            })
            it('when moving forward by a day the preview should be correct', () => {
              cy.get('[data-test=days-field]').find('input').type('1')
              cy.get('[data-test=backward-button]').click()
              cy.get('[data-test=action-dialog-button]').click()
              cy.wait(3000)

              cy.get('[data-test="planned-start-date"]').should(
                'contain.text',
                'Mon 3 Apr 2000'
              )

              cy.get('[data-test="planned-end-date"]').should(
                'contain.text',
                'Thu 4 May 2000'
              )
            })
          })

          describe('when the shifting subtask out of bounds', () => {
            before(() => {
              cy.login(user.username)
              appPage.visitTaskByName('subtask')
            })
            it('when moving forward by a day the preview should be correct', () => {
              cy.get('[data-test="planned-start-date"]').should(
                'contain.text',
                'Mon 3 Apr 2000'
              )

              cy.get('[data-test="planned-end-date"]').should(
                'contain.text',
                'Thu 4 May 2000'
              )
            })
          })

          describe('when the shifting forward operation is actioned', () => {
            before(() => {
              cy.get('[data-test=task-card-option-menu-button]').click()
              cy.get('[data-test=task-card-option-menu-shift]').click()
            })
            it('when moving forward by a day the preview should be correct', () => {
              cy.get('[data-test=shift-subtask-info]').should('not.exist')
              cy.get('[data-test=days-field]').find('input').type('10')
              cy.get('[data-test=action-dialog-button]').should('be.disabled')
              cy.get('[data-test=out-of-bounds]').should('exist')
            })
          })
        })
      })
    })
  }
)
