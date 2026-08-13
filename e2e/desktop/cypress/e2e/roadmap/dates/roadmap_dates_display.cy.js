import taskmap_page from '../../../../../page/taskmap/taskmap_page'

const { createUser } = require('../../../../../helpers/users/user_api_helper')
const {
  generateFixture,
} = require('../../../../../helpers/matterprojects/fixture_helper')

describe('roadmap_dates_display.cy', () => {
  const taskOptionsMenu = taskmap_page.operationMenu
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
      taskmap_page.navigate.road(fixture.matter.id, fixture.projects[0].id)
      cy.get('.reactour__close').click()
      cy.get('[data-test=minimised-filters]').click({ force: true })
      cy.get('[data-test=done-checkbox]').click()
      cy.wait(5000)
      cy.get('[data-test=roadmap-end-pin]')
        .eq(2)
        .trigger('mouseover', { force: true })
      cy.get('[data-test=roadmap-start-pin]')
        .eq(4)
        .trigger('mouseover', { force: true })
      cy.get('[data-test=roadmap-start-pin]')
        .eq(0)
        .trigger('mouseover', { force: true })
      cy.get('[data-test=roadmap-end-pin]')
        .eq(0)
        .trigger('mouseover', { force: true })
    })

    it('should show the taskmap', () => {
      cy.get('[data-test=pin-hover-no-date]')
        .eq(0)
        .should('contain', 'Set a planned start date')
      cy.get('[data-test=pin-hover-no-date]')
        .eq(2)
        .should('contain', 'Set a planned start date')
      cy.get('[data-test=hover-date-type]').eq(1).should('contain', 'Ended on')
      cy.get('[data-test=hover-date-type]')
        .eq(0)
        .should('contain', 'Started on')
    })
  })
})
