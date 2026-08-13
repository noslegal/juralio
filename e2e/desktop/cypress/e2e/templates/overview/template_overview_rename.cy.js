import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

describe('template_overview_rename.cy', () => {
  let testUser,
    fixture,
    project,
    template,
    appPage,
    newTemplateName = 'Test Template'

  before(() => {
    createKnowledgeManagerUser()
      .then(createdUser => {
        testUser = createdUser
        const seed = {
          matter: {
            teamMembers: [testUser],
            matterAdmins: [testUser],
            projects: [
              {
                name: 'Overview Spec with Tasks',
                tasks: [{ name: 'Task1' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
      .then(() => {
        project = fixture.projects[0]
      })
  })

  describe('When navigating to template', () => {
    before(() => {
      cy.login(testUser.username)
      createTemplate(newTemplateName, project.id).then(createdTemplate => {
        template = createdTemplate
        appPage.visitTemplateOverview(template.id)
      })
    })

    it('should display the name of the template', () => {
      cy.get('[data-test=bread1]').should('have.text', template.name)
    })

    describe('when attempting to save the name Juralio', () => {
      before(() => {
        cy.get('[data-test=template-options-button]').eq(1).click()
        cy.get('[data-test="rename-template"]').click()
        cy.get('[data-test=juralio-dialog]').should('be.visible')
        cy.wait(500)
        cy.get('[data-test=rename-field]').find('input').focus()
        cy.get('[data-test=rename-field]')
          .find('input')
          .clear({ force: true })
          .type('Juralio{Enter}', { force: true })
      })

      it('should show the new name', () => {
        cy.get('[data-test=bread1]').contains('Juralio').should('be.visible')
      })
    })
    describe('when attempting to save a blank name', () => {
      before(() => {
        cy.get('body').type('{esc}')
        cy.get('[data-test=template-options-button]').eq(1).click({ force: true })
        cy.get('[data-test="rename-template"]').click()
        cy.get('[data-test=juralio-dialog]').should('be.visible')
        cy.wait(500)
        cy.get('[data-test=rename-field]').find('input').focus()
        cy.get('[data-test=rename-field]')
          .find('input')
          .clear({ force: true })
          .type('{Enter}', { force: true })
      })

      it('should disable the submit', () => {
        cy.get('[data-test="action-dialog-button"]').should('exist')
      })
    })
  })
})
