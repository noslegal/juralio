import { getProjectForDepthTesting } from '../../../../helpers/data/task_operations_test_project_data'
import {
    generateFixture,
    getWrapper
} from '../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../helpers/users/user_api_helper'

describe('template_task_depth_flow.cy', () => {
  let user, fixture, template, appPage

  before(() => {
    createKnowledgeManagerUser()
      .then(createdUser => {
        user = createdUser
        const seed = {
          matter: {
            prefix: 'template_task_depth',
            teamMembers: [user],
            matterAdmins: [user],
            projects: getProjectForDepthTesting(),
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
      .then(() => {
        cy.login(user.username)
        createTemplate('newTemplateName', fixture.projects[0].id).then(
          createdTemplate => {
            template = createdTemplate
            cy.visit(`/#/template/${template.id}/taskmap`)
          }
        )
      })
  })

  describe('When the template task at level F is visited', () => {
    before(() => {
      cy.login(user.username)
      cy.get('[data-test=name]', { timeout: 30000 })
        .eq(5)
        .should('have.text', 'level F')
        .click()
    })

    it('should be on correct template task', () => {
      cy.get('[data-test=read-field]').should('have.text', 'level F')
    })

    describe('should have correct tree information', () => {
      it('should have 5 level tree info', () => {
        cy.get('[data-test=task-level-letter]').should('have.length', 5)
      })

      describe('on changing level via tree information', () => {
        before(() => {
          cy.login(user.username)
          cy.get('[data-test=task-level-letter]')
            .eq(2)
            .should('have.text', 'C')
            .click()
        })

        it('should be on correct template task', () => {
          cy.get('[data-test=read-field]').should('have.text', 'level C')
        })

        describe('it should show correct tree information', () => {
          it('should have 2 level tree info', () => {
            cy.get('[data-test=task-level-letter]').should('have.length', 2)
          })
        })
      })
    })
  })
})
