import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { getTaskCellByTaskName } from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

// A phase that is only shown as a "ghost" (because the active filter matched a
// descendant, not the phase itself) must not offer the collapse button - there
// is nothing meaningful to collapse to. Collapsing is only offered on real
// phases.
describe('collapse_button_ghost_phase.cy', () => {
  let adminUser, fixture, appPage

  const createUser1 = () =>
    createUser().then(createdUser => (adminUser = createdUser))

  const hoverPhase = () =>
    getTaskCellByTaskName('Phase-A').trigger('mouseover', { force: true })

  before(() => {
    createUser1().then(() => {
      const seed = {
        matter: {
          prefix: 'task_status_event',
          teamMembers: [adminUser],
          matterAdmins: [adminUser],
          projects: [
            {
              name: 'Law Project',
              tasks: [
                {
                  // Phase itself is unassigned -> becomes a ghost under "your tasks"
                  name: 'Phase-A',
                  tasks: [
                    {
                      // Assigned to the user, so it matches the "your tasks" filter
                      name: 'Task-B',
                      teamMembers: [adminUser],
                    },
                  ],
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

  describe('when on the task map', () => {
    before(() => {
      cy.reload()
      cy.login(adminUser.username)
      appPage.visitTaskMap()
      cy.wait(2000)
      // Expand the (minimised) filter bar so the person filter is reachable
      cy.get('[data-test=minimised-filters]').click({ force: true })
    })

    it('should offer the collapse button on the real phase', () => {
      hoverPhase()
      cy.get('[data-test=task-preview-opener]').should('be.visible')
      cy.get('[data-test=task-collapse]').should('be.visible')
    })

    describe('when filtering to "your tasks" so the phase is a ghost', () => {
      before(() => {
        cy.get('[data-test=person-filter-selected-text]').click()
        cy.get('[data-test=person-filter-you]').click()
        cy.wait(500)
        hoverPhase()
      })

      it('should not offer the collapse button on the ghost phase', () => {
        cy.get('[data-test=task-preview-opener]').should('be.visible')
        cy.get('[data-test=task-collapse]').should('not.exist')
      })
    })

    describe('when removing the filter', () => {
      before(() => {
        cy.get('[data-test=person-filter-selected-text]').click()
        cy.get('[data-test=person-filter-everyone]').click()
        cy.wait(500)
        hoverPhase()
      })

      it('should offer the collapse button again', () => {
        cy.get('[data-test=task-preview-opener]').should('be.visible')
        cy.get('[data-test=task-collapse]').should('be.visible')
      })
    })
  })
})
