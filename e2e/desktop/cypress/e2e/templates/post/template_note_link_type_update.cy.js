import { populateLinkDetails } from '../../../../../helpers/links/task_content_links_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

describe('template_note_link_type_update.cy', () => {
  let appPage, fixture, testUser
  const newTemplateName = 'test template'
  const visitHelpers = new VisitHelpers()

  const types = [
    'Word document',
    'Excel sheet',
    'Powerpoint',
    'Email',
    'Web link',
    'Document',
  ]
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
                name: 'A workstream',
                tasks: [{ name: 'task A' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
      .then(() => {
        cy.login(testUser.username)
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
      .then(() => {
        appPage = getWrapper(fixture)
      })
  })
  describe('after creating a new post', () => {
    before(() => {
      for (let i = 0; i < 2; i++) {
        cy.get('[data-test=fab-button]').click()
        cy.wait(5000)
        cy.get('[data-test=create-post-fab-button]').click()
        cy.get('[data-test=web-link]').click()
        populateLinkDetails('New Link', 'https://' + i + '.com', 'link')
        cy.backendRoute('POST', '/projecttemplates/*/tasks/*/posts').as(
          'postNote'
        )
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait('@postNote')
      }
      for (let i = 0; i < 2; i++) {
        cy.get('[data-test=fab-button]').click()
        cy.wait(5000)

        cy.get('[data-test=create-post-fab-button]').click()
        cy.get('[data-test=document-link]').click()
        populateLinkDetails('New Link', 'https://' + i + '.com', 'link')
        cy.backendRoute('POST', '/projecttemplates/*/tasks/*/posts').as(
          'postNote'
        )
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait('@postNote')
      }

      cy.get('[data-test=fab-button]').click()
      cy.wait(5000)

      cy.get('[data-test=create-post-fab-button]').click()
      cy.get('[data-test=blank-note]').click()
      cy.get('[data-test=text-prompt-text-field]').type('Blank Post')

      cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/posts').as(
        'postNote'
      )
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(['@postNote'])

      cy.get('[data-test=fab-button]').click()
      cy.wait(5000)

      cy.get('[data-test=create-post-fab-button]').click()
      cy.get('[data-test=blank-note]').click()
      cy.get('[data-test=text-prompt-text-field]').type('blank Post')

      cy.backendRoute('POST', '/projecttemplates/*/tasks/*/posts').as(
        'postNote'
      )
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(['@postNote'])
      cy.wait(3000)
      cy.get('[data-test=task-content-header-menu-close-button]').click({
        force: true,
      })
    })
    it('should make 6 posts', () => {
      cy.get('[data-test=note-list-item]').should('have.length', '6')
    })
    describe('when looking at a blank note', () => {
      before(() => {
        cy.get('[data-test=note-list-item]').eq(0).click()
      })
      it('should not render the type dropdown', () => {
        cy.get('[data-test=link-type-dropdown]').should('not.exist')
      })
    })
    for (let i = 1; i < 5; i++) {
      describe('when looking at a link note', () => {
        before(() => {
          cy.get('[data-test=note-list-item]').eq(i).click({ force: true })
          cy.wait(1000)
        })
        it('should not render the type dropdown', () => {
          cy.get('[data-test=link-type-dropdown]').should('exist')
        })
        describe('picking a new type', () => {
          before(() => {
            cy.get('[data-test=link-type-dropdown]').click()
            cy.get('[data-test=link-type-option]')
              .eq(i - 1)
              .click({ force: true })
          })
          it('should update', () => {
            cy.get('[data-test=link-type-dropdown]').should(
              'contain.text',
              types[i - 1]
            )
          })
        })
      })
    }
  })
})
