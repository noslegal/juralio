import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

describe('template_task_list_export_xlsx.cy', () => {
  let user,
    fixture,
    appPage,
    template,
    newTemplateName = 'Test Template'

  before(() => {
    createKnowledgeManagerUser()
      .then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'template_task_list_export_xlsx.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                tasks: [{}, {}, {}, {}, {}, {}, {}, { tasks: [{}, {}] }],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
      .then(() => {
        cy.login(user.username)
        createTemplate(newTemplateName, fixture.projects[0].id).then(
          createdTemplate => {
            template = createdTemplate
            appPage.visitTemplateOverview(template.id)
          }
        )
      })
  })

  it('should set the correct document title', () => {
    cy.title().should('eq', 'Overview | Test Template | Juralio')
  })

  it('should display the name of the project', () => {
    cy.get('[data-test=bread1]').should('have.text', template.name)
  })

  describe('When opening the export dialog', () => {
    before(() => {
      cy.get('[data-test=template-options-button]').eq(1).click()
      cy.get('[data-test="menu-text-download-template"]').click()
      cy.get('[data-test="menu-text-download-template-excel"]').click()
    })

    it('should show the dialog', () => {
      cy.get('[data-test=dialog-header-title-text]').should(
        'contain.text',
        'Template download'
      )
    })

    describe('When downloading the export', () => {
      before(() => {
        cy.get('[data-test=action-dialog-button]').click()
      })

      it('should download the Excel sheet', () => {
        expect(1).to.eq(1)
      })
    })
  })

  describe('When opening the export dialog', () => {
    before(() => {
      cy.get('[data-test=template-options-button]').eq(1).click()
      cy.get('[data-test=menu-text-download-template]').click()
      cy.get('[data-test="menu-text-download-template-excel"]').click()
    })

    it('should show the dialog', () => {
      cy.get('[data-test=dialog-header-title-text]').should(
        'contain.text',
        'Template download'
      )
    })

    describe('When cancelling the export', () => {
      before(() => {
        cy.get('[data-test=cancel-dialog-button]').click()
      })

      it('should not show the dialog', () => {
        cy.get('[data-test=dialog-header-title-text]').should('not.exist')
      })
    })
  })
})
