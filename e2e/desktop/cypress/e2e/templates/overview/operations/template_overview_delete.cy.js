import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../../helpers/templates/template_api_helper'
import {
  createKnowledgeManagerUser,
  createOrganisationUser,
} from '../../../../../../helpers/users/user_api_helper'

describe('template_overview_delete.cy', () => {
  let user,
    testUser2,
    fixture,
    appPage,
    template,
    newTemplateName = 'Test Template'

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      createOrganisationUser({
        firstname: 'User' + 1,
        lastname: 'User' + 1,
        username: 1 + 'juruser' + new Date().getMilliseconds() + '@juralio.com',
        email: 1 + 'juruser' + new Date().getMilliseconds() + '@juralio.com',
      })
        .then(user2 => {
          testUser2 = user2

          const seed = {
            matter: {
              prefix: 'template_overview_delete.cy',
              teamMembers: [user, testUser2],
              matterAdmins: [user],
              projects: [
                {
                  tasks: [],
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
  })

  it('should display the name of the project', () => {
    cy.get('[data-test=bread1]').should('have.text', template.name)
  })

  describe('When clicking on the delete template button', () => {
    before(() => {
      cy.get('[data-test=template-options-button]').eq(1).click()
      cy.get('[data-test=menu-text-delete-template]').click()
    })

    it('should display a confirmation dialog', () => {
      cy.get('[data-test=dialog-header-title-text]')
        .should('be.visible')
        .should('have.text', 'Delete template?')
    })

    describe('when the delete is cancelled', () => {
      before(() => {
        cy.get('[data-test=cancel-dialog-button]').click({
          force: true,
          multiple: true,
        })
      })

      it('should hide the dialog and stay on the template overview', () => {
        cy.get('[data-test=dialog-header-title-text]').should('not.exist')
      })

      describe('When clicking on the delete template menu item', () => {
        before(() => {
          cy.get('[data-test=template-options-button]').eq(1).click()
          cy.get('[data-test=menu-text-delete-template]').click({
            force: true,
            multiple: true,
          })
        })

        it('should display a confirmation dialog', () => {
          cy.get('[data-test=dialog-header-title-text]')
            .should('be.visible')
            .should('have.text', 'Delete template?')
        })

        describe('when the delete is actioned', () => {
          before(() => {
            cy.get('[data-test=action-dialog-button]').eq(1).click()
          })

          it('shows a snackbar with a message as "Template deleted"', () => {
            cy.get('[data-test=snackbar-message]')
              .should('be.visible')
              .should('contain', 'Template deleted')
          })

          it('should return to templates list', () => {
            cy.get('[data-test=dialog-header-title-text]').should('not.exist')
            cy.title().should('eq', 'Overview | Test Template | Juralio')
          })

          it('The deleted template is not shown', () => {
            cy.get(
              `[data-recordid=${template.id}] [data-test=template-name]`
            ).should('not.exist')
          })
        })
      })
    })
  })
  describe('as a regular user', () => {
    before(() => {
      cy.login(testUser2.username)
      appPage.visitTemplateOverview(template.id)
    })
    it('should not let me delete', () => {
      cy.get('[data-test=template-options-button]').should('not.exist')
    })
  })
})
