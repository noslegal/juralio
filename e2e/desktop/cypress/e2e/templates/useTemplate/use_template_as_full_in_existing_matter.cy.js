import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createTemplate,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const newTemplateName = nameGenerator.generate().spaced

describe('use_template_as_full_in_existing_matter.cy', () => {
  const visitHelpers = new VisitHelpers()
  let user, fixture, newTemplate

  before(() => {
    createUser('', true, true, {
      roles: ['ROLE_KNOWLEDGE_MANAGER'],
    }).then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'Tree',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [{}],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('When visiting the template overview', () => {
    before(() => {
      cy.login(user.username)
      createTemplate(newTemplateName, fixture.projects[0].id)
        .then(template => {
          newTemplate = template
        })
        .then(() => {
          publishTemplate(newTemplate.id)
          visitHelpers.visitTemplateOverview(newTemplate.id)
        })
    })

    it('should have map displayed', () => {
      cy.get('[data-test=container]').should('have.length', 1)
    })

    it('should have 2 cells in total', () => {
      cy.get('[data-test=cell]').should('have.length', 2)
    })

    describe('when the "Use template" button is clicked"', () => {
      before(() => {
        cy.get('[data-test=use-template-button]').click()
      })

      describe('The Use this template dialog appears', () => {
        it('should have the header text', () => {
          cy.get('[data-test=dialog-header-title-text]').should(
            'have.text',
            'Whole or part of template?'
          )
        })

        describe('and clicked through via full template option', () => {
          before(() => {
            cy.get('[data-test=use-full-template-radio]').click()
            cy.get('[data-test=action-dialog-button]').click()
          })

          it('it should should the destination dialog', () => {
            cy.get('[data-test=dialog-header-title-text]').should('be.visible')
          })

          it('should have correct dialog title', () => {
            cy.get('[data-test=dialog-header-title-text]').should(
              'have.text',
              'Choose a destination for your template'
            )
          })
        })
      })
    })
  })
})
