import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { selectTemplateTaskAndConfirm } from '../../../../../helpers/templates/project_from_template_helper'
import {
  createTemplate,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import templateSourceDialogPage from '../../../../../page/templatesourcedialog/templatesourcedialog_page'

const newTemplateName = nameGenerator.generate().spaced

describe('use_template_partial_as_matter.cy', () => {
  const visitHelpers = new VisitHelpers()
  let user, fixture, newTemplate

  before(() => {
    createUser('', true, true, {
      roles: ['ROLE_MATTER_CREATOR', 'ROLE_KNOWLEDGE_MANAGER'],
    }).then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'project ',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [{}, {}],
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

    it('should have 12 cells in total', () => {
      cy.get('[data-test=cell]').should('have.length', 3)
    })

    describe('and clicked through via partial template option', () => {
      before(() => {
        selectTemplateTaskAndConfirm(1)
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

      describe('and entering matter details', () => {
        before(() => {
          cy.get('[data-test=new-matter-button]').click()
          cy.get('[data-test=action-dialog-button]').click()
        })
        it('should only let you advance when all fields have been filled', () => {
          cy.get('[data-test=client-name]', { timeout: 30000 }).type('c')
          cy.get('[data-test=action-dialog-button]').should('be.disabled')
          cy.get('[data-test=name]').eq(2).type('m')
          cy.get('[data-test=reference-number]').clear()
          cy.get('[data-test=action-dialog-button]').should('be.disabled')
          cy.get('[data-test=reference-number]').type('1234')
          cy.get('[data-test=action-dialog-button]').should('not.be.disabled')
        })

        describe('When in the new matter', () => {
          before(() => {
            cy.backendRoute('POST', '/matters').as('postMatter')
            templateSourceDialogPage.get.createButton().click()
            cy.wait('@postMatter')
          })

          it('should navigate to the matter overview', () => {
            cy.url().should('contains', '/matter')
            cy.url().should('contains', '/overview')
          })

          it('should have added the tasks to the workstream', () => {
            cy.get('[data-test=add-task-button]').click()
            cy.get('[data-test="task-cell-test"]').should('contain', 1)
          })
        })
      })
    })
  })
})
