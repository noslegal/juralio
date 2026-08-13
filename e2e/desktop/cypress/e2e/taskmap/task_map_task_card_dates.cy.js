import dayjs from 'dayjs'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { showDoneTasks } from '../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

function getDateDisplayString(date, dateFormat, fulldateOnly) {
  if (!date) {
    return undefined
  }
  if (!dateFormat) {
    dateFormat = DATE_FORMAT_FULL
  }
  const currentDate = dayjs().startOf('day')
  const endDate = dayjs(dayjs(date)).startOf('day')
  const comparison = endDate.diff(currentDate, 'day')

  if (!fulldateOnly) {
    if (comparison === 0) return 'Today'
    // if (comparison === 1) return 'Tomorrow'
    // if (comparison === -1) return 'Yesterday'
  }
  return dayjs(date).format(dateFormat)
}
const visitHelper = new VisitHelpers()

describe('task_map_task_card_dates.cy', () => {
  let fixture, user1, user2

  const createUser1 = () =>
    createUser().then(createdUser => (user1 = createdUser))
  const createUser2 = () =>
    createUser().then(createdUser => (user2 = createdUser))

  before(() => {
    cy.window().then(win => {
      win.sessionStorage.clear()
    })
    createUser1()
      .then(() => createUser2())
      .then(() => {
        const seed = {
          matter: {
            prefix: 'task_moved_event',
            teamMembers: [user1, user2],
            matterAdmins: [user1],
            projects: [
              {
                name: 'Alpha Project',

                tasks: [
                  {
                    name: 'Pluto',
                    followers: [],
                    properties: {
                      description: 'Pluto description',
                      status: 'not-started',
                      plannedStartDate: null,
                    },
                  },
                  {
                    name: 'Mars',
                    teamMembers: [user2],
                    properties: {
                      description: 'Mars description',
                      plannedStartDate: new Date().toISOString(),
                      status: 'not-started',
                    },
                  },
                  {
                    name: 'Mars',
                    teamMembers: [user2],
                    properties: {
                      description: 'Mars description',
                      plannedEndDate: new Date().toISOString(),
                      status: 'not-started',
                    },
                  },
                  {
                    name: 'Mars',
                    teamMembers: [user2],
                    properties: {
                      description: 'Mars description',
                      status: 'in-progress',
                      actualStartDate: new Date().toISOString(),
                      plannedEndDate: new Date().toISOString(),
                    },
                  },
                  {
                    name: 'Mars',
                    teamMembers: [user2],
                    properties: {
                      description: 'Mars description',
                      status: 'in-progress',
                      actualStartDate: new Date().toISOString(),
                    },
                  },
                  {
                    name: 'Mars',
                    teamMembers: [user2],
                    properties: {
                      description: 'Mars description',
                      status: 'done',
                    },
                  },
                  {
                    name: 'Jupiter',
                    teamMembers: [user2],
                    properties: {
                      status: 'not-started',
                      plannedStartDate: new Date(2000, 1, 3),
                      plannedEndDate: new Date(2000, 1, 10),
                    },
                    tasks: [
                      {
                        name: 'Jupiter Sub Task 1',
                        properties: {
                          plannedStartDate: new Date(2000, 1, 4),
                          plannedEndDate: new Date(2000, 1, 9),
                        },
                        tasks: [
                          {
                            name: 'Jupiter Sub task 2',
                            properties: {
                              status: 'not-started',
                              plannedStartDate: new Date(2000, 1, 5),
                              plannedEndDate: new Date(2000, 1, 8),
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    name: 'in-progress',
                    teamMembers: [user2],
                    properties: {
                      plannedEndDate: new Date(2000, 1, 10),
                      status: 'in-progress',
                    },
                    tasks: [
                      {
                        name: 'done',
                        properties: {
                          status: 'done',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })
  describe('when viewing the taskmap', () => {
    before(() => {
      cy.login(user1.username)
      visitHelper.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
      cy.get('.reactour__close').click()

      showDoneTasks()
      cy.get('body').click(0, 0)
    })
    it('should show "Set dates" on a task with no dates', () => {
      cy.get('[data-test=task-cell-date-picker-start]')
        .eq(0)
        .should('have.text', 'Set planned start')
    })
    it('should show planned start date and select end option on a task with planned start date', () => {
      cy.get('[data-test=task-cell-date-picker-start]')
        .eq(1)
        .should(
          'have.text',
          getDateDisplayString(new Date().toISOString(), 'D MMM YYYY', false)
        )
      cy.get('[data-test=task-cell-date-picker-end]')
        .eq(4)
        .should('have.text', 'Set planned end')
    })
    it('should show planned end date and select start option on a task with planned end date and no start date', () => {
      cy.get('[data-test=task-cell-date-picker-start]')
        .eq(2)
        .should('have.text', 'Set planned start')
      cy.get('[data-test=task-cell-date-picker-end]')
        .eq(5)
        .should('have.text', 'Today')
    })
    it('should show planned end date when in progress', { retries: 3 }, () => {
      cy.get('[data-test=task-cell-date-picker-end]')
        .eq(0)
        .should('have.text', 'Today')
    })
    it('should show no planned end date when in progress', () => {
      cy.get('[data-test=task-cell-date-picker-end]')
        .eq(1)
        .should('have.text', 'Set planned end')
    })
    it('should show actual end dates when a task is done', () => {
      cy.get('[data-test=task-cell-test]')
        .eq(0)
        .find('[data-test=done-display]')
        .should('exist')
      cy.get('[data-test=task-cell-test]')
        .eq(0)
        .find('[data-test=task-cell-date-picker-end]')
        .should('not.exist')
    })
  })

  describe('when picking a start date for a task with no dates', () => {
    before(() => {
      cy.login(user1.username)

      visitHelper.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
      cy.wait(3000)
      cy.get('[data-test=task-cell-date-picker-start]').eq(0).click()
      cy.wait(3000)
      pushDateButton('3')
    })
    it('should render the selected date', { retries: 3 }, () => {
      cy.get('[data-test=task-cell-date-picker-start]')
        .eq(0)
        .should(
          'have.text',
          `3 ${new Date().toLocaleString('en-US', {
            month: 'short',
          })} ${new Date().getFullYear()}`
        )
    })
  })
  //cant go before start date
  describe('when picking an end date before the start date', () => {
    before(() => {
      cy.login(user1.username)

      visitHelper.visitTaskMap(fixture.matter.id, fixture.projects[0].id)

      cy.get('[data-test=task-cell-date-picker-end]').eq(3).click()
      cy.wait(3000)
    })
    it('should be disabled', () => {
      cy.get('button')
        .contains(new RegExp('^1$'))
        .should('have.css', 'pointer-events', 'none')
    })

    describe('when picking a start date', () => {
      before(() => {
        cy.get('body').click(0, 0)
        cy.wait(3000)
        cy.get('[data-test=task-cell-date-picker-start]').eq(4).click()
      })

      describe('before the parent date', () => {
        before(() => {
          cy.wait(1000)
        })
        it('should open a dialog with disabled dates', () => {
          cy.get('button')
            .contains(new RegExp('^2$'))
            .should('have.css', 'pointer-events', 'none')
        })

        describe('after the child date', () => {
          before(() => {
            cy.get('body').click(0, 0)
            cy.get('[data-test=task-cell-date-picker-start]').eq(4).click()
          })

          it('should start between the parent and the child', () => {
            cy.get('[data-test=calendar-date]')
              .contains(new RegExp('^3$'))
              .should('have.css', 'pointer-events', 'auto')
            cy.get('[data-test=calendar-date]')
              .contains(new RegExp('^4$'))
              .should('have.css', 'pointer-events', 'auto')
            cy.get('[data-test=calendar-date]')
              .contains(new RegExp('^5$'))
              .should('have.css', 'pointer-events', 'auto')
          })

          describe('when picking and end date', () => {
            before(() => {
              cy.get('body').type('{esc}')
              cy.wait(3000)
              cy.get('[data-test=task-cell-date-picker-start]').eq(4).click()

              cy.reload()
              cy.login(user1.username)
              visitHelper.visitTaskMap(
                fixture.matter.id,
                fixture.projects[0].id
              )
              cy.get('[data-test=task-cell-date-picker-end]').eq(7).click()
            })
            describe('after the parent date', () => {
              before(() => {
                cy.wait(1000)
              })
              it(
                'should open a dialog with disabled dates',
                { retries: 3 },
                () => {
                  cy.get('[data-test=calendar-date]')
                    .contains(new RegExp('^11$'))
                    .should('have.css', 'pointer-events', 'none')
                }
              )
            })
            describe('before the child date', () => {
              before(() => {
                cy.get('body').click(0, 0)
                cy.wait(3000)

                cy.get('body').type('{esc}')
                cy.wait(3000)
                cy.get('[data-test=task-cell-date-picker-end]', {
                  timeout: 10000,
                })
                  .eq(7)
                  .click({ force: true })
                cy.wait(3000)
                cy.get('[data-test=calendar-date]')
                  .contains(new RegExp('^7$'))
                  .click()
              })
              it('should open a dialog', { retries: 3 }, () => {
                cy.get('[data-test=dialog-header-title-text]').should('exist')
              })
            })
          })
        })
      })
    })
  })
})

const pushDateButton = keyNumber => {
  cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/**').as('patchTask')
  cy.get('button')
    .contains(new RegExp(`^${keyNumber}$`))
    .click()
  cy.wait('@patchTask')
  cy.wait(1000)
}
