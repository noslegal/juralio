import dayjs from 'dayjs'
import { getDateDisplayString } from '../../../../../helpers/date/date_string_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { DATE_FORMAT_FULL } from '../../../../../helpers/date/date_constants'

describe('roadmap_drag_and_drop_date_pin_zero_state_spec.cy', () => {
  let user, fixture, appPage

  let tenDaysBeforeNow = new Date()
  let tenDaysFromNow = new Date()
  let twentyDaysFromNow = new Date()
  const now = new Date()

  before(() => {
    now.setMinutes(now.getMinutes() - 15)
    tenDaysBeforeNow.setDate(now.getDate() - 10)
    tenDaysFromNow.setDate(now.getDate() + 10)
    twentyDaysFromNow.setDate(now.getDate() + 20)
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskMapDNDLevelATest',
          teamMembers: [user],
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
                  properties: {
                    plannedStartDate: tenDaysBeforeNow,
                    plannedEndDate: tenDaysFromNow,
                  },
                },
                {
                  name: 'Test 3',
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

  describe('when navigating to the task map', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitRoadmap()
    })

    it('should set the correct document title', () => {
      cy.title().should('contain', 'Roadmap |')
    })

    describe('Drag to set an end date', () => {
      before(() => {
        cy.window().then(win => {
          cy.get('[data-test=roadmap-end-pin]')
            .eq(0)
            .trigger('mousedown', {
              view: win,
            })
            .trigger('mousemove', {
              clientX: 1000,
              clientY: 0,
            })
            .trigger('mouseup', {
              view: win,
            })
        })
        cy.get('[data-test="confirm-drag"]').click()
      })
      it('should show the done subtasks in the expected order after drag & drop', () => {
        cy.wait(1000)
        cy.get('[data-test=task-cell-test]', { timeout: 30000 })
          .eq(0)
          .click({ force: true })
        cy.wait(1000)
        cy.get('[data-test=planned-end-date]').should(
          'not.contain',
          'Set planned end'
        )
      })
    })

    describe('Drag to set a start date', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitRoadmap()
        cy.window().then(win => {
          cy.get('[data-test=roadmap-start-pin]')
            .eq(0)
            .trigger('mousedown')
            .trigger('mousemove', {
              clientX: 100,
              clientY: 0,
            })
            .trigger('mouseup', {
              view: win,
            })
        })
        cy.get('[data-test="confirm-drag"]').click()
      })
      it('should show the done subtasks in the expected order after drag & drop', () => {
        cy.wait(1000)
        cy.get('[data-test=task-cell-test]', { timeout: 30000 })
          .eq(0)
          .click({ force: true })
        cy.get('[data-test=planned-start-date]').should(
          'not.contain',
          'Set planned start'
        )
      })
    })

    describe('Drag to change a start date', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitRoadmap()
        cy.window().then(win => {
          cy.get('[data-test=roadmap-start-pin]').eq(1).trigger('mousedown', {
            view: win,
          })
          cy.wait(1000)
          cy.get('[data-test=roadmap-start-pin]').eq(1).trigger('mousemove', {
            clientX: 85,
            clientY: 0,
          })
          cy.wait(1000)
          cy.get('[data-test=roadmap-start-pin]').eq(1).trigger('mouseup', {
            view: win,
            force: true,
          })
        })
        cy.wait(1000)
        cy.get('[data-test="confirm-drag"]').click({ force: true })
      })
      it('should show the done subtasks in the expected order after drag & drop', () => {
        cy.wait(1000)
        cy.get('[data-test=task-cell-test]', { timeout: 30000 })
          .eq(1)
          .click({ force: true })
        cy.get('[data-test=planned-start-date]').should(
          'not.contain',
          getDateDisplayString(dayjs(tenDaysBeforeNow), DATE_FORMAT_FULL, false)
        )
      })
    })

    describe('Drag to change an end date', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitRoadmap()
        cy.window().then(win => {
          cy.get('[data-test=roadmap-end-pin]').eq(1).trigger('mousedown', {
            view: win,
          })
          cy.wait(1000)
          cy.get('[data-test=roadmap-end-pin]').eq(1).trigger('mousemove', {
            clientX: 1000,
            clientY: 0,
          })
          cy.wait(1000)
          cy.get('[data-test=roadmap-end-pin]').eq(1).trigger('mouseup', {
            view: win,
          })
        })
        cy.wait(1000)
        cy.get('[data-test="confirm-drag"]').click({ force: true })
      })
      it('should show the done subtasks in the expected order after drag & drop', () => {
        cy.wait(1000)
        cy.get('[data-test=task-cell-test]', { timeout: 30000 })
          .eq(1)
          .click({ force: true })
        cy.get('[data-test=planned-end-date]').should(
          'not.contain',
          getDateDisplayString(dayjs(tenDaysFromNow), DATE_FORMAT_FULL, false)
        )
      })
    })
  })
})
