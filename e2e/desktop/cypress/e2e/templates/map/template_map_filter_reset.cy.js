import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

describe('template_map_filter_reset.cy', () => {
  let user, fixture, appPage, newTemplate
  const visitHelpers = new VisitHelpers()
  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'template_map_filter_reset.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [{ name: 'MOON', isMilestone: true }, { name: 'STARS' }],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
  })
  describe('when switching to a template after filtering', () => {
    before(() => {
      const newTemplateName = nameGenerator.generate().spaced

      cy.login(user.username)
      createTemplate(newTemplateName, fixture.projects[0].id).then(template => {
        newTemplate = template
      })
      visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
      cy.get('[data-test=minimised-filters]').click()
      cy.get('[data-test=task-type-milestone]').click({ force: true })
      cy.wait(3000)
      // cy.get('body').click()
    })
    describe('when visiting the template', () => {
      before(() => {
        visitHelpers.visitTemplateTaskMap(newTemplate.id)
      })
      it('should not highlight the milestone tasks', () => {
        cy.get('[data-test=task-cell-test]')
          .eq(0)
          .should('have.css', 'background-color')
          .and('eq', 'rgb(206, 201, 237)')
        cy.get('[data-test=task-cell-test]')
          .eq(1)
          .should('have.css', 'background-color')
          .and('eq', 'rgb(206, 201, 237)')
      })
    })
  })
})
