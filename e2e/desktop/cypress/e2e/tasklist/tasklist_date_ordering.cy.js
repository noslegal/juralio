import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../helpers/users/user_api_helper'

let tenDaysBeforeNow = new Date()
let tenDaysFromNow = new Date()
const now = new Date()
describe(
  'tasklist_date_ordering.cy',
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
                      { name: 'Gamma' },
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
        cy.get('[data-test=draggable-task]', { timeout: 30000 })
          .eq(7)
          .contains('Epsilon')
        cy.get('[data-test=draggable-task]', { timeout: 30000 })
          .eq(3)
          .contains('Delta')
      })
    })

    //not currently working
    describe('when changing the ordering on the tasklist to end date ', () => {
      before(() => {
        cy.get('[data-test=view-ordering]').click()
        cy.get('[data-test=end-date-ordering]').click()
      })
      it('should move the end dates to be ordered', () => {
        cy.get('[data-test=draggable-task]')
          .filter(':visible')
          .should('have.length', 10)
        cy.get('[data-test=draggable-task]', { timeout: 30000 })
          .eq(0)
          .contains('Epsilon')
        cy.get('[data-test=draggable-task]', { timeout: 30000 })
          .eq(1)
          .contains('Delta')
      })
    })
  }
)
