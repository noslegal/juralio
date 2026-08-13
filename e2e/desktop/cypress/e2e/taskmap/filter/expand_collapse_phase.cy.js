import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { getTaskCellByTaskName } from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

// Collapsing/expanding via the per-task hover button now works at EVERY level,
// not just phases (level 1). This spec covers both the phase case and a
// non-phase (level B) task to exercise the extended behaviour.
describe('expand_collapse_phase.cy', () => {
  let adminUser, fixture, appPage

  const createUser1 = () =>
    createUser().then(createdUser => (adminUser = createdUser))

  const hoverCell = name =>
    getTaskCellByTaskName(name).trigger('mouseover', { force: true })

  const collapseCell = name => {
    hoverCell(name)
    getTaskCellByTaskName(name)
      .find('[data-test=task-collapse]')
      .first()
      .click({ force: true })
    cy.wait(500)
  }

  const expandCell = name => {
    hoverCell(name)
    getTaskCellByTaskName(name)
      .find('[data-test=task-expand]')
      .first()
      .click({ force: true })
    cy.wait(500)
  }

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
                  name: 'Phase-A',
                  teamMembers: [adminUser],
                  tasks: [
                    {
                      name: 'Task-B',
                      tasks: [{ name: 'Task-C1' }, { name: 'Task-C2' }],
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
    })

    it('should show all 4 tasks', () => {
      cy.get('[data-test=options-dropdown]', { timeout: 30000 }).should(
        'have.length',
        4
      )
    })

    describe('when collapsing the phase (level A)', () => {
      before(() => {
        collapseCell('Phase-A')
      })

      it('should collapse the whole phase to a single summary cell', () => {
        cy.get('[data-test=options-dropdown]', { timeout: 30000 }).should(
          'have.length',
          1
        )
        cy.get('[data-test=collapse-task-content]').should('be.visible')
      })
    })

    describe('when expanding the phase again', () => {
      before(() => {
        expandCell('Phase-A')
      })

      it('should restore all 4 tasks', () => {
        cy.get('[data-test=options-dropdown]', { timeout: 30000 }).should(
          'have.length',
          4
        )
        cy.get('[data-test=collapse-task-content]').should('not.exist')
      })
    })

    describe('when collapsing a non-phase task (level B)', () => {
      before(() => {
        collapseCell('Task-B')
      })

      it('should collapse only that task, hiding its two subtasks', () => {
        // Phase-A + the collapsed Task-B remain; Task-C1 / Task-C2 are hidden
        cy.get('[data-test=options-dropdown]', { timeout: 30000 }).should(
          'have.length',
          2
        )
        cy.get('[data-test=collapse-task-content]').should('have.length', 1)
        cy.contains('Task-C1').should('not.exist')
      })
    })

    describe('when expanding the non-phase task again', () => {
      before(() => {
        expandCell('Task-B')
      })

      it('should restore all 4 tasks', () => {
        cy.get('[data-test=options-dropdown]', { timeout: 30000 }).should(
          'have.length',
          4
        )
        cy.contains('Task-C1').should('exist')
      })
    })
  })
})
