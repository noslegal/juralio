import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

describe('template_map_zero_state.cy', () => {
  let user, fixture, visitHelpers

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'template_map_zero_state_spec_',
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
      visitHelpers = new VisitHelpers()
    })
  })

  describe('when a user navigate to an empty template task map', () => {
    before(() => {
      cy.login(user.username)
      createTemplate('Empty Template', fixture.projects[0].id).then(
        template => {
          visitHelpers.visitTemplateTaskMap(template.id)
        }
      )
    })

    it('the zero-state should be displayed', () => {
      cy.get('[data-test="zero-state-title"]')
        .should('be.visible')
        .should('have.text', 'Your template is empty')
      cy.get('[data-test="zero-state-caption"]')
        .should('be.visible')
        .should('have.text', 'Get started by creating your first level A task')
      cy.get('[data-test="taskmap-zero-state-button"]')
        .should('be.visible')
        .should('have.text', 'Create a phase')
    })

    describe('When the user creates their first task using zero state button', () => {
      before(() => {
        cy.clock()
        cy.get('[data-test="taskmap-zero-state-button"]').click()
        cy.tick(2000)
      })

      it('the placeholder template task should be purple', () => {
        cy.get('[data-test="task-cell-test"]')
          .eq(0)
          .should('have.css', 'background-color', 'rgb(206, 201, 237)')
      })

      describe('When the user finishes creating the task', () => {
        before(() => {
          cy.get('input').eq(0).type('New Template Task{enter}')
        })

        it('should display the first task', () => {
          cy.get('[data-test="task-cell-test"]')
            .should('be.visible')
            .should('contain', 'New Template Task')
        })
      })
    })
  })
})
