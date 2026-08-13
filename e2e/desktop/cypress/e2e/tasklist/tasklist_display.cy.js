import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../helpers/users/user_api_helper'

const Test1CellStartIndex = 0
let tenDaysBeforeNow = new Date()
let tenDaysFromNow = new Date()
const now = new Date()
describe(
  'tasklist_display.cy',
  { retries: { runMode: 2, openMode: 1 } },
  () => {
    let user, fixture, appPage, nonAdminUser

    before(() => {
      now.setMinutes(now.getMinutes() - 15) // subtract a few minutes to allow for some deviation & client & server clocks
      tenDaysBeforeNow.setDate(now.getDate() - 10)
      tenDaysFromNow.setDate(now.getDate() + 10)

      createUser().then(createdUser1 => {
        nonAdminUser = createdUser1
      })
      createUser().then(createdUser => {
        user = createdUser
        const seed = {
          matter: {
            prefix: 'taskMapDNDTest',
            teamMembers: [user, nonAdminUser],
            matterAdmins: [user],
            projects: [
              {
                tasks: [
                  {
                    name: 'Test 1',
                    tasks: [
                      { name: 'Alpha' },
                      { name: 'Beta' },
                      {
                        name: 'Gamma',
                      },
                      {
                        name: 'Done',
                        properties: {
                          status: 'done',
                        },
                      },
                    ],
                  },
                  {
                    name: 'Test 2',
                    tasks: [
                      {
                        name: 'Delta',
                        teamMembers: [user],
                        properties: {
                          plannedStartDate: tenDaysBeforeNow,
                          plannedEndDate: tenDaysFromNow,
                        },
                      },
                    ],
                  },
                  {
                    name: 'Test 3',
                    tasks: [
                      {
                        name: 'Epsilon',
                        properties: {
                          plannedEndDate: tenDaysBeforeNow,
                        },
                        tasks: [{}, {}, {}],
                      },
                      { name: 'Zeta', isMilestone: true },
                      { name: 'Eta' },
                    ],
                  },
                  {},
                ],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
    })

    describe('when navigating to the tasklist', () => {
      before(() => {
        cy.login(user.username)
        updateFTUE(user, { hasSeenTasklist: true })
        cy.login(user.username)
        appPage.visitTaskList()
      })

      it('should set the correct document title', () => {
        cy.url().should('contains', '/tasklist')
      })
    })

    //not currently working
    describe('when moving a task', () => {
      before(() => {
        cy.window().then(win => {
          cy.get('[data-test=draggable-task]')
            .filter(':visible')
            .eq(Test1CellStartIndex)
            .trigger('mousedown', {
              view: win,
            })
            .eq(Test1CellStartIndex)
            .trigger('mousemove', {
              clientX: 1000,
              clientY: 0,
            })
            .eq(Test1CellStartIndex)
            .trigger('mouseup', {
              view: win,
            })
        })
      })
      it('should move the task to the bottom of the list ', () => {
        cy.get('[data-test=draggable-task]')
          .eq(Test1CellStartIndex)
          .should('contain', fixture.tasks[Test1CellStartIndex].name)
      })
    })

    describe('when changing the level filter to only level B', () => {
      before(() => {
        cy.get('[data-test=level-filter]').click()
        cy.get('[data-test=level-button]').eq(0).click()
      })
      it('should show only level b tasks', () => {
        cy.get('[data-test=draggable-task]')
          .filter(':visible')
          .should('have.length', 7)
        cy.get('[data-test=reset-button]').click()
      })
    })

    describe('when changing the phase filter', () => {
      before(() => {
        cy.get('[data-test=phase-filter]').click()
        cy.get('[data-test=phase-button]').eq(0).click()
      })
      it('should show only 1 phase tasks', () => {
        cy.get('[data-test=draggable-task]')
          .filter(':visible')
          .should('have.length', 3)
      })
      it('should show 2 phase tasks', () => {
        cy.get('[data-test=phase-button]').eq(1).click()
        cy.get('[data-test=draggable-task]')
          .filter(':visible')
          .should('have.length', 4)
        cy.get('[data-test=reset-button]').click({ force: true })
        cy.get('[data-test="phase-filter"]').click({ force: true })
      })
    })

    describe('when changing the status filter', () => {
      before(() => {
        cy.get('[data-test=status-filter]').click({ force: true })
        cy.get('[data-test=status-filter-ip]').click()
      })
      it('should show only in-progress tasks(none)', () => {
        cy.get('[data-test=draggable-task]').should('not.exist')
      })
      it('should show the zero state', () => {
        cy.get('[data-test=zero-state-filter]').should(
          'contain',
          'No tasks  - change the filters to see other available tasks in this workstream'
        )
        cy.get('[data-test=reset-button]').click({ force: true })
      })
    })
    describe('when changing the status filter all ', () => {
      before(() => {
        cy.get('[data-test=status-filter]').click({ force: true })
        cy.get('[data-test=status-filter-all]').click()
      })
      it('should show all tasks', () => {
        cy.get('[data-test=draggable-task]')
          .filter(':visible')
          .should('have.length', 10)
        cy.get('[data-test=reset-button]').click({ force: true })
      })
    })

    describe('when changing the team member filter', () => {
      before(() => {
        cy.get('[data-test=user-filter]').click({ force: true })
        cy.get('[data-test=person-filter-you]').click()
      })
      it('should show only 1 phase tasks', () => {
        cy.get('[data-test=draggable-task]')
          .filter(':visible')
          .should('have.length', 1)
      })
      it('should show 9 phase tasks', () => {
        cy.get('[data-test=user-filter]').click({ force: true })
        cy.get('[data-test=person-filter-unassigned]').click()
        cy.get('[data-test=draggable-task]')
          .filter(':visible')
          .should('have.length', 9)
        cy.get('[data-test=reset-button]').click({ force: true })
      })
    })

    describe('when changing the task type filter', () => {
      before(() => {
        cy.get('[data-test=task-type-filter]').click({ force: true })
        cy.get('[data-test=only-milestones]').click()
      })
      it('should show only 1 phase tasks', () => {
        cy.get('[data-test=draggable-task]')
          .filter(':visible')
          .should('have.length', 1)
      })
      it('should show 10 phase tasks', () => {
        cy.get('[data-test=task-type-filter]').click({ force: true })
        cy.get('[data-test=everything]').click()
        cy.get('[data-test=draggable-task]')
          .filter(':visible')
          .should('have.length', 10)
      })
    })

    describe('when changing the team member filter', () => {
      before(() => {
        cy.get('[data-test=date-filter]').click({ force: true })
        cy.get('[data-test=before-end]').click({ force: true })
      })
      it('should show only 1 phase tasks', () => {
        cy.get('[data-test=draggable-task]')
          .filter(':visible')
          .should('have.length', 1)
      })
      it('should show 1 phase task after', () => {
        cy.get('[data-test=date-filter]').click({ force: true })
        cy.get('[data-test=after-end]').click()
        cy.get('[data-test=draggable-task]')
          .filter(':visible')
          .should('have.length', 1)
        cy.get('[data-test=reset-button]').click({ force: true })
      })

      it('should show 8 phase task with no date', () => {
        cy.get('[data-test=date-filter]').click({ force: true })
        cy.get('[data-test=no-end]').click()
        cy.get('[data-test=draggable-task]')
          .filter(':visible')
          .should('have.length', 8)
        cy.get('[data-test=reset-button]').click({ force: true })
      })
    })
  }
)
