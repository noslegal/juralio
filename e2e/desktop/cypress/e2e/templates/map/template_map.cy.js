import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

const newTemplateName = nameGenerator.generate().spaced

describe('template_map.cy', () => {
  let user, fixture, newTemplate

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'template_map.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {},
                {},
                { tasks: [{}, { tasks: [{}, { tasks: [{}, {}, {}] }] }] },
                {},
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('When clicking on the template card in the templates list after a template has been created', () => {
    before(() => {
      cy.login(user.username)
      createTemplate(newTemplateName, fixture.projects[0].id).then(template => {
        newTemplate = template
        cy.visit('/#/templates')
        cy.get(
          `[data-recordid=${newTemplate.id}] [data-test=template-name]`
        ).click()
        cy.get('[data-test=taskmap-navigation]').click()
      })
    })

    it('should open template task page', () => {
      cy.url().should('contains', `template/${newTemplate.id}/taskmap`)
    })

    it('should have 12 cells in total', () => {
      cy.get('[data-test=task-cell-test]').should('have.length', 11)
    })

    it('should display a "Use template" button', () => {
      cy.get('[data-test="publish-template"]').click()
      cy.get('[data-test="action-dialog-button"]').click()
      cy.get('[data-test=use-template-button]').should(
        'have.text',
        'Use this template'
      )
    })

    it('should display the template options button', () => {
      cy.get('[data-test=template-options-button]').should('be.visible')
    })
  })
})
