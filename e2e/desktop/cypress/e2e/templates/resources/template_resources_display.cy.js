import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import {
  createKnowledgeManagerUser,
  createUser,
} from '../../../../../helpers/users/user_api_helper'

describe('template_resource_display.cy', () => {
  let testUser,
    fixture,
    project,
    template,
    appPage,
    user2,
    newTemplateName = 'Test Template'

  before(() => {
    createKnowledgeManagerUser()
      .then(createdUser => {
        testUser = createdUser
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
      .then(() => {
        project = fixture.projects[0]
        createUser('', true, true, {}, false, false).then(u => (user2 = u))
      })
  })

  describe('When navigating to template', () => {
    before(() => {
      cy.login(testUser.username)
      createTemplate(newTemplateName, project.id).then(createdTemplate => {
        template = createdTemplate
        appPage.visitTemplateOverview(template.id)
      })
    })
    it('should have zero resources', () => {
      cy.get('[data-test=resource-count]').should('have.text', '0 Resources')
    })
    describe('when looking at the template content', () => {
      before(() => {
        cy.wait(5000)
        cy.get('[data-test=menuItem]', { timeout: 30000 })
          .eq(1)
          .click({ force: true })
      })
      it('should show the template resources section', () => {
        cy.get('[data-test=resources-title]').should(
          'contain.text',
          'Template resources'
        )
        cy.get('[data-test=card]').should('not.exist')
      })
      describe('when adding a resource', () => {
        before(() => {
          cy.get('[data-test=add-resource-button]').click()
          cy.get('[data-test=add-resource-name]')
            .find('input')
            .type('resource-1')
          cy.get('[data-test=link-url]')
            .find('input')
            .type('https://google.com')
          cy.get('[data-test=action-dialog-button]').click()
        })
        it('should display the resource', () => {
          cy.get('[data-test=card]').should('have.length', 2)
        })
        describe('when reaching the limit', () => {
          before(() => {
            for (let i = 2; i < 16; i++) {
              cy.get('[data-test=add-resource-button]').click()
              cy.get('[data-test=add-resource-name]')
                .find('input')
                .type(`resource-${i}`)
              cy.get('[data-test=link-url]')
                .find('input')
                .type('https://google.com')
              cy.get('[data-test=action-dialog-button]').click()
            }
          })
          it('shouldn not allow the 15th resource', () => {
            cy.get('[data-test=add-resource-button]').should('be.disabled')
          })
          describe('after deleting a resource', () => {
            before(() => {
              cy.get('[data-test=card-options]').eq(0).click()
              cy.get('[data-test=delete-option]').click()
              cy.get('[data-test=action-dialog-button]').click()
            })
            it('should enable the add buttin', () => {
              cy.get('[data-test=add-resource-button]').should(
                'not.be.disabled'
              )
            })
            describe('when viewing as a non-knowledge manager', () => {
              before(() => {
                cy.get('[data-test="publish-template"]').click()
                cy.wait(3000)
                cy.get('[data-test=action-dialog-button]').click()
                cy.login(user2.username)
                appPage.visitTemplateOverview(template.id)
                cy.get('[data-test=menuItem]', { timeout: 30000 })
                  .eq(1)
                  .click({ force: true })
              })
              it('should not show the add or options', () => {
                cy.get('[data-test=card-options]').should('not.exist')
                cy.get('[data-test=add-resource-button]').should('be.disabled')
              })
            })
          })
        })
      })
    })
  })
})
