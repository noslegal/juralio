//s+
//s-
//d+ s-
//d+ e+
//d- s+
//d- e-
//e+
//e-
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()
describe('knock_on_dialog_display_spec', () => {
  let user
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'A',
              tasks: [
                {
                  name: '1',
                  status: 'not-started',
                  properties: {
                    plannedStartDate: new Date(2000, 1, 1),
                    plannedEndDate: new Date(2000, 1, 10),
                  },
                  tasks: [
                    {
                      name: '2',
                      status: 'not-started',
                      properties: {
                        plannedStartDate: new Date(2000, 1, 5),
                        plannedEndDate: new Date(2000, 1, 8),
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'B',
              tasks: [
                {
                  name: '1',
                  properties: {
                    status: 'in-progress',

                    actualStartDate: new Date(2000, 1, 1),
                    plannedEndDate: new Date(2000, 1, 10),
                  },
                  tasks: [
                    {
                      name: '2',

                      properties: {
                        status: 'in-progress',
                        actualStartDate: new Date(2000, 1, 5),
                        plannedEndDate: new Date(2000, 1, 8),
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'C',
              tasks: [
                {
                  name: '1',
                  properties: {
                    status: 'done',

                    actualStartDate: new Date(2000, 1, 1),
                    actualEndDate: new Date(2000, 1, 10),
                  },
                  tasks: [
                    {
                      name: '2',
                      properties: {
                        status: 'done',

                        actualStartDate: new Date(2000, 1, 5),
                        actualEndDate: new Date(2000, 1, 8),
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
  describe('when altering not-started dates', () => {
    describe('when moving the knocking the subtask start date forward', () => {
      before(() => {
        cy.login(user)
        visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
        cy.get('[data-test=task-cell-date-picker-start]', {
          timeout: 30000,
        })
          .eq(0)
          .click({ timeout: 30000 })
        cy.wait(5000)
        cy.get('button').contains(new RegExp('^6$')).click()
      })
      it('should show the correct dialog', () => {
        cy.get('[data-test=summary-message]', { timeout: 30000 }).should(
          'exist'
        )
        cy.get('[data-test=affected-task-count]').should('contain.text', '1')
        cy.get('[data-test=affected-task-count]').should('contain.text', 'Task')
        cy.get('[data-test=max-impact]').should('contain.text', '1')
        cy.get('[data-test=max-impact]').should('contain.text', 'Day')
        cy.get('[data-test=affected-task-name]').should('contain.text', '#2 2')
        cy.get('[data-test=affected-details-duration]').should('be.visible')
        cy.get('[data-test=affected-details-planned-start]').should(
          'be.visible'
        )
        cy.get('[data-test=days-update]').should('contain.text', '+1')
        cy.get('[data-test=old-date]').should('contain.text', '35 Feb 2000')
        cy.get('[data-test=new-date]').should('contain.text', '26 Feb 2000')
      })
    })
    describe('when moving the knocking the subtask end date back', () => {
      before(() => {
        cy.login(user)
        visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
        cy.get('[data-test=task-cell-date-picker-end]', {
          timeout: 30000,
        })
          .eq(0)
          .click({ timeout: 30000 })
        cy.wait(5000)
        cy.get('button').contains(new RegExp('^6$')).click()
      })
      it('should show the correct dialog', () => {
        cy.get('[data-test=summary-message]', { timeout: 30000 }).should(
          'exist'
        )
        cy.get('[data-test=affected-task-count]').should('contain.text', '1')
        cy.get('[data-test=affected-task-count]').should('contain.text', 'Task')
        cy.get('[data-test=max-impact]').should('contain.text', '2')
        cy.get('[data-test=max-impact]').should('contain.text', 'Days')
        cy.get('[data-test=affected-task-name]').should('contain.text', '#2 2')
        cy.get('[data-test=affected-details-duration]').should('be.visible')
        cy.get('[data-test=affected-details-planned-end]').should('be.visible')
        cy.get('[data-test=days-update]').should('contain.text', '-2')
        cy.get('[data-test=old-date]').should('contain.text', '38 Feb 2000')
        cy.get('[data-test=new-date]').should('contain.text', '16 Feb 2000')
      })
    })
  })
  describe('when altering in-progress dates', () => {
    describe('when moving the knocking the subtask end date forward', () => {
      before(() => {
        cy.login(user)
        visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[1].id)
        cy.get('[data-test=task-cell-date-picker-end]', {
          timeout: 30000,
        })
          .eq(0)
          .click({ timeout: 30000 })
        cy.wait(5000)
        cy.get('button').contains(new RegExp('^6$')).click()
      })
      it('should show the correct dialog', () => {
        cy.get('[data-test=summary-message]', { timeout: 30000 }).should(
          'exist'
        )
        cy.get('[data-test=affected-task-count]').should('contain.text', '1')
        cy.get('[data-test=affected-task-count]').should('contain.text', 'Task')
        cy.get('[data-test=max-impact]').should('contain.text', '2')
        cy.get('[data-test=max-impact]').should('contain.text', 'Days')
        cy.get('[data-test=affected-task-name]').should('contain.text', '#4 2')
        cy.get('[data-test=affected-details-duration]').should('be.visible')
        cy.get('[data-test=affected-details-planned-end]').should('be.visible')
        cy.get('[data-test=days-update]').should('contain.text', '-2-2')
        cy.get('[data-test=old-date]').should('contain.text', '38 Feb 2000')
        cy.get('[data-test=new-date]').should('contain.text', '16 Feb 2000')
      })
    })
  })
  describe('when altering done dates', () => {
    before(() => {
      cy.login(user)
      visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[2].id)
      cy.get('[data-test=minimised-filters]').click({ force: true })
      cy.get('[data-test=done-checkbox]').click()
      cy.wait(2000)
      cy.get('body').click()
    })
    describe('when moving the knocking the subtask end date forward', () => {
      before(() => {
        cy.get('[data-test=done-display]', {
          timeout: 30000,
        })
          .eq(1)
          .click({ timeout: 30000 })
        cy.wait(5000)
        cy.get('button').contains(new RegExp('^6$')).click()
      })
      it('should show the correct dialog', () => {
        cy.get('[data-test=summary-message]', { timeout: 30000 }).should(
          'exist'
        )
        cy.get('[data-test=affected-task-count]').should('contain.text', '1')
        cy.get('[data-test=affected-task-count]').should('contain.text', 'Task')
        cy.get('[data-test=max-impact]').should('contain.text', '2')
        cy.get('[data-test=max-impact]').should('contain.text', 'Days')
        cy.get('[data-test=affected-task-name]').should('contain.text', '#6 2')
        cy.get('[data-test=affected-details-duration]').should('be.visible')
        cy.get('[data-test=affected-details-actual-end]').should('be.visible')
        cy.get('[data-test=days-update]').should('contain.text', '-2')
        cy.get('[data-test=old-date]').should('contain.text', '38 Feb 2000')
        cy.get('[data-test=new-date]').should('contain.text', '16 Feb 2000')
      })
    })
  })
})
