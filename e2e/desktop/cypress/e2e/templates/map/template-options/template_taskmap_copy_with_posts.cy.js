import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import template_posts_helper from '../../../../../../helpers/templates/posts/template_posts_helper'
import { createTemplate } from '../../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'

describe('template_taskmap_copy_with_posts.cy', () => {
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
                    tasks: [{ name: 'Task 1', posts: [{ name: 'a' }] }],
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
            cy.get('[data-test=task-cell-test]', { timeout: 30000 })
              .eq(1)
              .click('left')
            cy.get('[data-test=create-post-button]', { timeout: 30000 }).click()
            cy.get('[data-test=blank-note]').eq(0).click()
            template_posts_helper.completeNoteNameDialog({
              waitForCreate: false,
            })
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
      cy.login(user.username)
      appPage.visitTemplateTaskMap(template.id)
      cy.get('[data-test=template-options-button]', { timeout: 30000 }).click()
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
          cy.get('[data-test=template-options-button]', {
            timeout: 30000,
          }).click()
          cy.get('[data-test=menu-text-copy-template]').click()
        })

        it('should display a confirmation dialog with post checkbox', () => {
          cy.get('[data-test=dialog-header-title-text]').should('be.visible')
          cy.get('[data-test=include-posts-checkbox]').should('be.visible')
        })

        describe('when the copy is actioned with post button being toggled', () => {
          before(() => {
            cy.get('[data-test=text-prompt-text-field]')
              .find('input')
              .type('Twin Template')
            cy.wait(2000)
            cy.get('[data-test=action-dialog-button]').click()
          })

          it('should hide the dialog and stay on the template taskmap', () => {
            cy.get('[data-test=dialog-header-title-text]').should('not.exist')
          })

          it('should display the name of the project and have 1 post', () => {
            cy.get('[data-test=bread1]').should('have.text', 'Twin Template')
            cy.wait(2000)
            cy.get('[data-test="post-count"]').should('contain.text', '1')
          })
        })
      })
    })
  })
})
