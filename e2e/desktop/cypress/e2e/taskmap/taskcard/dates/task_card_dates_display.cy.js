import dateValueHelper from '../../../../../../helpers/date/date_value_helper'
import { generateFixture } from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskmapPage from '../../../../../../page/taskmap/taskmap_page'

describe('task_card_dates_display.cy', () => {
  const taskOptionsMenu = taskmapPage.operationMenu
  let user, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskCardDatesDisplaySpec',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'TaskCardsDatesDisplaySpec',
              tasks: [
                { name: 'Not Started - No Dates' },
                {
                  name: 'Not Started - Dates',
                  properties: {
                    plannedStartDate: '2018-07-07T12:00:00.000Z',
                    plannedEndDate: '2018-07-08T12:00:00.000Z',
                  },
                },
                {
                  name: 'In Progress',
                  properties: {
                    plannedEndDate: '2025-07-07T12:00:00.000Z',
                  },
                },
                {
                  name: 'Done',
                },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('when navigating to a task that is Not Started', () => {
    describe('which has NO planned start date', () => {
      before(() => {
        cy.login(user.username)
        taskmapPage.navigate.task(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id
        )
      })

      it('the planned start date field should be blank', () => {
        cy.get('[data-test="planned-start-date"]')
          .should('contain.text', 'Set planned start')
      })
    })

    describe('which has a planned start date', () => {
      before(() => {
        cy.login(user.username)
        taskmapPage.navigate.task(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[1].id
        )
      })

      it('the planned start date field should contain "Sat 7 Jul 2018"', () => {
        cy.get('[data-test="planned-start-date"]')
          .should('contain.text', 'Sat 7 Jul 2018')
      })

      describe('and the date picker is opened', () => {
        before(() => {
          cy.get('[data-test="planned-start-date"]').click()
        })

        it('should contain an option to clear the date', () => {
          cy.get('[role="dialog"]').find('button').contains('Clear')
        })
      })
    })

    describe('which has NO planned end date', () => {
      before(() => {
        cy.login(user.username)
        taskmapPage.navigate.task(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id
        )
      })

      it('the planned end date field should be blank', () => {
        cy.get('[data-test="planned-end-date"]')
          .should('contain.text', '')
      })
    })

    describe('which has a planned end date', () => {
      before(() => {
        cy.login(user.username)
        taskmapPage.navigate.task(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[1].id
        )
      })

      it('the planned end date field should contain "Sun 8 Jul 2018"', () => {
        cy.get('[data-test="planned-end-date"]')
          .should('contain.text', 'Sun 8 Jul 2018')
      })

      describe('and the date picker is opened', () => {
        before(() => {
          cy.get('[data-test="planned-end-date"]').click()
        })

        it('should contain an option to clear the date', () => {
          cy.get('[role="dialog"]').find('button').contains('Clear')
        })
      })
    })
  })

  describe('when navigating to a task that is In Progress', () => {
    let currentDateFormatted

    before(() => {
      cy.login(user.username)
      taskmapPage.navigate.task(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[2].id
      )

      taskOptionsMenu.menuButton().click()
      taskOptionsMenu.inProgress().click()
      currentDateFormatted = dateValueHelper.getCurrentDateAsString()
    })

    it('the actual start date field should be today', () => {
      cy.get('[data-test="actual-start-date"]')
        .should('contain.text', 'Today')
    })

    it('the planned end date field should be "Mon 7 Jul 2025"', () => {
      cy.get('[data-test="planned-end-date"]')
        .should('contain.text', 'Mon 7 Jul 2025')
    })

    describe('and the show all dates button is clicked', () => {
      before(() => {
        cy.get('[data-test="date-expansion-button"]').click()
      })

      it('should show the extra dates', () => {
        cy.get('[data-test="planned-start-date"]').should('be.visible')
      })
    })

    describe('and the hide extra dates button is clicked', () => {
      before(() => {
        cy.get('[data-test="date-expansion-button"]').click()
      })

      it('should hide the extra dates', () => {
        cy.get('[data-test="planned-start-date"]').should('not.exist')
      })
    })

    describe('and the date picker is opened', () => {
      before(() => {
        cy.get('[data-test="actual-start-date"]').click()
      })

      it('should NOT contain an option to clear the date', () => {
        cy.get('[role="dialog"]')
          .find('button')
          .contains('Clear')
          .should('not.exist')
      })
    })
  })

  describe('when navigating to a task that is Done', () => {
    let currentDateFormatted

    before(() => {
      cy.login(user.username)
      taskmapPage.navigate.task(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[3].id
      )

      taskOptionsMenu.menuButton().click()
      taskOptionsMenu.done().click()
      currentDateFormatted = dateValueHelper.getCurrentDateAsString()
    })

    it('the actual end date field should be today', () => {
      cy.get('[data-test="actual-end-date"]')
        .should('contain.text', 'Today')
    })

    describe('and the date picker is opened', () => {
      before(() => {
        cy.get('[data-test="actual-end-date"]').click()
      })

      it('should NOT contain an option to clear the date', () => {
        cy.get('[role="dialog"]')
          .find('button')
          .contains('Clear')
          .should('not.exist')
      })
    })
  })
})
