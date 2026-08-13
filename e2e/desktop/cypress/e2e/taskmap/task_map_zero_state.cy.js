import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('task_map_zero_state.cy', () => {
  let user, otherUser, fixture

  before(() => {
    createUser()
      .then(u => {
        otherUser = u
      })
      .then(createUser)
      .then(createdUser => {
        user = createdUser
        const seed = {
          matter: {
            prefix: 'task_map_create_child_',
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
    })

    it('the zero-state should be displayed', () => {
      cy.get('[data-test="zero-state-title"]').should('be.visible')
      cy.get('[data-test="zero-state-caption"]').should('be.visible')
      cy.get('[data-test="taskmap-zero-state-button"]').should('be.visible')
    })

    describe('When the user creates their first task using zero state button', () => {
      before(() => {
        cy.clock()
        cy.get('[data-test="taskmap-zero-state-button"]').click()
        cy.tick(2000)
        cy.get('input', { timeout: 10000 }).eq(0).type('New Task{enter}')
      })

      it('should display the first task', () => {
        cy.get('[data-test="task-cell-test"]').should('be.visible')
        cy.get('[data-test="task-cell-test"]').should('contain', 'New Task')
      })
    })
  })

  describe('When navigating to a task map as a non-mtm', () => {
    before(() => {
      cy.login(otherUser.username)
      visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
    })

    it('shows the access denied zero state', () => {
      cy.get('h4').should(
        'contain',
        "Oops! You don't have access to this workstream"
      )
    })
  })
})
