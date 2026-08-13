import {
    generateFixture, getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'

describe('template_taskmap_copy.cy', () => {
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
            prefix: 'template_taskmap_copy.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                tasks: [
                  {
                    tasks: [{}, {}, {}, {}],
                  },
                  {},
                  {},
                  {},
                  {},
                ],
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
            appPage.visitTemplateTaskMap(template.id)
          }
        )
      })
  })

  it('should display the name of the project', () => {
    cy.get('[data-test=bread1]').should('have.text', template.name)
  })

  describe('When clicking on the copy template button', () => {
    before(() => {
      cy.get('[data-test=template-options-button]').click()
      cy.get('[data-test=menu-text-copy-template]').click()
    })

    it('should display a confirmation dialog', () => {
      cy.get('[data-test=dialog-header-title-text]')
        .should('be.visible')
        .should('have.text', 'Copy template')
    })

    describe('when the copy is cancelled', () => {
      before(() => {
        cy.get('[data-test=cancel-dialog-button]').click({
          multiple: true,
          force: true,
        })
      })

      it('should hide the dialog', () => {
        cy.get('[data-test=dialog-header-title-text]').should('not.exist')
      })

      describe('When clicking on the copy template menu item', () => {
        before(() => {
          cy.get('[data-test=template-options-button]').click()
          cy.get('[data-test=menu-text-copy-template]').click()
        })

        it('should display a confirmation dialog', () => {
          cy.get('[data-test=dialog-header-title-text]').should('be.visible')
        })

        describe('when the copy is actioned', () => {
          before(() => {
            cy.get('[data-test=text-prompt-text-field]')
              .find('input')
              .type('Twin Template{enter}')
          })

          it('should hide the dialog and stay on the template taskmap', () => {
            cy.get('[data-test=dialog-header-title-text]').should('not.exist')
          })

          it('should display the name of the project', () => {
            cy.get('[data-test=bread1]').should('have.text', 'Twin Template')
          })
        })
      })
    })
  })
})
