import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import {
  createKnowledgeManagerUser,
  createUser,
} from '../../../../../helpers/users/user_api_helper'

describe('template_publishing.cy', () => {
  let testUser,
    regularUser,
    fixture,
    project,
    template,
    appPage,
    newTemplateName = 'Test Template'

  before(() => {
    createKnowledgeManagerUser()
      .then(createdUser => {
        testUser = createdUser
        createUser().then(createdUser => {
          regularUser = createdUser
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
      })
      .then(() => {
        project = fixture.projects[0]
      })
  })

  describe('when a knowledge manager creates a new template', () => {
    before(() => {
      cy.login(testUser.username)
      createTemplate(newTemplateName, project.id).then(createdTemplate => {
        template = createdTemplate
      })
    })

    describe('when navigating to the template overview as a KNOWLEDGE MANAGER', () => {
      before(() => {
        cy.login(testUser.username)
        appPage.visitTemplateOverview(template.id)
      })

      it('should have the use template button disabled', () => {
        cy.get('[data-test=use-template-button]').should('not.exist')
      })

      describe('when the template is published', () => {
        before(() => {
          cy.get('[data-test="publish-template"]').click()
          cy.wait(3000)
          cy.get('[data-test=action-dialog-button]').click()
        })

        it('should have the template in published state', () => {
          cy.get('[data-test=publish-template]').should('not.exist')
        })

        it('should have the use template button enabled', () => {
          cy.get('[data-test=use-template-button]').should('not.be.disabled')
        })

        describe('when navigating to the template overview as a REGULAR USER', () => {
          before(() => {
            cy.login(regularUser.username)
            appPage.visitTemplateOverview(template.id)
          })

          it('should show the published template', () => {
            cy.get('[data-test=bread1]').should('contain.text', newTemplateName)
          })

          it('should have the correct number of tasks', () => {
            cy.get('[data-test=task-count]').should('contain.text', '1 Tasks')
          })
        })
      })

      describe('when the template is unpublished', () => {
        before(() => {
          cy.login(testUser.username)
          appPage.visitTemplateTaskMap(template.id)
          cy.wait(2000)
          cy.get('[data-test=template-options-button]').eq(0).click()
          cy.get('[data-test=menu-text-unpublish-template]').click()
        })
        it('should have the template in published state', () => {
          cy.get('[data-test=publish-template]').should('exist')
        })

        it('should have the use template button enabled', () => {
          cy.get('[data-test=use-template-button]').should('not.exist')
        })

        describe('when navigating to the template overview as a REGULAR USER', () => {
          before(() => {
            cy.login(regularUser.username)
            appPage.visitTemplateOverview(template.id)
          })

          it('should not show the draft template', () => {
            cy.get('[data-test=bread1]').should(
              'not.contain.text',
              newTemplateName
            )
          })

          it('should not show the number of tasks', () => {
            cy.get('[data-test=task-count]').should('not.contain.text', '1')
          })
        })
      })
    })
  })
})
