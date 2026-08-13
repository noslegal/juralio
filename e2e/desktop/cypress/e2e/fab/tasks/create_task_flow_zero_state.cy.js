import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('create_task_flow_zero_state.cy', () => {
  let user, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'task_map_zero_create_',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('when a user navigate to an empty project', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
      cy.get('[data-test=loading-map-progress]').should('not.exist')
    })
    describe('When the user creates their first task using zero state button', () => {
      before(() => {
        const longTimeout = {
          timeout: 30000,
        }
        cy.wait(5000)
        cy.get('[data-test=taskmap-zero-state-button]', longTimeout).click()
        cy.get('[data-test=task-cell-test]', { timeout: 10000 })
        cy.backendRoute('POST', '/matter/*/workstreams/*/tasks').as('postTask')
        cy.get(
          '[data-test=edit-name-field] > .MuiInputBase-root > .MuiInputBase-input',
          longTimeout
        ).type('New Task{enter}')
        cy.wait('@postTask')
      })

      it('There should be another task on the map', () => {
        cy.get('[data-test=task-cell-test]').its('length').should('be.gt', 1)
      })
    })
  })
})
