import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskmapPage from '../../../../../../page/taskmap/taskmap_page'

const ERROR_TEXT_COLOUR = 'rgb(176, 0, 32)'
const NORMAL_TEXT_COLOUR = 'rgba(0, 0, 0, 0.87)'

const tenDaysBeforeNow = new Date()
const now = new Date()

now.setMinutes(now.getMinutes() - 15) // subtract a few minutes to allow for some deviation & client & server clocks

tenDaysBeforeNow.setDate(now.getDate() - 10)

describe('task_card_dates_highlighting.cy', () => {
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
                {
                  name: 'Not Started',
                  properties: { plannedStartDate: tenDaysBeforeNow },
                },
                {
                  name: 'Done',
                  properties: {
                    plannedEndDate: tenDaysBeforeNow,
                  },
                },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when looking at the task details for a NS with PSD in the past', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Not Started')
    })

    it('should show the PSD in the error colour', () => {
      cy.get('[data-test="planned-start-date"]')
        .find('span')
        .should('have.css', 'color', ERROR_TEXT_COLOUR)
    })

    describe('when the task is set to in progress', () => {
      before(() => {
        taskOptionsMenu.menuButton().click()
        taskOptionsMenu.inProgress().click()
        cy.get('[data-test="date-expansion-button"]').click()
        cy.wait(5000)
      })

      it('should show the ASD in normal text colour', () => {
        cy.get('[data-test="actual-start-date"]', { timeout: 30000 })
          .find('span')
          .should('have.css', 'color', NORMAL_TEXT_COLOUR)
      })

      describe('when the task is set to done', () => {
        before(() => {
          taskOptionsMenu.menuButton().click()
          cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*').as(
            'patchTask'
          )
          taskOptionsMenu.done().click()
          cy.wait('@patchTask')
        })

        it('should show the ASD in normal text colour', () => {
          cy.get('[data-test="actual-start-date"]')
            .find('span')
            .should('have.css', 'color', NORMAL_TEXT_COLOUR)
        })
      })
    })
  })

  describe('when looking at the task details for a Done task with PSD in the past', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Done')
      taskOptionsMenu.menuButton().click()
      cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*').as('patchTask')
      taskOptionsMenu.done().click()
      cy.wait('@patchTask')
      cy.get('[data-test="date-expansion-button"]').click()
    })

    it('should show the AED in the normal colour', () => {
      cy.get('[data-test="actual-end-date"]')
        .find('span')
        .should('have.css', 'color', NORMAL_TEXT_COLOUR)
    })

    describe('when the task is set to in progress', () => {
      before(() => {
        taskOptionsMenu.menuButton().click()
        cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*').as(
          'patchTask'
        )
        taskOptionsMenu.inProgress().click()
        cy.wait('@patchTask')
      })

      it('should clear the PED ', () => {
        cy.get('[data-test="planned-end-date"]')
          .find('span')
          .should('have.css', 'color', NORMAL_TEXT_COLOUR)
      })

      describe('when the task is set to not started', () => {
        before(() => {
          taskOptionsMenu.menuButton().click()
          cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*').as(
            'patchTask'
          )
          taskOptionsMenu.notStarted().click()
          cy.wait('@patchTask')
        })

        it('should show the PED in normal text colour', () => {
          cy.get('[data-test="planned-end-date"]')
            .find('span')
            .should('have.css', 'color', NORMAL_TEXT_COLOUR)
        })
      })
    })
  })
})
