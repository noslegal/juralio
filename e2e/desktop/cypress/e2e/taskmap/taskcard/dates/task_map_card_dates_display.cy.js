import { generateFixture } from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskmapPage from '../../../../../../page/taskmap/taskmap_page'

describe('task_map_card_dates_display.cy', () => {
  let user, fixture

  before(() => {
    cy.window().then(win => {
      win.sessionStorage.clear()
    })
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
                  name: 'Not Started - start',
                  properties: {
                    plannedStartDate: '2018-07-07T12:00:00.000Z',
                  },
                },
                {
                  name: 'Not started end',
                  properties: {
                    plannedEndDate: '2025-07-07T12:00:00.000Z',
                  },
                },
                {
                  name: 'In Progress',
                  properties: {
                    status: 'in-progress',
                    plannedEndDate: '2025-07-07T12:00:00.000Z',
                  },
                },
                {
                  name: 'Done',
                  properties: {
                    status: 'done',
                  },
                },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('when looking at the task cards on the taskmap', () => {
    before(() => {
      cy.login(user.username)
      taskmapPage.navigate.map(fixture.matter.id, fixture.projects[0].id)
      cy.get('.reactour__close').click()

      cy.get('[data-test=minimised-filters]').click({ force: true })
      cy.get('[data-test=done-checkbox]').click()
      // cy.get('body').click()
    })

    it('should show the taskmap', () => {
      cy.get('[data-test=not-started-display]')
        .eq(0)
        .should('contain', 'Set planned start')
      cy.get('[data-test=not-started-display]')
        .eq(1)
        .should('contain', 'Set planned end')
      cy.get('[data-test=not-started-display]')
        .eq(2)
        .should('contain', 'Set planned start')
      // cy.get('[data-test=done-display]').should('contain', 'Done')
      // cy.get('[data-test=done-display]').should('not.contain', 'Start')
      // cy.get('[data-test=in-progress-display]').should('contain', 'Finish')
      // cy.get('[data-test=task-cell-date-picker-start]').should('exist')
      // cy.get('[data-test=task-cell-date-picker-end]').should('exist')
    })
  })
})
