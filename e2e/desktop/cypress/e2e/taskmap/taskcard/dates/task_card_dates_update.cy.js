import {
  clearDate,
  selectDate,
} from '../../../../../../helpers/date/picker/date_picker_helper'
import { generateFixture } from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskmapPage from '../../../../../../page/taskmap/taskmap_page'

const taskOptionsMenu = taskmapPage.operationMenu

describe('task_card_dates_update.cy', () => {
  let user, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskCardDatesUpdateSpec',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'TaskCardsDatesUpdateSpec',
              tasks: [
                {
                  name: 'Not Started - Dates',
                  properties: {
                    plannedStartDate: '2018-07-01T12:00:00.000Z',
                    plannedEndDate: '2018-08-01T12:00:00.000Z',
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

  function navigateToTask(taskIndex) {
    cy.login(user.username)
    taskmapPage.navigate.task(
      fixture.matter.id,
      fixture.projects[0].id,
      fixture.tasks[taskIndex].id
    )
  }

  describe('when navigating to a task that has both start and end PLANNED dates', () => {
    describe('and changing', () => {
      describe('the planned start date', () => {
        before(() => {
          navigateToTask(0)
          selectDate('[data-test="planned-start-date"]', 2015, 6, 15)
        })

        it('should display the updated date', () => {
          cy.get('[data-test="planned-start-date"]').should(
            'contain.text',
            'Mon 15 Jun 2015'
          )
        })

        describe('and when the page is refreshed', () => {
          before(() => {
            navigateToTask(0)
          })

          it('should display the updated date', () => {
            cy.get('[data-test="planned-start-date"]').should(
              'contain.text',
              'Mon 15 Jun 2015'
            )
          })
        })
      })

      describe('the planned end date', () => {
        before(() => {
          navigateToTask(0)
          selectDate('[data-test="planned-end-date"]', 2015, 6, 16)
        })

        it('should display the updated date', () => {
          cy.get('[data-test="planned-end-date"]').should(
            'contain.text',
            'Tue 16 Jun 2015'
          )
        })

        describe('and when the page is refreshed', () => {
          before(() => {
            navigateToTask(0)
          })

          it('should display the updated date', () => {
            cy.get('[data-test="planned-end-date"]').should(
              'contain.text',
              'Tue 16 Jun 2015'
            )
          })
        })
      })
    })

    describe('and clearing', () => {
      describe('the planned start date', () => {
        before(() => {
          navigateToTask(0)
          clearDate('[data-test="planned-start-date"]')
        })

        it('should clear the date', () => {
          cy.wait(3000)
          cy.get('[data-test="planned-start-date"]').should(
            'contain.text',
            'Set planned start'
          )
        })

        describe('and when the page is refreshed', () => {
          before(() => {
            navigateToTask(0)
          })

          it('the date should still be cleared', () => {
            cy.get('[data-test="planned-start-date"]').should(
              'contain.text',
              'Set planned start'
            )
          })
        })
      })

      describe('the planned end date', () => {
        before(() => {
          navigateToTask(0)
          clearDate('[data-test="planned-end-date"]')
        })

        it('should clear the date', () => {
          cy.get('[data-test="planned-end-date"]').should(
            'contain.text',
            'Set planned end'
          )
        })

        describe('and when the page is refreshed', () => {
          before(() => {
            navigateToTask(0)
          })

          it('the date should still be cleared', () => {
            cy.get('[data-test="planned-end-date"]').should(
              'contain.text',
              'Set planned end'
            )
          })
        })
      })
    })
  })

  describe('when navigating to a task that has both start and end ACTUAL dates', () => {
    describe('and changing', () => {
      describe('the actual start date', () => {
        before(() => {
          navigateToTask(1)
          taskOptionsMenu.menuButton().click()
          taskOptionsMenu.done().click()
          selectDate('[data-test="actual-start-date"]', 2015, 6, 15)
        })

        it('should display the updated date', () => {
          cy.get('[data-test="actual-start-date"]').should(
            'contain.text',
            'Mon 15 Jun 2015'
          )
        })

        describe('and when the page is refreshed', () => {
          before(() => {
            navigateToTask(1)
          })

          it('should display the updated date', () => {
            cy.get('[data-test="actual-start-date"]').should(
              'contain.text',
              'Mon 15 Jun 2015'
            )
          })
        })
      })

      describe('the actual end date', () => {
        before(() => {
          navigateToTask(1)
          selectDate('[data-test=actual-end-date]', 2015, 6, 16)
        })

        it('should display the updated date', () => {
          cy.get('[data-test=actual-end-date]').should(
            'contain.text',
            'Tue 16 Jun 2015'
          )
        })

        describe('and when the page is refreshed', () => {
          before(() => {
            navigateToTask(1)
          })

          it('should display the updated date', () => {
            cy.get('[data-test=actual-end-date]').should(
              'contain.text',
              'Tue 16 Jun 2015'
            )
          })
        })
      })
    })
  })
})
