import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

describe('template_task_link_display.cy', () => {
  let user,
    fixture,
    template,
    appPage,
    visitHelpers,
    newTemplateName = 'Test Template For Posts'

  before(() => {
    createKnowledgeManagerUser()
      .then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'template_map.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'Project 1',
                tasks: [{ name: 'aaaa' }, { name: 'bbbb' }],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
        visitHelpers = new VisitHelpers()
        appPage = getWrapper(fixture)
      })
      .then(() => {
        cy.login(user.username)
        createTemplate(newTemplateName, fixture.projects[0].id).then(
          createdTemplate => {
            template = createdTemplate
            visitHelpers.visitTemplateTaskDetails(
              template.id,
              template.tasks[0].id
            )
          }
        )
      })
  })

  it('should show the zero state when no posts exist', () => {
    cy.get('[data-test="zero-state-image"]').should('be.visible')
  })

  describe('when a template task note is created from the zero state', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTemplateTaskDetails(template.id, template.tasks[0].id)
      cy.get('[data-test=create-post-button]').click()
      cy.get('[data-test=web-link]').click()
    })

    it('the create button should be disabled', () => {
      cy.get('[data-test=action-dialog-button]').should('be.disabled')
    })

    it('the edit destination should be hidden', () => {
      cy.get('[data-test=task-creation-destination-field-edit]').should(
        'not.be.visible'
      )
    })

    describe('when completing a name for the new template note', () => {
      before(() => {
        cy.get('[data-test=text-prompt-text-field]').type('a new note')
        cy.get('[data-test=link-url]').type('https://wikipedia.org')
      })

      it('the create button should be enabled', () => {
        cy.get('[data-test=action-dialog-button]').should('be.enabled')
      })

      it('the edit destination should be shown', () => {
        cy.get('[data-test=task-creation-destination-field-edit]').should(
          'be.visible'
        )
      })
    })
  })

  describe('when a template task note is created from the the FAB button out-of-context', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTemplateTaskMap(template.id)
      cy.get('[data-test=fab-button]').click()
      cy.wait(5000)
      cy.get('[data-test=create-post-fab-button]').click()
      cy.get('[data-test=web-link]').click()
    })

    it('the next button should be disabled', () => {
      cy.get('[data-test=action-dialog-button]').should('be.disabled')
    })

    describe('after typing the new note name', () => {
      before(() => {
        cy.get('[data-test=text-prompt-text-field]').type('a new note')
        cy.get('[data-test=link-url]').type('https://wikipedia.org')
      })

      it('the create button should be enabled', () => {
        cy.get('[data-test=action-dialog-button]').should('be.enabled')
      })

      describe('before choosing destination', () => {
        before(() => {
          cy.get('[data-test=action-dialog-button]').click()
        })

        it('the create button should be disabled', () => {
          cy.get('[data-test=action-dialog-button]').should('be.disabled')
        })

        describe('after choosing destination', () => {
          before(() => {
            cy.get('[data-test=task-select-base]').click()
            cy.get('[data-test=auto-complete-search-term]')
              .last()
              .find('input')
              .type('a')
            cy.get('[data-test=search-result-list-item]').first().click()
          })

          it('the create button should be enabled', () => {
            cy.get('[data-test=action-dialog-button]').should('be.enabled')
          })
        })
      })
    })
  })
})
