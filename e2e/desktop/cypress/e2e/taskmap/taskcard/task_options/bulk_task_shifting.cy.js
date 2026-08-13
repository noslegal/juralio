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
  'bulk_task_shifting.cy',
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
                    properties: {
                      plannedStartDate: new Date(2000, 3, 3),
                      plannedEndDate: new Date(2000, 4, 4),
                    },
                  },
                  {
                    name: 'task3',
                    properties: {
                      plannedStartDate: new Date(2000, 3, 3),
                      plannedEndDate: new Date(2000, 4, 4),
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

    describe('when the taskmap is loaded for the user with MTM and MA permissions', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitRoadmap()
      })

      it('should have 4 tasks visible on the map', () => {
        cy.get('[data-test=task-cell-test]').should('have.length', 3)
      })

      describe('when bulk shift option is selected', () => {
        describe('when the dialog is opened', () => {
          before(() => {
            cy.get('[data-test=bulk-shift-button]').click()
          })
          describe('when the shifting forward operation is actioned', () => {
            it('when moving forward by a day the preview should be correct', () => {
              cy.get('[data-test=days-field]').find('input').type('1')
              cy.get('[data-test=action-dialog-button]').click()
              cy.wait(1000)

              cy.get('[data-test="start-date-change"]')
                .eq(0)
                .should('contain.text', '4 Apr 2000')

              cy.get('[data-test="end-date-change"]')
                .eq(0)
                .should('contain.text', '5 May 2000')
              cy.get('[data-test=action-dialog-button]').click()
            })
          })

          describe('when the shifting backward operation is actioned', () => {
            before(() => {
              cy.get('[data-test=bulk-shift-button]').click()
            })
            it('when moving backwards by a day the preview should be correct', () => {
              cy.get('[data-test=days-field]').find('input').type('1')
              cy.get('[data-test=backward-button]').click()
              cy.get('[data-test=action-dialog-button]').click()
              cy.wait(1000)

              cy.get('[data-test="start-date-change"]')
                .eq(0)
                .should('contain.text', '3 Apr 2000')

              cy.get('[data-test="end-date-change"]')
                .eq(0)
                .should('contain.text', '4 May 2000')
              cy.get('[data-test=action-dialog-button]').click()
            })
          })

          describe('when the shifting forward operation is actioned from overview ', () => {
            before(() => {
              cy.login(user.username)
              appPage.visitProjectOverview()
              cy.get('[data-test=bulk-shift-button]').click()
            })
            it('when moving forward by a day the preview should be correct', () => {
              cy.get('[data-test=days-field]').find('input').type('1')
              cy.get('[data-test=backward-button]').click()
              cy.get('[data-test=action-dialog-button]').click()
              cy.wait(1000)

              cy.get('[data-test="start-date-change"]')
                .eq(0)
                .should('contain.text', '3 Apr 2000')

              cy.get('[data-test="end-date-change"]')
                .eq(0)
                .should('contain.text', '4 May 2000')
              cy.get('[data-test=action-dialog-button]').click()
            })
          })
        })
      })
    })
  }
)
