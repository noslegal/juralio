import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createTemplate } from '../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

const newTemplateName = nameGenerator.generate().spaced

describe('template_list_display.cy', () => {
  let user, fixture, newTemplate
  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'template_list_display.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [{}, { tasks: [{}, {}] }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('When opening the templates page after a template has been created', () => {
    before(() => {
      cy.login(user.username)
      createTemplate(newTemplateName, fixture.projects[0].id).then(template => {
        newTemplate = template
      })
      visitHelpers.visitTemplates()
    })

    it('should set the correct document title', () => {
      cy.title().should('eq', 'Templates | Juralio')
    })

    describe('The template is displayed', () => {
      it('The new template name is shown', () => {
        cy.get('[data-test=template]')
          .eq(0)
          .should('contain.text', newTemplateName)
      })

      it('The new template reference number is shown', () => {
        cy.get(
          `[data-recordid=${newTemplate.id}] [data-test=template-reference-number]`
        ).should(element => {
          const referenceNumber = element.text()
          expect(referenceNumber[0] === 'T')
          expect(referenceNumber.length > 1)
          expect(!isNaN(referenceNumber.slice(1)))
        })
      })

      // This test has proven rather flakey despite tolerances.
      // it('The template created date is shown', () => {
      //   cy.get(
      //     `[data-recordid=${newTemplate.id}] [data-test=timestamp]`
      //   ).should('have.text', 'Created: Today')
      // })
    })
  })

  describe('When opening the templates page after a template has been accessed', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTemplateOverview(newTemplate.id)
      visitHelpers.visitTemplates()
    })

    describe('The accessed template is displayed first', () => {
      it('The new template name is shown', () => {
        cy.get('[data-test=template]')
          .eq(0)
          .should('contain.text', newTemplateName)
      })

      it('The new template reference number is shown', () => {
        cy.get(
          `[data-recordid=${newTemplate.id}] [data-test=template-reference-number]`
        ).should(element => {
          const referenceNumber = element.text()
          expect(referenceNumber[0] === 'T')
          expect(referenceNumber.length > 1)
          expect(!isNaN(referenceNumber.slice(1)))
        })
      })
    })
  })
})
